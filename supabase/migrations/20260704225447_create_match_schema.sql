create extension if not exists pgcrypto with schema extensions;

create table public.match_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  status text not null default 'waiting',
  filter_slug text not null default 'tudo',
  max_participants int not null default 2,
  creator_participant_id uuid null,
  match_food_id uuid null references public.foods(id) on delete set null,
  created_at timestamptz not null default now(),
  started_at timestamptz null,
  matched_at timestamptz null,
  expires_at timestamptz not null default now() + interval '2 hours',
  constraint match_rooms_code_length check (char_length(code) = 6),
  constraint match_rooms_code_uppercase check (code = upper(code)),
  constraint match_rooms_status_check check (
    status in ('waiting', 'active', 'matched', 'expired')
  ),
  constraint match_rooms_filter_slug_check check (
    filter_slug in ('tudo', 'sobremesa', 'fome-grande', 'regional', 'estrangeira')
  ),
  constraint match_rooms_max_participants_check check (max_participants >= 2)
);

create table public.match_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.match_rooms(id) on delete cascade,
  nickname text not null,
  token_hash text not null,
  is_creator boolean not null default false,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz null,
  constraint match_participants_room_token_hash_key unique (room_id, token_hash)
);

create table public.match_room_items (
  room_id uuid not null references public.match_rooms(id) on delete cascade,
  food_id uuid not null references public.foods(id) on delete cascade,
  position int not null,
  primary key (room_id, food_id),
  constraint match_room_items_position_key unique (room_id, position),
  constraint match_room_items_position_positive check (position >= 1)
);

create table public.match_votes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.match_rooms(id) on delete cascade,
  participant_id uuid not null references public.match_participants(id) on delete cascade,
  food_id uuid not null references public.foods(id) on delete cascade,
  vote text not null,
  created_at timestamptz not null default now(),
  constraint match_votes_room_participant_food_key unique (room_id, participant_id, food_id),
  constraint match_votes_vote_check check (vote in ('like', 'dislike'))
);

alter table public.match_rooms
  add constraint match_rooms_creator_participant_id_fkey
  foreign key (creator_participant_id)
  references public.match_participants(id)
  on delete set null;

create index match_participants_room_id_idx on public.match_participants(room_id);
create index match_rooms_expires_at_idx on public.match_rooms(expires_at);
create index match_room_items_room_id_idx on public.match_room_items(room_id);
create index match_votes_room_id_idx on public.match_votes(room_id);
create index match_votes_room_food_vote_idx on public.match_votes(room_id, food_id, vote);

alter table public.match_rooms replica identity full;
alter table public.match_participants replica identity full;
alter table public.match_votes replica identity full;

alter table public.match_rooms enable row level security;
alter table public.match_participants enable row level security;
alter table public.match_room_items enable row level security;
alter table public.match_votes enable row level security;

grant select (
  id,
  code,
  status,
  filter_slug,
  max_participants,
  creator_participant_id,
  match_food_id,
  created_at,
  started_at,
  matched_at,
  expires_at
) on public.match_rooms to anon;

grant select (
  id,
  room_id,
  nickname,
  is_creator,
  joined_at,
  last_seen_at
) on public.match_participants to anon;

grant select (
  room_id,
  food_id,
  position
) on public.match_room_items to anon;

grant select (
  id,
  room_id,
  participant_id,
  food_id,
  vote,
  created_at
) on public.match_votes to anon;

create policy "public read active match rooms"
on public.match_rooms
for select
to anon
using (expires_at > now());

create policy "public read active match participants"
on public.match_participants
for select
to anon
using (
  exists (
    select 1
    from public.match_rooms room
    where room.id = room_id
      and room.expires_at > now()
  )
);

create policy "public read active match room items"
on public.match_room_items
for select
to anon
using (
  exists (
    select 1
    from public.match_rooms room
    where room.id = room_id
      and room.expires_at > now()
  )
);

create policy "public read active match votes"
on public.match_votes
for select
to anon
using (
  exists (
    select 1
    from public.match_rooms room
    where room.id = room_id
      and room.expires_at > now()
  )
);

create or replace function public.normalize_match_room_code(p_code text)
returns text
language sql
immutable
strict
set search_path = public
as $$
  select upper(regexp_replace(btrim(p_code), '\s+', '', 'g'));
$$;

create or replace function public.normalize_match_filter_slug(p_filter_slug text)
returns text
language sql
immutable
strict
set search_path = public
as $$
  select lower(btrim(p_filter_slug));
$$;

create or replace function public.hash_match_token(p_client_token text)
returns text
language sql
immutable
strict
set search_path = public, extensions
as $$
  select encode(digest(btrim(p_client_token), 'sha256'), 'hex');
$$;

create or replace function public.generate_match_room_code()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code text := '';
  v_index int;
begin
  for v_index in 1..6 loop
    v_code := v_code || substr(
      v_alphabet,
      1 + floor(random() * char_length(v_alphabet))::int,
      1
    );
  end loop;

  return v_code;
end;
$$;

create or replace function public.create_match_room(
  p_nickname text,
  p_filter_slug text,
  p_client_token text
)
returns table (
  room_id uuid,
  code text,
  participant_id uuid,
  is_creator boolean,
  status text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_nickname text := btrim(p_nickname);
  v_filter_slug text := public.normalize_match_filter_slug(coalesce(p_filter_slug, ''));
  v_client_token text := btrim(coalesce(p_client_token, ''));
  v_token_hash text;
  v_room_id uuid;
  v_participant_id uuid;
  v_code text;
  v_item_count int := 0;
begin
  if char_length(v_nickname) < 2 or char_length(v_nickname) > 32 then
    raise exception 'Escolha um apelido entre 2 e 32 caracteres.';
  end if;

  if v_filter_slug not in ('tudo', 'sobremesa', 'fome-grande', 'regional', 'estrangeira') then
    raise exception 'Escolha um filtro válido para criar a sala.';
  end if;

  if char_length(v_client_token) < 16 then
    raise exception 'Não conseguimos validar este celular. Tente novamente.';
  end if;

  v_token_hash := public.hash_match_token(v_client_token);

  loop
    begin
      v_code := public.generate_match_room_code();

      insert into public.match_rooms (
        code,
        status,
        filter_slug,
        max_participants,
        expires_at
      )
      values (
        v_code,
        'waiting',
        v_filter_slug,
        2,
        now() + interval '2 hours'
      )
      returning id into v_room_id;

      exit;
    exception
      when unique_violation then
        null;
    end;
  end loop;

  insert into public.match_participants (
    room_id,
    nickname,
    token_hash,
    is_creator,
    last_seen_at
  )
  values (
    v_room_id,
    v_nickname,
    v_token_hash,
    true,
    now()
  )
  returning id into v_participant_id;

  update public.match_rooms
  set creator_participant_id = v_participant_id
  where id = v_room_id;

  with candidate_foods as (
    select distinct
      food.id as food_id
    from public.foods food
    left join public.roulette_group_foods group_food
      on group_food.food_id = food.id
    left join public.roulette_groups roulette_group
      on roulette_group.id = group_food.group_id
    where food.is_active = true
      and (
        v_filter_slug = 'tudo'
        or (
          roulette_group.slug = v_filter_slug
          and roulette_group.is_active = true
        )
      )
  ),
  ordered_foods as (
    select
      food_id,
      row_number() over (
        order by md5(v_room_id::text || food_id::text), food_id
      ) as position
    from candidate_foods
    order by md5(v_room_id::text || food_id::text), food_id
    limit 50
  ),
  inserted_items as (
    insert into public.match_room_items (room_id, food_id, position)
    select
      v_room_id,
      food_id,
      position
    from ordered_foods
    returning 1
  )
  select count(*) into v_item_count
  from inserted_items;

  if v_item_count = 0 then
    delete from public.match_rooms
    where id = v_room_id;

    raise exception 'Esse filtro está sem opções agora. Tente outro em instantes.';
  end if;

  return query
  select
    room.id,
    room.code,
    v_participant_id,
    true,
    room.status,
    room.expires_at
  from public.match_rooms room
  where room.id = v_room_id;
end;
$$;

create or replace function public.join_match_room(
  p_code text,
  p_nickname text,
  p_client_token text
)
returns table (
  room_id uuid,
  code text,
  participant_id uuid,
  is_creator boolean,
  status text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_code text := public.normalize_match_room_code(coalesce(p_code, ''));
  v_nickname text := btrim(p_nickname);
  v_client_token text := btrim(coalesce(p_client_token, ''));
  v_token_hash text;
  v_room public.match_rooms%rowtype;
  v_participant public.match_participants%rowtype;
  v_participant_count int;
begin
  if char_length(v_code) <> 6 then
    raise exception 'Digite um código de sala válido.';
  end if;

  if char_length(v_nickname) < 2 or char_length(v_nickname) > 32 then
    raise exception 'Escolha um apelido entre 2 e 32 caracteres.';
  end if;

  if char_length(v_client_token) < 16 then
    raise exception 'Não conseguimos validar este celular. Tente novamente.';
  end if;

  v_token_hash := public.hash_match_token(v_client_token);

  select *
  into v_room
  from public.match_rooms room
  where room.code = v_code;

  if not found then
    raise exception 'Sala não encontrada. Confira o código e tente de novo.';
  end if;

  if v_room.expires_at <= now() then
    update public.match_rooms
    set status = 'expired'
    where id = v_room.id
      and status <> 'expired';

    raise exception 'Essa sala saiu do forno faz tempo. Crie uma nova.';
  end if;

  select *
  into v_participant
  from public.match_participants participant
  where participant.room_id = v_room.id
    and participant.token_hash = v_token_hash
  limit 1;

  if found then
    update public.match_participants
    set nickname = v_nickname,
        last_seen_at = now()
    where id = v_participant.id;

    return query
    select
      v_room.id,
      v_room.code,
      v_participant.id,
      v_participant.is_creator,
      v_room.status,
      v_room.expires_at;

    return;
  end if;

  if v_room.status <> 'waiting' then
    raise exception 'Essa sala já começou. Peça um novo convite.';
  end if;

  select count(*)
  into v_participant_count
  from public.match_participants participant
  where participant.room_id = v_room.id;

  if v_participant_count >= v_room.max_participants then
    raise exception 'Essa sala já está cheia.';
  end if;

  insert into public.match_participants (
    room_id,
    nickname,
    token_hash,
    is_creator,
    last_seen_at
  )
  values (
    v_room.id,
    v_nickname,
    v_token_hash,
    false,
    now()
  )
  returning * into v_participant;

  return query
  select
    v_room.id,
    v_room.code,
    v_participant.id,
    v_participant.is_creator,
    v_room.status,
    v_room.expires_at;
end;
$$;

create or replace function public.start_match_room(
  p_room_id uuid,
  p_participant_id uuid,
  p_client_token text
)
returns table (
  room_id uuid,
  status text,
  started_at timestamptz,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_client_token text := btrim(coalesce(p_client_token, ''));
  v_token_hash text;
  v_room public.match_rooms%rowtype;
  v_participant public.match_participants%rowtype;
  v_participant_count int;
begin
  if char_length(v_client_token) < 16 then
    raise exception 'Não conseguimos validar este celular. Tente novamente.';
  end if;

  v_token_hash := public.hash_match_token(v_client_token);

  select *
  into v_participant
  from public.match_participants participant
  where participant.id = p_participant_id
    and participant.room_id = p_room_id;

  if not found then
    raise exception 'Participante não encontrado nessa sala.';
  end if;

  if v_participant.token_hash <> v_token_hash then
    raise exception 'Esse convite não pertence a este celular.';
  end if;

  select *
  into v_room
  from public.match_rooms room
  where room.id = p_room_id;

  if not found then
    raise exception 'Sala não encontrada.';
  end if;

  if v_room.expires_at <= now() then
    update public.match_rooms
    set status = 'expired'
    where id = v_room.id
      and status <> 'expired';

    raise exception 'Essa sala saiu do forno faz tempo. Crie uma nova.';
  end if;

  if v_room.creator_participant_id is distinct from v_participant.id or not v_participant.is_creator then
    raise exception 'Só quem criou a sala pode apertar em começar.';
  end if;

  if v_room.status <> 'waiting' then
    raise exception 'Essa sala já começou.';
  end if;

  select count(*)
  into v_participant_count
  from public.match_participants participant
  where participant.room_id = v_room.id;

  if v_participant_count < 2 then
    raise exception 'Falta a outra pessoa entrar para começar.';
  end if;

  update public.match_participants
  set last_seen_at = now()
  where id = v_participant.id;

  update public.match_rooms
  set status = 'active',
      started_at = coalesce(started_at, now())
  where id = v_room.id
  returning * into v_room;

  return query
  select
    v_room.id,
    v_room.status,
    v_room.started_at,
    v_room.expires_at;
end;
$$;

create or replace function public.cast_match_vote(
  p_room_id uuid,
  p_participant_id uuid,
  p_client_token text,
  p_food_id uuid,
  p_vote text
)
returns table (
  room_id uuid,
  status text,
  match_food_id uuid,
  matched_at timestamptz,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_vote text := lower(btrim(coalesce(p_vote, '')));
  v_client_token text := btrim(coalesce(p_client_token, ''));
  v_token_hash text;
  v_room public.match_rooms%rowtype;
  v_participant public.match_participants%rowtype;
  v_participant_count int;
  v_like_count int;
  v_food_exists boolean;
begin
  if v_vote not in ('like', 'dislike') then
    raise exception 'Escolha um voto válido para continuar.';
  end if;

  if char_length(v_client_token) < 16 then
    raise exception 'Não conseguimos validar este celular. Tente novamente.';
  end if;

  v_token_hash := public.hash_match_token(v_client_token);

  select *
  into v_participant
  from public.match_participants participant
  where participant.id = p_participant_id
    and participant.room_id = p_room_id;

  if not found then
    raise exception 'Participante não encontrado nessa sala.';
  end if;

  if v_participant.token_hash <> v_token_hash then
    raise exception 'Esse convite não pertence a este celular.';
  end if;

  select *
  into v_room
  from public.match_rooms room
  where room.id = p_room_id;

  if not found then
    raise exception 'Sala não encontrada.';
  end if;

  if v_room.expires_at <= now() then
    update public.match_rooms
    set status = 'expired'
    where id = v_room.id
      and status <> 'expired';

    raise exception 'Essa sala saiu do forno faz tempo. Crie uma nova.';
  end if;

  if v_room.status = 'matched' then
    return query
    select
      v_room.id,
      v_room.status,
      v_room.match_food_id,
      v_room.matched_at,
      v_room.expires_at;

    return;
  end if;

  if v_room.status <> 'active' then
    raise exception 'Essa sala ainda não começou.';
  end if;

  select exists (
    select 1
    from public.match_room_items item
    where item.room_id = v_room.id
      and item.food_id = p_food_id
  )
  into v_food_exists;

  if not v_food_exists then
    raise exception 'Essa comida não faz parte da sala atual.';
  end if;

  update public.match_participants
  set last_seen_at = now()
  where id = v_participant.id;

  insert into public.match_votes (
    room_id,
    participant_id,
    food_id,
    vote
  )
  values (
    v_room.id,
    v_participant.id,
    p_food_id,
    v_vote
  )
  on conflict (room_id, participant_id, food_id)
  do update
  set vote = excluded.vote,
      created_at = now();

  select count(*)
  into v_participant_count
  from public.match_participants participant
  where participant.room_id = v_room.id;

  if v_vote = 'like' then
    select count(*)
    into v_like_count
    from public.match_votes vote
    where vote.room_id = v_room.id
      and vote.food_id = p_food_id
      and vote.vote = 'like';

    if v_participant_count > 0 and v_like_count = v_participant_count then
      update public.match_rooms
      set status = 'matched',
          match_food_id = p_food_id,
          matched_at = coalesce(matched_at, now())
      where id = v_room.id
      returning * into v_room;
    else
      select *
      into v_room
      from public.match_rooms room
      where room.id = v_room.id;
    end if;
  else
    select *
    into v_room
    from public.match_rooms room
    where room.id = v_room.id;
  end if;

  return query
  select
    v_room.id,
    v_room.status,
    v_room.match_food_id,
    v_room.matched_at,
    v_room.expires_at;
end;
$$;

revoke all on function public.create_match_room(text, text, text) from public;
revoke all on function public.join_match_room(text, text, text) from public;
revoke all on function public.start_match_room(uuid, uuid, text) from public;
revoke all on function public.cast_match_vote(uuid, uuid, text, uuid, text) from public;

grant execute on function public.create_match_room(text, text, text) to anon;
grant execute on function public.join_match_room(text, text, text) to anon;
grant execute on function public.start_match_room(uuid, uuid, text) to anon;
grant execute on function public.cast_match_vote(uuid, uuid, text, uuid, text) to anon;

alter publication supabase_realtime
  add table public.match_rooms,
  public.match_participants,
  public.match_votes;

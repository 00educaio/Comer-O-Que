create table public.match_room_matches (
  room_id uuid not null references public.match_rooms(id) on delete cascade,
  food_id uuid not null references public.foods(id) on delete cascade,
  matched_at timestamptz not null default now(),
  primary key (room_id, food_id)
);

create index match_room_matches_room_id_matched_at_idx
  on public.match_room_matches(room_id, matched_at desc);

alter table public.match_room_matches replica identity full;
alter table public.match_room_matches enable row level security;

grant select (
  room_id,
  food_id,
  matched_at
) on public.match_room_matches to anon;

create policy "public read active match history"
on public.match_room_matches
for select
to anon
using (
  exists (
    select 1
    from public.match_rooms room
    where room.id = match_room_matches.room_id
      and room.expires_at > now()
  )
);

insert into public.match_room_matches (room_id, food_id, matched_at)
select
  room.id,
  room.match_food_id,
  coalesce(room.matched_at, now())
from public.match_rooms room
where room.match_food_id is not null
on conflict (room_id, food_id) do nothing;

update public.match_rooms as room
set status = case
  when room.expires_at <= now() then 'expired'
  else 'active'
end
where room.status = 'matched';

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
  v_new_match_timestamp timestamptz;
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
    update public.match_rooms as room
    set status = 'expired'
    where room.id = v_room.id
      and room.status <> 'expired';

    raise exception 'Essa sala saiu do forno faz tempo. Crie uma nova.';
  end if;

  if v_room.status not in ('active', 'matched') then
    raise exception 'Essa sala ainda não começou.';
  end if;

  if v_room.status = 'matched' then
    update public.match_rooms as room
    set status = 'active'
    where room.id = v_room.id
    returning * into v_room;
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

  update public.match_participants as participant
  set last_seen_at = now()
  where participant.id = v_participant.id;

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
  on conflict on constraint match_votes_room_participant_food_key
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
      insert into public.match_room_matches (
        room_id,
        food_id,
        matched_at
      )
      values (
        v_room.id,
        p_food_id,
        now()
      )
      on conflict (room_id, food_id) do nothing
      returning match_room_matches.matched_at into v_new_match_timestamp;

      if v_new_match_timestamp is not null then
        update public.match_rooms as room
        set status = 'active',
            match_food_id = p_food_id,
            matched_at = v_new_match_timestamp
        where room.id = v_room.id
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

alter publication supabase_realtime
  add table public.match_room_matches;

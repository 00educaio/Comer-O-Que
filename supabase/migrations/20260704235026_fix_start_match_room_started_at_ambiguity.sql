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

  update public.match_rooms as room
  set status = 'active',
      started_at = coalesce(room.started_at, now())
  where room.id = v_room.id
  returning * into v_room;

  return query
  select
    v_room.id,
    v_room.status,
    v_room.started_at,
    v_room.expires_at;
end;
$$;

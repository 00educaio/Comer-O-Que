import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RealtimeChannel } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Food } from '@/types/catalog';
import type {
  CastMatchVoteResult,
  CreateMatchRoomResult,
  JoinMatchRoomResult,
  MatchFilterSlug,
  MatchParticipant,
  MatchRoom,
  MatchRoomItem,
  MatchRoomStatus,
  MatchSubscriptionCallbacks,
  MatchVote,
  MatchVoteValue,
  StartMatchRoomResult,
  StoredMatchRoomSession,
} from '@/types/match';

const MATCH_CLIENT_TOKEN_KEY = '@comer-o-que/match:client-token:v1';
const MATCH_ROOM_SESSIONS_KEY = '@comer-o-que/match:sessions:v1';
const MATCH_CONNECTION_ERROR =
  'O ModoMatch precisa de conexão para funcionar agora. Confira sua internet e tente de novo.';

type UnknownRecord = Record<string, unknown>;
type StoredSessionMap = Record<string, StoredMatchRoomSession>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(record: UnknownRecord, key: string): string {
  const value = record[key];

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Campo obrigatório inválido: ${key}.`);
  }

  return value;
}

function readNullableString(record: UnknownRecord, key: string): string | null {
  const value = record[key];

  if (value !== null && typeof value !== 'string') {
    throw new Error(`Campo opcional inválido: ${key}.`);
  }

  return value;
}

function readBoolean(record: UnknownRecord, key: string): boolean {
  const value = record[key];

  if (typeof value !== 'boolean') {
    throw new Error(`Campo booleano inválido: ${key}.`);
  }

  return value;
}

function readPositiveInteger(record: UnknownRecord, key: string): number {
  const value = record[key];

  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new Error(`Campo numérico inválido: ${key}.`);
  }

  return value;
}

function isMatchRoomStatus(value: string): value is MatchRoomStatus {
  return ['waiting', 'active', 'matched', 'expired'].includes(value);
}

function isMatchFilterSlug(value: string): value is MatchFilterSlug {
  return ['tudo', 'sobremesa', 'fome-grande', 'regional', 'estrangeira'].includes(value);
}

function isMatchVoteValue(value: string): value is MatchVoteValue {
  return ['like', 'dislike'].includes(value);
}

function normalizeMatchRoomCode(code: string): string {
  return code.trim().replace(/\s+/g, '').toUpperCase();
}

function normalizeRoomStatus(status: MatchRoomStatus, expiresAt: string): MatchRoomStatus {
  if (status !== 'expired' && new Date(expiresAt).getTime() <= Date.now()) {
    return 'expired';
  }

  return status;
}

function parseRemoteTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new Error('Tags remotas inválidas.');
  }

  return value.map((tagRow) => {
    if (!isRecord(tagRow)) {
      throw new Error('Tag remota inválida.');
    }

    return readString(tagRow, 'tag');
  });
}

function parseFood(value: unknown): Food {
  if (!isRecord(value)) {
    throw new Error('Comida remota inválida.');
  }

  return {
    id: readString(value, 'id'),
    name: readString(value, 'name'),
    description: readNullableString(value, 'description'),
    emoji: readNullableString(value, 'emoji'),
    assetKey: readNullableString(value, 'asset_key'),
    searchQuery: readString(value, 'search_query'),
    tags: parseRemoteTags(value.food_tags),
  };
}

function parseMatchRoom(value: unknown): MatchRoom {
  if (!isRecord(value)) {
    throw new Error('Sala remota inválida.');
  }

  const status = readString(value, 'status');
  const filterSlug = readString(value, 'filter_slug');
  const expiresAt = readString(value, 'expires_at');

  if (!isMatchRoomStatus(status)) {
    throw new Error('Status de sala inválido.');
  }

  if (!isMatchFilterSlug(filterSlug)) {
    throw new Error('Filtro da sala inválido.');
  }

  return {
    id: readString(value, 'id'),
    code: readString(value, 'code'),
    status: normalizeRoomStatus(status, expiresAt),
    filterSlug,
    maxParticipants: readPositiveInteger(value, 'max_participants'),
    creatorParticipantId: readNullableString(value, 'creator_participant_id'),
    matchFoodId: readNullableString(value, 'match_food_id'),
    createdAt: readString(value, 'created_at'),
    startedAt: readNullableString(value, 'started_at'),
    matchedAt: readNullableString(value, 'matched_at'),
    expiresAt,
  };
}

function parseMatchParticipant(value: unknown): MatchParticipant {
  if (!isRecord(value)) {
    throw new Error('Participante remoto inválido.');
  }

  return {
    id: readString(value, 'id'),
    roomId: readString(value, 'room_id'),
    nickname: readString(value, 'nickname'),
    isCreator: readBoolean(value, 'is_creator'),
    joinedAt: readString(value, 'joined_at'),
    lastSeenAt: readNullableString(value, 'last_seen_at'),
  };
}

function parseMatchRoomItem(value: unknown): MatchRoomItem {
  if (!isRecord(value)) {
    throw new Error('Card da sala inválido.');
  }

  return {
    roomId: readString(value, 'room_id'),
    foodId: readString(value, 'food_id'),
    position: readPositiveInteger(value, 'position'),
    food: parseFood(value.food),
  };
}

function parseMatchVote(value: unknown): MatchVote {
  if (!isRecord(value)) {
    throw new Error('Voto remoto inválido.');
  }

  const vote = readString(value, 'vote');

  if (!isMatchVoteValue(vote)) {
    throw new Error('Valor de voto inválido.');
  }

  return {
    id: readString(value, 'id'),
    roomId: readString(value, 'room_id'),
    participantId: readString(value, 'participant_id'),
    foodId: readString(value, 'food_id'),
    vote,
    createdAt: readString(value, 'created_at'),
  };
}

function parseCreateOrJoinResult(value: unknown): CreateMatchRoomResult {
  if (!isRecord(value)) {
    throw new Error('Resposta da sala inválida.');
  }

  const status = readString(value, 'status');
  const expiresAt = readString(value, 'expires_at');

  if (!isMatchRoomStatus(status)) {
    throw new Error('Status de criação da sala inválido.');
  }

  return {
    roomId: readString(value, 'room_id'),
    code: readString(value, 'code'),
    participantId: readString(value, 'participant_id'),
    isCreator: readBoolean(value, 'is_creator'),
    status: normalizeRoomStatus(status, expiresAt),
    expiresAt,
  };
}

function parseStartMatchRoomResult(value: unknown): StartMatchRoomResult {
  if (!isRecord(value)) {
    throw new Error('Resposta de início da sala inválida.');
  }

  const status = readString(value, 'status');
  const expiresAt = readString(value, 'expires_at');

  if (!isMatchRoomStatus(status)) {
    throw new Error('Status de início inválido.');
  }

  return {
    roomId: readString(value, 'room_id'),
    status: normalizeRoomStatus(status, expiresAt),
    startedAt: readNullableString(value, 'started_at'),
    expiresAt,
  };
}

function parseCastMatchVoteResult(value: unknown): CastMatchVoteResult {
  if (!isRecord(value)) {
    throw new Error('Resposta do voto inválida.');
  }

  const status = readString(value, 'status');
  const expiresAt = readString(value, 'expires_at');

  if (!isMatchRoomStatus(status)) {
    throw new Error('Status do voto inválido.');
  }

  return {
    roomId: readString(value, 'room_id'),
    status: normalizeRoomStatus(status, expiresAt),
    matchFoodId: readNullableString(value, 'match_food_id'),
    matchedAt: readNullableString(value, 'matched_at'),
    expiresAt,
  };
}

function parseStoredSession(value: unknown): StoredMatchRoomSession {
  if (!isRecord(value)) {
    throw new Error('Sessão local inválida.');
  }

  return {
    roomId: readString(value, 'roomId'),
    code: readString(value, 'code'),
    participantId: readString(value, 'participantId'),
    nickname: readString(value, 'nickname'),
    isCreator: readBoolean(value, 'isCreator'),
    expiresAt: readString(value, 'expiresAt'),
  };
}

function generateRandomTokenChunk(size: number): string {
  const alphabet = 'abcdef0123456789';
  let output = '';

  for (let index = 0; index < size; index += 1) {
    const characterIndex = Math.floor(Math.random() * alphabet.length);
    output += alphabet[characterIndex] ?? alphabet[0];
  }

  return output;
}

function generateMatchClientToken(): string {
  const nativeUuid = globalThis.crypto?.randomUUID?.();

  if (nativeUuid) {
    return nativeUuid;
  }

  return [
    generateRandomTokenChunk(8),
    generateRandomTokenChunk(4),
    generateRandomTokenChunk(4),
    generateRandomTokenChunk(4),
    generateRandomTokenChunk(12),
  ].join('-');
}

function requireMatchSupabase() {
  if (!supabase) {
    throw new Error(MATCH_CONNECTION_ERROR);
  }

  return supabase;
}

function logDevelopmentWarning(message: string, error: unknown) {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(`[matchService] ${message}`, error);
  }
}

function toFriendlyMatchError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error) {
    const message = error.message.trim();

    if (
      /Failed to fetch|Network request failed|fetch failed|connection/i.test(message)
    ) {
      return new Error(MATCH_CONNECTION_ERROR);
    }

    if (message.length > 0) {
      return new Error(message);
    }
  }

  return new Error(fallbackMessage);
}

async function readStoredSessions(): Promise<StoredSessionMap> {
  const serializedSessions = await AsyncStorage.getItem(MATCH_ROOM_SESSIONS_KEY);

  if (!serializedSessions) {
    return {};
  }

  const parsedValue: unknown = JSON.parse(serializedSessions);

  if (!isRecord(parsedValue)) {
    throw new Error('Mapa de sessões local inválido.');
  }

  const sessions: StoredSessionMap = {};

  for (const [code, value] of Object.entries(parsedValue)) {
    sessions[code] = parseStoredSession(value);
  }

  return sessions;
}

async function writeStoredSessions(sessions: StoredSessionMap): Promise<void> {
  await AsyncStorage.setItem(MATCH_ROOM_SESSIONS_KEY, JSON.stringify(sessions));
}

async function persistRoomSession(
  session: StoredMatchRoomSession,
): Promise<void> {
  const sessions = await readStoredSessions();
  sessions[session.code] = session;
  await writeStoredSessions(sessions);
}

async function readSingleRpcResult<T>(
  promise: PromiseLike<{ data: unknown; error: { message: string } | null }>,
  parser: (value: unknown) => T,
  fallbackMessage: string,
): Promise<T> {
  const { data, error } = await promise;

  if (error) {
    throw new Error(error.message);
  }

  if (!Array.isArray(data) || data.length !== 1) {
    throw new Error(fallbackMessage);
  }

  return parser(data[0]);
}

export async function getOrCreateMatchClientToken(): Promise<string> {
  const storedToken = await AsyncStorage.getItem(MATCH_CLIENT_TOKEN_KEY);

  if (storedToken && storedToken.trim().length >= 16) {
    return storedToken;
  }

  const generatedToken = generateMatchClientToken();
  await AsyncStorage.setItem(MATCH_CLIENT_TOKEN_KEY, generatedToken);

  return generatedToken;
}

export async function getStoredMatchRoomSession(
  code: string,
): Promise<StoredMatchRoomSession | null> {
  try {
    const sessions = await readStoredSessions();
    return sessions[normalizeMatchRoomCode(code)] ?? null;
  } catch (error) {
    logDevelopmentWarning('Falha ao ler a sessão local do ModoMatch.', error);
    return null;
  }
}

export async function clearStoredMatchRoomSession(code: string): Promise<void> {
  try {
    const sessions = await readStoredSessions();
    delete sessions[normalizeMatchRoomCode(code)];
    await writeStoredSessions(sessions);
  } catch (error) {
    logDevelopmentWarning('Falha ao limpar a sessão local do ModoMatch.', error);
  }
}

export async function createMatchRoom({
  nickname,
  filterSlug,
}: {
  nickname: string;
  filterSlug: MatchFilterSlug;
}): Promise<CreateMatchRoomResult> {
  try {
    const client = requireMatchSupabase();
    const clientToken = await getOrCreateMatchClientToken();
    const result = await readSingleRpcResult(
      client.rpc('create_match_room', {
        p_nickname: nickname,
        p_filter_slug: filterSlug,
        p_client_token: clientToken,
      }),
      parseCreateOrJoinResult,
      'Não conseguimos criar a sala agora.',
    );

    await persistRoomSession({
      roomId: result.roomId,
      code: result.code,
      participantId: result.participantId,
      nickname: nickname.trim(),
      isCreator: result.isCreator,
      expiresAt: result.expiresAt,
    });

    return result;
  } catch (error) {
    throw toFriendlyMatchError(error, 'Não conseguimos criar a sala agora.');
  }
}

export async function joinMatchRoom({
  code,
  nickname,
}: {
  code: string;
  nickname: string;
}): Promise<JoinMatchRoomResult> {
  try {
    const client = requireMatchSupabase();
    const normalizedCode = normalizeMatchRoomCode(code);
    const clientToken = await getOrCreateMatchClientToken();
    const result = await readSingleRpcResult(
      client.rpc('join_match_room', {
        p_code: normalizedCode,
        p_nickname: nickname,
        p_client_token: clientToken,
      }),
      parseCreateOrJoinResult,
      'Não conseguimos entrar nessa sala agora.',
    );

    await persistRoomSession({
      roomId: result.roomId,
      code: result.code,
      participantId: result.participantId,
      nickname: nickname.trim(),
      isCreator: result.isCreator,
      expiresAt: result.expiresAt,
    });

    return result;
  } catch (error) {
    throw toFriendlyMatchError(error, 'Não conseguimos entrar nessa sala agora.');
  }
}

export async function startMatchRoom({
  roomId,
  participantId,
}: {
  roomId: string;
  participantId: string;
}): Promise<StartMatchRoomResult> {
  try {
    const client = requireMatchSupabase();
    const clientToken = await getOrCreateMatchClientToken();

    return await readSingleRpcResult(
      client.rpc('start_match_room', {
        p_room_id: roomId,
        p_participant_id: participantId,
        p_client_token: clientToken,
      }),
      parseStartMatchRoomResult,
      'Não conseguimos começar essa sala agora.',
    );
  } catch (error) {
    throw toFriendlyMatchError(error, 'Não conseguimos começar essa sala agora.');
  }
}

export async function castMatchVote({
  roomId,
  participantId,
  foodId,
  vote,
}: {
  roomId: string;
  participantId: string;
  foodId: string;
  vote: MatchVoteValue;
}): Promise<CastMatchVoteResult> {
  try {
    const client = requireMatchSupabase();
    const clientToken = await getOrCreateMatchClientToken();

    return await readSingleRpcResult(
      client.rpc('cast_match_vote', {
        p_room_id: roomId,
        p_participant_id: participantId,
        p_client_token: clientToken,
        p_food_id: foodId,
        p_vote: vote,
      }),
      parseCastMatchVoteResult,
      'Não conseguimos registrar seu voto agora.',
    );
  } catch (error) {
    throw toFriendlyMatchError(error, 'Não conseguimos registrar seu voto agora.');
  }
}

export async function getMatchRoomByCode(code: string): Promise<MatchRoom | null> {
  try {
    const client = requireMatchSupabase();
    const normalizedCode = normalizeMatchRoomCode(code);

    if (normalizedCode.length !== 6) {
      return null;
    }

    const { data, error } = await client
      .from('match_rooms')
      .select(`
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
      `)
      .eq('code', normalizedCode)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return parseMatchRoom(data);
  } catch (error) {
    throw toFriendlyMatchError(error, 'Não conseguimos carregar essa sala agora.');
  }
}

export async function getMatchRoomItems(roomId: string): Promise<MatchRoomItem[]> {
  try {
    const client = requireMatchSupabase();
    const { data, error } = await client
      .from('match_room_items')
      .select(`
        room_id,
        food_id,
        position,
        food:foods!inner (
          id,
          name,
          description,
          emoji,
          asset_key,
          search_query,
          food_tags (tag)
        )
      `)
      .eq('room_id', roomId)
      .order('position', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map(parseMatchRoomItem);
  } catch (error) {
    throw toFriendlyMatchError(error, 'Não conseguimos carregar os cards dessa sala.');
  }
}

export async function getMatchParticipants(roomId: string): Promise<MatchParticipant[]> {
  try {
    const client = requireMatchSupabase();
    const { data, error } = await client
      .from('match_participants')
      .select(`
        id,
        room_id,
        nickname,
        is_creator,
        joined_at,
        last_seen_at
      `)
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map(parseMatchParticipant);
  } catch (error) {
    throw toFriendlyMatchError(
      error,
      'Não conseguimos carregar quem está nessa sala agora.',
    );
  }
}

export async function getMatchVotes({
  roomId,
  participantId,
}: {
  roomId: string;
  participantId: string;
}): Promise<MatchVote[]> {
  try {
    const client = requireMatchSupabase();
    const { data, error } = await client
      .from('match_votes')
      .select(`
        id,
        room_id,
        participant_id,
        food_id,
        vote,
        created_at
      `)
      .eq('room_id', roomId)
      .eq('participant_id', participantId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map(parseMatchVote);
  } catch (error) {
    throw toFriendlyMatchError(error, 'Não conseguimos recuperar seus votos agora.');
  }
}

export function subscribeToMatchRoom(
  roomId: string,
  callbacks: MatchSubscriptionCallbacks,
): () => void {
  let channel: RealtimeChannel | null = null;

  try {
    const client = requireMatchSupabase();

    channel = client
      .channel(`match-room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_rooms',
          filter: `id=eq.${roomId}`,
        },
        () => {
          callbacks.onRoomChange?.();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_participants',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          callbacks.onParticipantsChange?.();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_votes',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          callbacks.onVotesChange?.();
        },
      );

    channel.subscribe((status, error) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        callbacks.onError?.(
          toFriendlyMatchError(
            error ?? new Error('Falha no realtime do ModoMatch.'),
            'Não conseguimos atualizar essa sala em tempo real.',
          ),
        );
      }
    });
  } catch (error) {
    const friendlyError = toFriendlyMatchError(
      error,
      'Não conseguimos atualizar essa sala em tempo real.',
    );
    callbacks.onError?.(friendlyError);
  }

  return () => {
    if (!channel || !supabase) {
      return;
    }

    void supabase.removeChannel(channel);
  };
}

export { MATCH_CONNECTION_ERROR, normalizeMatchRoomCode };

import { Link, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ErrorIllustration,
  LoadingIllustration,
} from '@/components/feedback-illustration';
import { shareMatchInvite } from '@/lib/matchInvite';
import { openNearbyPlaces } from '@/lib/maps';
import {
  castMatchVote,
  clearStoredMatchRoomSession,
  getMatchParticipants,
  getMatchRoomByCode,
  getMatchRoomItems,
  getMatchVotes,
  getStoredMatchRoomSession,
  normalizeMatchRoomCode,
  startMatchRoom,
  subscribeToMatchRoom,
} from '@/services/matchService';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';
import type {
  MatchParticipant,
  MatchRoom,
  MatchRoomItem,
  MatchVote,
  MatchVoteValue,
  StoredMatchRoomSession,
} from '@/types/match';

const filterLabelBySlug = {
  tudo: 'Tudo',
  sobremesa: 'Sobremesa',
  'fome-grande': 'Fome grande',
  regional: 'Regional',
  estrangeira: 'Estrangeira',
} as const;

function createExpiredRoomPlaceholder(code: string, session: StoredMatchRoomSession): MatchRoom {
  return {
    id: session.roomId,
    code,
    status: 'expired',
    filterSlug: 'tudo',
    maxParticipants: 2,
    creatorParticipantId: session.isCreator ? session.participantId : null,
    matchFoodId: null,
    createdAt: session.expiresAt,
    startedAt: null,
    matchedAt: null,
    expiresAt: session.expiresAt,
  };
}

function upsertLocalVote(
  currentVotes: MatchVote[],
  roomId: string,
  participantId: string,
  foodId: string,
  vote: MatchVoteValue,
): MatchVote[] {
  const nextVote: MatchVote = {
    id: `${participantId}:${foodId}`,
    roomId,
    participantId,
    foodId,
    vote,
    createdAt: new Date().toISOString(),
  };

  const remainingVotes = currentVotes.filter(
    (currentVote) => currentVote.foodId !== foodId,
  );

  return [...remainingVotes, nextVote];
}

export default function MatchRoomScreen() {
  const params = useLocalSearchParams<{ code?: string | string[] }>();
  const rawCode = Array.isArray(params.code) ? params.code[0] : params.code;
  const code = normalizeMatchRoomCode(rawCode ?? '');
  const [session, setSession] = useState<StoredMatchRoomSession | null>(null);
  const [room, setRoom] = useState<MatchRoom | null>(null);
  const [participants, setParticipants] = useState<MatchParticipant[]>([]);
  const [items, setItems] = useState<MatchRoomItem[]>([]);
  const [votes, setVotes] = useState<MatchVote[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shareErrorMessage, setShareErrorMessage] = useState<string | null>(null);
  const [mapsErrorMessage, setMapsErrorMessage] = useState<string | null>(null);
  const [realtimeErrorMessage, setRealtimeErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const loadRoomState = useCallback(
    async (showLoading: boolean) => {
      if (showLoading) {
        setIsLoading(true);
      }

      setErrorMessage(null);

      try {
        const storedSession = await getStoredMatchRoomSession(code);
        setSession(storedSession);

        if (storedSession && new Date(storedSession.expiresAt).getTime() <= Date.now()) {
          const expiredRoom = createExpiredRoomPlaceholder(code, storedSession);
          setRoom(expiredRoom);
          setParticipants([]);
          setItems([]);
          setVotes([]);
          return;
        }

        if (!storedSession) {
          const existingRoom = await getMatchRoomByCode(code);

          if (existingRoom) {
            router.replace({
              pathname: '/match/join',
              params: { code },
            });
            return;
          }

          setRoom(null);
          setParticipants([]);
          setItems([]);
          setVotes([]);
          return;
        }

        const currentRoom = await getMatchRoomByCode(code);

        if (!currentRoom) {
          setRoom(null);
          setParticipants([]);
          setItems([]);
          setVotes([]);
          setErrorMessage('Essa sala não está mais disponível.');
          await clearStoredMatchRoomSession(code);
          return;
        }

        const shouldLoadCards =
          currentRoom.status === 'active' || currentRoom.status === 'matched';

        const [nextParticipants, nextItems, nextVotes] = await Promise.all([
          getMatchParticipants(currentRoom.id),
          shouldLoadCards ? getMatchRoomItems(currentRoom.id) : Promise.resolve([]),
          shouldLoadCards
            ? getMatchVotes({
                roomId: currentRoom.id,
                participantId: storedSession.participantId,
              })
            : Promise.resolve([]),
        ]);

        setRoom(currentRoom);
        setParticipants(nextParticipants);
        setItems(nextItems);
        setVotes(nextVotes);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Não conseguimos carregar essa sala agora.';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    },
    [code],
  );

  useEffect(() => {
    let isCancelled = false;

    async function hydrateRoomState() {
      await Promise.resolve();

      if (isCancelled) {
        return;
      }

      await loadRoomState(true);
    }

    void hydrateRoomState();

    return () => {
      isCancelled = true;
    };
  }, [loadRoomState]);

  useEffect(() => {
    if (!session?.roomId) {
      return;
    }

    const unsubscribe = subscribeToMatchRoom(session.roomId, {
      onParticipantsChange: () => {
        setRealtimeErrorMessage(null);
        void loadRoomState(false);
      },
      onRoomChange: () => {
        setRealtimeErrorMessage(null);
        void loadRoomState(false);
      },
      onVotesChange: () => {
        setRealtimeErrorMessage(null);
        void loadRoomState(false);
      },
      onError: (error) => {
        setRealtimeErrorMessage(error.message);
      },
    });

    return unsubscribe;
  }, [loadRoomState, session?.roomId]);

  const isExpired = room?.status === 'expired';
  const isCreator = session?.isCreator ?? false;
  const votedFoodIds = new Set(votes.map((vote) => vote.foodId));
  const currentItem = items.find((item) => !votedFoodIds.has(item.foodId)) ?? null;
  const matchedItem =
    room?.matchFoodId != null
      ? items.find((item) => item.foodId === room.matchFoodId) ?? null
      : null;

  async function handleShareInvite() {
    if (isSharing) {
      return;
    }

    setShareErrorMessage(null);
    setIsSharing(true);

    try {
      await shareMatchInvite(code);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não conseguimos abrir o compartilhamento agora.';
      setShareErrorMessage(message);
    } finally {
      setIsSharing(false);
    }
  }

  async function handleStartRoom() {
    if (!session || !room || isStarting) {
      return;
    }

    setErrorMessage(null);
    setIsStarting(true);

    try {
      const result = await startMatchRoom({
        roomId: room.id,
        participantId: session.participantId,
      });

      setRoom((currentRoom) =>
        currentRoom
          ? {
              ...currentRoom,
              status: result.status,
              startedAt: result.startedAt,
              expiresAt: result.expiresAt,
            }
          : currentRoom,
      );

      await loadRoomState(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não conseguimos começar essa sala agora.';
      setErrorMessage(message);
    } finally {
      setIsStarting(false);
    }
  }

  async function handleVote(vote: MatchVoteValue) {
    if (!session || !room || !currentItem || isVoting) {
      return;
    }

    const previousVotes = votes;

    setErrorMessage(null);
    setIsVoting(true);
    setVotes((currentVotes) =>
      upsertLocalVote(
        currentVotes,
        room.id,
        session.participantId,
        currentItem.foodId,
        vote,
      ),
    );

    try {
      const result = await castMatchVote({
        roomId: room.id,
        participantId: session.participantId,
        foodId: currentItem.foodId,
        vote,
      });

      setRoom((currentRoom) =>
        currentRoom
          ? {
              ...currentRoom,
              status: result.status,
              matchFoodId: result.matchFoodId,
              matchedAt: result.matchedAt,
              expiresAt: result.expiresAt,
            }
          : currentRoom,
      );

      await loadRoomState(false);
    } catch (error) {
      setVotes(previousVotes);

      const message =
        error instanceof Error
          ? error.message
          : 'Não conseguimos registrar seu voto agora.';
      setErrorMessage(message);
    } finally {
      setIsVoting(false);
    }
  }

  async function handleOpenNearbyPlaces() {
    if (!matchedItem) {
      return;
    }

    setMapsErrorMessage(null);

    try {
      await openNearbyPlaces(matchedItem.food.searchQuery);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não conseguimos abrir o Maps agora.';
      setMapsErrorMessage(message);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      style={styles.screen}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        {isLoading ? (
          <View accessibilityLiveRegion="polite" style={styles.feedbackCard}>
            <LoadingIllustration />
            <Text style={styles.feedbackTitle}>Preparando a sala...</Text>
            <Text style={styles.feedbackText}>
              Estamos buscando o lobby, os votos e os cards da rodada.
            </Text>
          </View>
        ) : errorMessage && !room ? (
          <View accessibilityLiveRegion="polite" style={styles.feedbackCard}>
            <ErrorIllustration />
            <Text style={styles.feedbackTitle}>Essa sala escapou da mesa</Text>
            <Text style={styles.feedbackText}>{errorMessage}</Text>
            <Link href="/match" asChild>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}>
                <Text style={styles.primaryButtonText}>Voltar ao ModoMatch</Text>
              </Pressable>
            </Link>
          </View>
        ) : isExpired ? (
          <View accessibilityLiveRegion="polite" style={styles.feedbackCard}>
            <Text style={styles.bigEmoji}>⌛</Text>
            <Text accessibilityRole="header" style={styles.feedbackTitle}>
              Essa sala saiu do forno faz tempo. Crie uma nova.
            </Text>
            <Text style={styles.feedbackText}>
              As salas do ModoMatch expiram depois de 2 horas para manter a rodada
              fresquinha.
            </Text>
            <View style={styles.buttonGroup}>
              <Link href="/match/create" asChild>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.buttonPressed,
                  ]}>
                  <Text style={styles.primaryButtonText}>Criar nova sala</Text>
                </Pressable>
              </Link>
              <Link href="/" asChild>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.buttonPressed,
                  ]}>
                  <Text style={styles.secondaryButtonText}>Voltar para Home</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        ) : room?.status === 'waiting' ? (
          <View style={styles.section}>
            <View style={styles.roomHeaderCard}>
              <Text style={styles.roomEyebrow}>Sala pronta para convite</Text>
              <Text accessibilityRole="header" style={styles.roomCode}>
                {room.code}
              </Text>
              <Text style={styles.roomMeta}>
                Filtro: {filterLabelBySlug[room.filterSlug]}
              </Text>
              <Pressable
                accessibilityRole="button"
                disabled={isSharing}
                onPress={() => void handleShareInvite()}
                style={({ pressed }) => [
                  styles.primaryButton,
                  isSharing && styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}>
                <Text style={styles.primaryButtonText}>
                  {isSharing ? 'Abrindo compartilhamento...' : 'Compartilhar convite'}
                </Text>
              </Pressable>
              {shareErrorMessage && (
                <Text accessibilityLiveRegion="polite" style={styles.inlineErrorText}>
                  {shareErrorMessage}
                </Text>
              )}
            </View>

            <View style={styles.participantsCard}>
              <Text style={styles.cardTitle}>Participantes conectados</Text>
              {participants.map((participant) => (
                <View key={participant.id} style={styles.participantRow}>
                  <Text style={styles.participantName}>{participant.nickname}</Text>
                  <Text style={styles.participantBadge}>
                    {participant.isCreator ? 'Criou a sala' : 'Convidado'}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.noticeCard}>
              {participants.length < 2 ? (
                <Text style={styles.noticeText}>
                  Aguardando a outra pessoa entrar...
                </Text>
              ) : isCreator ? (
                <>
                  <Text style={styles.noticeText}>
                    A dupla está formada. Quando quiser, aperte em começar.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isStarting}
                    onPress={() => void handleStartRoom()}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      styles.noticeButton,
                      isStarting && styles.buttonDisabled,
                      pressed && styles.buttonPressed,
                    ]}>
                    <Text style={styles.primaryButtonText}>
                      {isStarting ? 'Começando...' : 'Começar'}
                    </Text>
                  </Pressable>
                </>
              ) : (
                <Text style={styles.noticeText}>
                  Esperando o criador começar.
                </Text>
              )}
            </View>

            {errorMessage && (
              <Text accessibilityLiveRegion="polite" style={styles.inlineErrorText}>
                {errorMessage}
              </Text>
            )}
          </View>
        ) : room?.status === 'active' ? (
          <View style={styles.section}>
            <View style={styles.gameHeaderCard}>
              <Text style={styles.roomEyebrow}>Sala {room.code}</Text>
              <Text accessibilityRole="header" style={styles.cardTitle}>
                Vote no próximo card
              </Text>
              <Text style={styles.feedbackText}>
                {votedFoodIds.size}/{items.length} opções já passaram pela sua mão.
              </Text>
            </View>

            {currentItem ? (
              <View style={styles.foodCard}>
                <Text style={styles.foodEmoji}>{currentItem.food.emoji ?? '🍽️'}</Text>
                <Text style={styles.foodTitle}>{currentItem.food.name}</Text>
                <Text style={styles.foodDescription}>
                  {currentItem.food.description ?? 'Uma opção caprichada esperando seu voto.'}
                </Text>

                <View style={styles.voteActions}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isVoting}
                    onPress={() => void handleVote('dislike')}
                    style={({ pressed }) => [
                      styles.secondaryButton,
                      styles.voteButton,
                      isVoting && styles.buttonDisabled,
                      pressed && styles.buttonPressed,
                    ]}>
                    <Text style={styles.secondaryButtonText}>Passo</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    disabled={isVoting}
                    onPress={() => void handleVote('like')}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      styles.voteButton,
                      isVoting && styles.buttonDisabled,
                      pressed && styles.buttonPressed,
                    ]}>
                    <Text style={styles.primaryButtonText}>Gostei</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.noticeCard}>
                <Text style={styles.noticeText}>
                  Você já passou por todas as opções. Vamos ver se ainda sai um match!
                </Text>
              </View>
            )}

            {errorMessage && (
              <Text accessibilityLiveRegion="polite" style={styles.inlineErrorText}>
                {errorMessage}
              </Text>
            )}
          </View>
        ) : room?.status === 'matched' ? (
          <View style={styles.section}>
            <View style={styles.matchCard}>
              <Text style={styles.bigEmoji}>{matchedItem?.food.emoji ?? '💞'}</Text>
              <Text accessibilityRole="header" style={styles.matchTitle}>
                Deu match!
              </Text>
              <Text style={styles.matchFoodName}>
                {matchedItem?.food.name ?? 'A comida escolhida'}
              </Text>
              <Text style={styles.matchFoodDescription}>
                {matchedItem?.food.description ??
                  'Os dois curtiram a mesma opção e a fome agradece.'}
              </Text>
            </View>

            <View style={styles.buttonGroup}>
              <Pressable
                accessibilityRole="button"
                disabled={!matchedItem}
                onPress={() => void handleOpenNearbyPlaces()}
                style={({ pressed }) => [
                  styles.primaryButton,
                  !matchedItem && styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}>
                <Text style={styles.primaryButtonText}>Ver lugares próximos</Text>
              </Pressable>

              <Link href="/" asChild>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.buttonPressed,
                  ]}>
                  <Text style={styles.secondaryButtonText}>Voltar para Home</Text>
                </Pressable>
              </Link>
            </View>

            {mapsErrorMessage && (
              <Text accessibilityLiveRegion="polite" style={styles.inlineErrorText}>
                {mapsErrorMessage}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.feedbackCard}>
            <ErrorIllustration />
            <Text style={styles.feedbackTitle}>Essa sala ainda não abriu direito</Text>
            <Text style={styles.feedbackText}>
              Tente atualizar ou volte para o início do ModoMatch.
            </Text>
            <View style={styles.buttonGroup}>
              <Pressable
                accessibilityRole="button"
                onPress={() => void loadRoomState(true)}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}>
                <Text style={styles.primaryButtonText}>Tentar novamente</Text>
              </Pressable>
              <Link href="/match" asChild>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.buttonPressed,
                  ]}>
                  <Text style={styles.secondaryButtonText}>Voltar</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        )}

        {realtimeErrorMessage && !isLoading && (
          <Text accessibilityLiveRegion="polite" style={styles.realtimeNotice}>
            {realtimeErrorMessage}
          </Text>
        )}
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  safeArea: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: 720,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    width: '100%',
  },
  section: {
    gap: spacing.lg,
  },
  feedbackCard: {
    ...shadows.card,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    gap: spacing.md,
    padding: spacing.lg,
  },
  feedbackTitle: {
    ...typography.heading,
    color: colors.text,
    textAlign: 'center',
  },
  feedbackText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  bigEmoji: {
    fontSize: 44,
  },
  roomHeaderCard: {
    ...shadows.card,
    backgroundColor: colors.mint,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.lg,
  },
  roomEyebrow: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  roomCode: {
    ...typography.title,
    color: colors.primary,
    letterSpacing: 3,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  roomMeta: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  participantsCard: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    gap: spacing.md,
    padding: spacing.lg,
  },
  cardTitle: {
    ...typography.heading,
    color: colors.text,
  },
  participantRow: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  participantName: {
    ...typography.button,
    color: colors.text,
    flex: 1,
  },
  participantBadge: {
    ...typography.caption,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    color: colors.onPrimary,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  noticeCard: {
    backgroundColor: colors.yellow,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.lg,
  },
  noticeText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
  },
  noticeButton: {
    marginTop: spacing.lg,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: spacing.xl,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderRadius: radius.pill,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: spacing.xl,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.onPrimary,
    textAlign: 'center',
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.text,
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
  inlineErrorText: {
    ...typography.body,
    color: colors.primaryDark,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  gameHeaderCard: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  foodCard: {
    ...shadows.card,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.lg,
  },
  foodEmoji: {
    fontSize: 64,
  },
  foodTitle: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  foodDescription: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  voteActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    width: '100%',
  },
  voteButton: {
    flex: 1,
  },
  matchCard: {
    ...shadows.card,
    alignItems: 'center',
    backgroundColor: colors.mint,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.xl,
  },
  matchTitle: {
    ...typography.title,
    color: colors.primary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  matchFoodName: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  matchFoodDescription: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  buttonGroup: {
    gap: spacing.md,
    width: '100%',
  },
  realtimeNotice: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});

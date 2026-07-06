import { Link, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ErrorIllustration,
  LoadingIllustration,
} from '@/components/feedback-illustration';
import { CelebrationOverlay } from '@/components/celebration-overlay';
import { FoodArtwork } from '@/components/food-artwork';
import { ScreenShell } from '@/components/ui/app-shell';
import { shareMatchInvite } from '@/lib/matchInvite';
import { openNearbyPlaces } from '@/lib/maps';
import {
  castMatchVote,
  clearStoredMatchRoomSession,
  getMatchParticipants,
  getMatchRoomByCode,
  getMatchRoomItems,
  getMatchRoomMatches,
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
  MatchRoomMatch,
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

function getParticipantInitial(nickname: string) {
  const value = nickname.trim().charAt(0);
  return value ? value.toUpperCase() : '?';
}

export default function MatchRoomScreen() {
  const params = useLocalSearchParams<{ code?: string | string[] }>();
  const rawCode = Array.isArray(params.code) ? params.code[0] : params.code;
  const code = normalizeMatchRoomCode(rawCode ?? '');
  const [session, setSession] = useState<StoredMatchRoomSession | null>(null);
  const [room, setRoom] = useState<MatchRoom | null>(null);
  const [participants, setParticipants] = useState<MatchParticipant[]>([]);
  const [items, setItems] = useState<MatchRoomItem[]>([]);
  const [matches, setMatches] = useState<MatchRoomMatch[]>([]);
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
          setMatches([]);
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
          setMatches([]);
          setVotes([]);
          return;
        }

        const currentRoom = await getMatchRoomByCode(code);

        if (!currentRoom) {
          setRoom(null);
          setParticipants([]);
          setItems([]);
          setMatches([]);
          setVotes([]);
          setErrorMessage('Essa sala não está mais disponível.');
          await clearStoredMatchRoomSession(code);
          return;
        }

        const shouldLoadGameState =
          currentRoom.status === 'active' || currentRoom.status === 'matched';

        const [nextParticipants, nextItems, nextMatches, nextVotes] = await Promise.all([
          getMatchParticipants(currentRoom.id),
          shouldLoadGameState ? getMatchRoomItems(currentRoom.id) : Promise.resolve([]),
          shouldLoadGameState ? getMatchRoomMatches(currentRoom.id) : Promise.resolve([]),
          shouldLoadGameState
            ? getMatchVotes({
                roomId: currentRoom.id,
                participantId: storedSession.participantId,
              })
            : Promise.resolve([]),
        ]);

        setRoom(currentRoom);
        setParticipants(nextParticipants);
        setItems(nextItems);
        setMatches(nextMatches);
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
      onMatchesChange: () => {
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
  const latestMatch = matches[0] ?? null;
  const latestMatchFood = latestMatch?.food ?? matchedItem?.food ?? null;
  const latestMatchAt = latestMatch?.matchedAt ?? room?.matchedAt ?? null;
  const celebrationKey =
    latestMatchFood && latestMatchAt
      ? `${latestMatchFood.id}:${latestMatchAt}`
      : latestMatchFood?.id ?? null;
  const voteProgress = items.length > 0
    ? Math.round((votedFoodIds.size / items.length) * 100)
    : 0;

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

  async function handleOpenNearbyPlaces(searchQuery: string) {
    if (!searchQuery) {
      return;
    }

    setMapsErrorMessage(null);

    try {
      await openNearbyPlaces(searchQuery);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não conseguimos abrir o Maps agora.';
      setMapsErrorMessage(message);
    }
  }

  return (
    <ScreenShell contentContainerStyle={styles.scrollContent} tone="match">
          {isLoading ? (
          <View accessibilityLiveRegion="polite" style={styles.feedbackCard}>
            <LoadingIllustration />
            <Text style={styles.feedbackTitle}>Preparando a sala...</Text>
            <Text style={styles.feedbackText}>Só um instante.</Text>
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
              <Text style={styles.roomEyebrow}>Código da sala</Text>
              <Text accessibilityRole="header" style={styles.roomCode}>
                {room.code}
              </Text>
              <View style={styles.roomMetaRow}>
                <View style={styles.roomMetaChip}>
                  <Text style={styles.roomMetaChipText}>
                    Filtro: {filterLabelBySlug[room.filterSlug]}
                  </Text>
                </View>
                <View style={styles.roomMetaChip}>
                  <Text style={styles.roomMetaChipText}>
                    {participants.length}/{room.maxParticipants} pessoas
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                disabled={isSharing}
                onPress={() => void handleShareInvite()}
                style={({ pressed }) => [
                  styles.primaryButton,
                  styles.shareButton,
                  isSharing && styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}>
                <Text style={[styles.primaryButtonText, styles.shareButtonText]}>
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
                  <View style={styles.participantIdentity}>
                    <View style={styles.participantAvatar}>
                      <Text style={styles.participantAvatarText}>
                        {getParticipantInitial(participant.nickname)}
                      </Text>
                    </View>
                    <Text style={styles.participantName}>{participant.nickname}</Text>
                  </View>
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
                    Dupla formada. Pode começar.
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
          ) : room?.status === 'active' || room?.status === 'matched' ? (
          <View style={styles.section}>
            <View style={styles.gameHeaderCard}>
              <Text style={styles.roomEyebrow}>Sala {room.code}</Text>
              <Text
                accessibilityRole="header"
                style={[styles.cardTitle, styles.gameTitle]}>
                Sua vez
              </Text>
              <Text style={[styles.feedbackText, styles.gameFeedbackText]}>
                {votedFoodIds.size}/{items.length} cards
              </Text>
              <View
                accessibilityLabel={`Progresso da rodada: ${voteProgress}%`}
                accessibilityRole="progressbar"
                accessibilityValue={{ min: 0, max: 100, now: voteProgress }}
                style={[styles.progressTrack, styles.gameProgressTrack]}>
                <View
                  style={[
                    styles.progressFill,
                    styles.gameProgressFill,
                    { width: `${voteProgress}%` },
                  ]}
                />
              </View>
              <Text style={styles.historySummaryText}>
                {matches.length > 0
                  ? `${matches.length} match${matches.length > 1 ? 'es' : ''}`
                  : 'Ainda sem match'}
              </Text>
            </View>

            {latestMatchFood ? (
              <View style={styles.latestMatchCard}>
                <Text style={styles.latestMatchEyebrow}>Último match</Text>
                <FoodArtwork
                  containerStyle={styles.latestMatchArtwork}
                  fallbackTextStyle={styles.latestMatchArtworkFallback}
                  food={latestMatchFood}
                  imageStyle={styles.latestMatchArtworkImage}
                />
                <Text accessibilityRole="header" style={styles.matchTitle}>
                  Deu match!
                </Text>
                <Text style={styles.matchFoodName}>{latestMatchFood.name}</Text>
                <Text style={styles.matchFoodDescription}>
                  {latestMatchFood.description ??
                    'Os dois gostaram dessa opção.'}
                </Text>
                {latestMatchAt ? (
                  <Text style={styles.latestMatchMeta}>
                    Match registrado às{' '}
                    {new Date(latestMatchAt).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    .
                  </Text>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void handleOpenNearbyPlaces(latestMatchFood.searchQuery)}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    styles.latestMatchButton,
                    pressed && styles.buttonPressed,
                  ]}>
                  <Text style={styles.latestMatchButtonText}>
                    Ver lugares próximos
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {currentItem ? (
              <View style={styles.foodCard}>
                <Text style={styles.foodEyebrow}>Card da vez</Text>
                <View style={styles.foodSpotlight} />
                <FoodArtwork
                  containerStyle={styles.foodArtwork}
                  fallbackTextStyle={styles.foodArtworkFallback}
                  food={currentItem.food}
                  imageStyle={styles.foodArtworkImage}
                />
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
                  Você votou em tudo. Aguardando a outra pessoa.
                </Text>
              </View>
            )}

            <View style={styles.historyCard}>
              <Text style={styles.cardTitle}>Histórico de matches</Text>
              {matches.length > 0 ? (
                matches.map((match) => (
                  <View key={`${match.roomId}:${match.foodId}`} style={styles.historyRow}>
                    <FoodArtwork
                      containerStyle={styles.historyArtwork}
                      fallbackTextStyle={styles.historyArtworkFallback}
                      food={match.food}
                      imageStyle={styles.historyArtworkImage}
                    />
                    <View style={styles.historyTextContent}>
                      <Text style={styles.historyFoodName}>{match.food.name}</Text>
                      <Text style={styles.historyFoodDescription}>
                        {match.food.description ??
                          'Entrou para a lista de matches feitos nessa sala.'}
                      </Text>
                      <Text style={styles.historyMeta}>
                        Match às{' '}
                        {new Date(match.matchedAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => void handleOpenNearbyPlaces(match.food.searchQuery)}
                      style={({ pressed }) => [
                        styles.historyAction,
                        pressed && styles.buttonPressed,
                      ]}>
                      <Text style={styles.historyActionText}>Ver mapa</Text>
                    </Pressable>
                  </View>
                ))
              ) : (
                <Text style={styles.feedbackText}>
                  Os matches aparecem aqui.
                </Text>
              )}
            </View>

            {errorMessage && (
              <Text accessibilityLiveRegion="polite" style={styles.inlineErrorText}>
                {errorMessage}
              </Text>
            )}
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
            <Text style={styles.feedbackText}>Tente novamente.</Text>
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
      <CelebrationOverlay
        message="Os dois curtiram a mesma comida. Hora de comemorar essa vitória."
        skipInitialTrigger
        title="Deu match!"
        tone="match"
        triggerKey={celebrationKey}
      />
    </ScreenShell>
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
  ambient: {
    borderRadius: radius.xl,
    minHeight: '100%',
    paddingBottom: spacing.xl,
  },
  section: {
    gap: spacing.lg,
  },
  feedbackCard: {
    ...shadows.floating,
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorder,
    borderRadius: radius.xl,
    borderWidth: 1,
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
    ...shadows.floating,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
  },
  roomEyebrow: {
    ...typography.label,
    color: 'rgba(255, 255, 255, 0.78)',
    textTransform: 'uppercase',
  },
  roomCode: {
    ...typography.code,
    color: colors.onPrimary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  roomMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  roomMetaChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  roomMetaChipText: {
    ...typography.caption,
    color: colors.onPrimary,
  },
  participantsCard: {
    ...shadows.card,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  cardTitle: {
    ...typography.heading,
    color: colors.text,
  },
  participantRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceWarm,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  participantIdentity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  participantAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primaryGlow,
    borderRadius: radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  participantAvatarText: {
    ...typography.button,
    color: colors.primaryDark,
  },
  participantName: {
    ...typography.button,
    color: colors.text,
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
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primarySoft,
    borderRadius: radius.lg,
    borderWidth: 1,
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
    ...shadows.soft,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: spacing.xl,
  },
  secondaryButton: {
    ...shadows.soft,
    alignItems: 'center',
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.cardBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
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
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  progressTrack: {
    backgroundColor: colors.primaryGlow,
    borderRadius: radius.pill,
    height: 14,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: '100%',
  },
  historySummaryText: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.82)',
  },
  gameFeedbackText: {
    color: 'rgba(255, 255, 255, 0.82)',
    textAlign: 'left',
  },
  gameProgressFill: {
    backgroundColor: colors.onPrimary,
  },
  gameProgressTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  gameTitle: {
    color: colors.onPrimary,
  },
  latestMatchCard: {
    ...shadows.floating,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  latestMatchEyebrow: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.76)',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  latestMatchArtwork: {
    borderRadius: radius.lg,
    height: 180,
    marginTop: spacing.sm,
    overflow: 'hidden',
    width: '100%',
  },
  latestMatchArtworkImage: {
    height: '100%',
    width: '100%',
  },
  latestMatchArtworkFallback: {
    fontSize: 68,
  },
  latestMatchMeta: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.76)',
    textAlign: 'center',
  },
  latestMatchButton: {
    backgroundColor: colors.surfaceRaised,
    marginTop: spacing.md,
    width: '100%',
  },
  foodCard: {
    ...shadows.floating,
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorder,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
  },
  foodEyebrow: {
    ...typography.label,
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  foodSpotlight: {
    backgroundColor: colors.primaryGlow,
    borderRadius: radius.pill,
    height: 180,
    opacity: 0.9,
    position: 'absolute',
    top: 58,
    width: 180,
  },
  foodArtwork: {
    ...shadows.card,
    borderRadius: radius.lg,
    height: 220,
    marginTop: spacing.md,
    overflow: 'hidden',
    width: '100%',
    zIndex: 1,
  },
  foodArtworkImage: {
    height: '100%',
    width: '100%',
  },
  foodArtworkFallback: {
    fontSize: 72,
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
  historyCard: {
    ...shadows.card,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  historyRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceWarm,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  historyArtwork: {
    borderRadius: radius.md,
    flexShrink: 0,
    height: 72,
    overflow: 'hidden',
    width: 72,
  },
  historyArtworkImage: {
    height: '100%',
    width: '100%',
  },
  historyArtworkFallback: {
    fontSize: 34,
  },
  historyTextContent: {
    flex: 1,
  },
  matchTitle: {
    ...typography.title,
    color: colors.onPrimary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  matchFoodName: {
    ...typography.heading,
    color: colors.onPrimary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  matchFoodDescription: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.82)',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  historyFoodName: {
    ...typography.button,
    color: colors.text,
  },
  historyFoodDescription: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  historyMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  historyAction: {
    ...shadows.soft,
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.cardBorderSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minWidth: 92,
    paddingHorizontal: spacing.md,
  },
  historyActionText: {
    ...typography.button,
    color: colors.text,
  },
  latestMatchButtonText: {
    ...typography.button,
    color: colors.primary,
    textAlign: 'center',
  },
  shareButton: {
    backgroundColor: colors.surfaceRaised,
    marginTop: spacing.lg,
  },
  shareButtonText: {
    color: colors.primary,
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

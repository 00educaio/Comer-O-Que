import type { Food } from '@/types/catalog';

export type MatchRoomStatus = 'waiting' | 'active' | 'matched' | 'expired';

export type MatchFilterSlug =
  | 'tudo'
  | 'sobremesa'
  | 'fome-grande'
  | 'regional'
  | 'estrangeira';

export type MatchVoteValue = 'like' | 'dislike';

export type MatchRoom = {
  id: string;
  code: string;
  status: MatchRoomStatus;
  filterSlug: MatchFilterSlug;
  maxParticipants: number;
  creatorParticipantId: string | null;
  matchFoodId: string | null;
  createdAt: string;
  startedAt: string | null;
  matchedAt: string | null;
  expiresAt: string;
};

export type MatchParticipant = {
  id: string;
  roomId: string;
  nickname: string;
  isCreator: boolean;
  joinedAt: string;
  lastSeenAt: string | null;
};

export type MatchRoomItem = {
  roomId: string;
  foodId: string;
  position: number;
  food: Food;
};

export type MatchVote = {
  id: string;
  roomId: string;
  participantId: string;
  foodId: string;
  vote: MatchVoteValue;
  createdAt: string;
};

export type MatchRoomMatch = {
  roomId: string;
  foodId: string;
  matchedAt: string;
  food: Food;
};

export type CreateMatchRoomResult = {
  roomId: string;
  code: string;
  participantId: string;
  isCreator: boolean;
  status: MatchRoomStatus;
  expiresAt: string;
};

export type JoinMatchRoomResult = {
  roomId: string;
  code: string;
  participantId: string;
  isCreator: boolean;
  status: MatchRoomStatus;
  expiresAt: string;
};

export type StartMatchRoomResult = {
  roomId: string;
  status: MatchRoomStatus;
  startedAt: string | null;
  expiresAt: string;
};

export type CastMatchVoteResult = {
  roomId: string;
  status: MatchRoomStatus;
  matchFoodId: string | null;
  matchedAt: string | null;
  expiresAt: string;
};

export type StoredMatchRoomSession = {
  roomId: string;
  code: string;
  participantId: string;
  nickname: string;
  isCreator: boolean;
  expiresAt: string;
};

export type MatchSubscriptionCallbacks = {
  onMatchesChange?: () => void;
  onParticipantsChange?: () => void;
  onRoomChange?: () => void;
  onVotesChange?: () => void;
  onError?: (error: Error) => void;
};

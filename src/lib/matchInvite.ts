import * as Linking from 'expo-linking';
import { Share } from 'react-native';

import { normalizeMatchRoomCode } from '@/services/matchService';

export function buildMatchInviteLink(code: string): string {
  const normalizedCode = normalizeMatchRoomCode(code);
  return Linking.createURL(`/match/${normalizedCode}`, {
    isTripleSlashed: true,
  });
}

export function buildMatchInviteMessage(code: string): string {
  const normalizedCode = normalizeMatchRoomCode(code);
  const link = buildMatchInviteLink(normalizedCode);

  return `Bora decidir o que comer? Entra no meu ModoMatch do Comer O Quê?: ${link} Código: ${normalizedCode}`;
}

export function shareMatchInvite(code: string): Promise<void> {
  const message = buildMatchInviteMessage(code);

  return Share.share({
    message,
    title: 'Convite do ModoMatch',
  }).then(() => undefined);
}

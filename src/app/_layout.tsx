import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/theme/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text, fontWeight: '800' },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="interview" options={{ title: 'Modo Entrevista' }} />
        <Stack.Screen name="roulette" options={{ title: 'Roleta' }} />
        <Stack.Screen name="match-coming-soon" options={{ title: 'ModoMatch' }} />
      </Stack>
    </>
  );
}

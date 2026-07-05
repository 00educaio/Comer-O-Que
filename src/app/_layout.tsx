import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors, typography } from '@/theme/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerBackButtonDisplayMode: 'minimal',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.surfaceRaised },
          headerTintColor: colors.primaryDark,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            ...typography.button,
            color: colors.text,
          },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="interview" options={{ title: 'Modo Entrevista' }} />
        <Stack.Screen name="roulette" options={{ title: 'Roleta' }} />
        <Stack.Screen name="match/index" options={{ title: 'ModoMatch' }} />
        <Stack.Screen name="match/create" options={{ title: 'Criar sala' }} />
        <Stack.Screen name="match/join" options={{ title: 'Entrar na sala' }} />
        <Stack.Screen name="match/[code]" options={{ title: 'Sala ModoMatch' }} />
      </Stack>
    </>
  );
}

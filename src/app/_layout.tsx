import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import {
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';

import { colors, typography } from '@/theme/theme';

SplashScreen.preventAutoHideAsync().catch(() => null);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => null);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerBackButtonDisplayMode: 'minimal',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.primaryStrong,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            ...typography.button,
            color: colors.text,
          },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="interview" options={{ title: 'Modo Entrevista' }} />
        <Stack.Screen name="roulette" options={{ title: 'Roleta' }} />
        <Stack.Screen name="suggestions" options={{ title: 'Sugestões' }} />
        <Stack.Screen name="match/index" options={{ title: 'ModoMatch' }} />
        <Stack.Screen name="match/create" options={{ title: 'Criar sala' }} />
        <Stack.Screen name="match/join" options={{ title: 'Entrar na sala' }} />
        <Stack.Screen name="match/[code]" options={{ title: 'Sala ModoMatch' }} />
      </Stack>
    </>
  );
}

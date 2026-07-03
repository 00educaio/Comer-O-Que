import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

export const supabaseEnvironment = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL,
  publishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
} as const;

export const isSupabaseConfigured = Boolean(
  supabaseEnvironment.url && supabaseEnvironment.publishableKey,
);

const isDevelopment = typeof __DEV__ !== 'undefined' && __DEV__;

if (!isSupabaseConfigured && isDevelopment) {
  throw new Error(
    'Supabase não configurado. Defina EXPO_PUBLIC_SUPABASE_URL e ' +
      'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY no ambiente local.',
  );
}

export const supabase =
  supabaseEnvironment.url && supabaseEnvironment.publishableKey
    ? createClient(
        supabaseEnvironment.url,
        supabaseEnvironment.publishableKey,
        {
          auth: {
            autoRefreshToken: false,
            detectSessionInUrl: false,
            persistSession: false,
          },
        },
      )
    : null;

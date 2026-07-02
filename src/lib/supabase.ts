export const supabaseEnvironment = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL,
  publishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
} as const;

export const isSupabaseConfigured = Boolean(
  supabaseEnvironment.url && supabaseEnvironment.publishableKey,
);

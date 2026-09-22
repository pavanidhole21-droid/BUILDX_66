import { getEnv } from "./env";

/**
 * Supabase client placeholder.
 * Ready for @supabase/supabase-js when backend is connected.
 * Keeps keys isolated to environment variables.
 */
const env = getEnv();

export const isSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseAnonKey && env.supabaseAnonKey !== "demo-anon-key"
);

export const supabaseClient = {
  isConfigured: isSupabaseConfigured,
  url: env.supabaseUrl,
};

export default supabaseClient;

import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from "@/constants/config";

const supabaseUrl =
  Config.supabase.url ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://xttgshjpntxsfpxxtifp.supabase.co";

const supabaseAnonKey =
  Config.supabase.anonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0dGdzaGpwbnR4c2ZweHh0aWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNTM2MzEsImV4cCI6MjEwNTYyOTYzMX0.GifkF4a3YqbuZcTJr7UDY_bbFiLhQxIS1K-9fimEPo8";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseAnonKey.startsWith("ey") &&
  supabaseAnonKey !== "demo-anon-key"
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export default supabase;


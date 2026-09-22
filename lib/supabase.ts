import { createClient } from "@supabase/supabase-js";
import Config from "@/constants/config";

const supabaseUrl = Config.supabase.url;
const supabaseAnonKey = Config.supabase.anonKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseAnonKey !== "demo-anon-key"
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export default supabase;

import Config from "@/constants/config";

/**
 * Validate and retrieve public environment variables
 */
export const getEnv = () => {
  return {
    apiUrl: Config.api.baseUrl,
    supabaseUrl: Config.supabase.url,
    supabaseAnonKey: Config.supabase.anonKey,
    isProduction: process.env.NODE_ENV === "production",
  };
};

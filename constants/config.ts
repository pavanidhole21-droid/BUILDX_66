/**
 * BloodHelp App Configuration
 * Reads from EXPO_PUBLIC_* environment variables safely with robust fallbacks.
 */
export const Config = {
  appName: "BloodHelp",
  tagline: "Find the blood help you need, where it is available.",
  subTagline: "Every Drop Counts, Every Life Matters",
  version: "1.0.0",

  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || "https://api.bloodhelp.org/v1",
    timeoutMs: 15000,
  },

  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
  },

  features: {
    enableMockData: true,
    enableEmergencySOS: true,
    staleThresholdMinutes: 60, // Mark inventory stale after 60 minutes
  },

  defaultLocation: {
    city: "Nagpur",
    state: "Maharashtra",
    latitude: 21.1458,
    longitude: 79.0882,
    formatted: "Nagpur, Maharashtra",
  },
};

export default Config;

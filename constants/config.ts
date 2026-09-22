/**
 * BloodHelp App Configuration
 * Reads from EXPO_PUBLIC_* environment variables safely with robust fallbacks.
 */
export const Config = {
  appName: "BloodHelp",
  tagline: "Find the blood help you need, where it is available.",
  subTagline: "Every Drop Counts, Every Life Matters",
  version: "1.0.0",
  emergencyHelpline: "9371742672",
  emergencyHelplineFormatted: "+91 9371742672",

  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || "https://api.bloodhelp.org/v1",
    timeoutMs: 15000,
  },

  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
  },

  googleSheet: {
    id: process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID || "16hqg2hqNV0dqeAFQif91SQa4PTDM6B3xHrARqTNO8EU",
    url: "https://docs.google.com/spreadsheets/d/16hqg2hqNV0dqeAFQif91SQa4PTDM6B3xHrARqTNO8EU/edit?usp=sharing",
    webhookUrl: process.env.EXPO_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL || "",
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

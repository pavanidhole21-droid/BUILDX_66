import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";
import { Session, User } from "@supabase/supabase-js";
import { UserProfile, UserRole, SupportedLanguage } from "@/types/user";
import { BloodGroup } from "@/types/blood";

const PROFILE_STORAGE_KEY = "@bloodhelp_user_profile";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    profileData: SignUpProfileData
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

export interface SignUpProfileData {
  name: string;
  phone: string;
  bloodGroup?: BloodGroup;
  city?: string;
  state?: string;
  role?: UserRole;
  language?: SupportedLanguage;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to persist profile
  const persistProfile = async (prof: UserProfile) => {
    try {
      setProfile(prof);
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(prof));
    } catch (e) {
      console.warn("Failed to persist profile to storage", e);
    }
  };

  // Fetch profile from DB or cached storage
  const fetchProfile = async (userId: string, currentUser?: User | null) => {
    const activeUser = currentUser || user;

    // Check cached profile first
    let cached: UserProfile | null = null;
    try {
      const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) cached = JSON.parse(stored);
    } catch {}

    let dbData: any = null;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        if (!error && data) {
          dbData = data;
        }
      } catch (e) {
        console.warn("Profile fetch from DB failed, using local/metadata fallback:", e);
      }
    }

    const meta = activeUser?.user_metadata || {};

    const resolvedName =
      dbData?.full_name ||
      dbData?.name ||
      meta.full_name ||
      meta.name ||
      cached?.name ||
      (activeUser?.email ? activeUser.email.split("@")[0] : "User");

    const resolvedEmail =
      dbData?.email || activeUser?.email || cached?.email || "";

    const resolvedPhone =
      dbData?.phone || meta.phone || cached?.phone || "";

    const resolvedBloodGroup =
      (dbData?.blood_group as BloodGroup) ||
      (meta.blood_group as BloodGroup) ||
      cached?.bloodGroup;

    const resolvedCity =
      dbData?.city || meta.city || cached?.city || "Nagpur";

    const resolvedState =
      dbData?.state || meta.state || cached?.state || "Maharashtra";

    const resolvedRole =
      (dbData?.role as UserRole) || cached?.role || "recipient";

    const resolvedLanguage =
      (dbData?.language as SupportedLanguage) || cached?.language || "en";

    const resolvedProfile: UserProfile = {
      id: userId,
      name: resolvedName,
      email: resolvedEmail,
      phone: resolvedPhone,
      bloodGroup: resolvedBloodGroup,
      city: resolvedCity,
      state: resolvedState,
      role: resolvedRole,
      isAvailableDonor: dbData?.is_available_donor ?? cached?.isAvailableDonor ?? false,
      language: resolvedLanguage,
    };

    await persistProfile(resolvedProfile);

    // If DB row was missing, upsert it in background
    if (supabase && !dbData && userId) {
      try {
        await supabase.from("profiles").upsert({
          id: userId,
          full_name: resolvedName,
          email: resolvedEmail,
          phone: resolvedPhone,
          blood_group: resolvedBloodGroup || null,
          city: resolvedCity,
          state: resolvedState,
          role: resolvedRole,
        });
      } catch {}
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id, user);
  };

  useEffect(() => {
    // 1. Immediately load local profile cache so UI feels instant
    AsyncStorage.getItem(PROFILE_STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.name) {
            setProfile(parsed);
          }
        } catch {}
      }
    });

    if (!supabase) {
      setLoading(false);
      return;
    }

    // 2. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // 3. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user);
      } else {
        setProfile(null);
        await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (
    identifier: string,
    password: string
  ): Promise<{ error: string | null }> => {
    if (!supabase) return { error: "Supabase not configured" };
    setLoading(true);

    try {
      const cleanId = identifier.trim();
      let emailToUse = cleanId;

      // 1. Check if user typed a 10-digit phone number
      const digitsOnly = cleanId.replace(/[^0-9]/g, "");
      if (digitsOnly.length === 10) {
        try {
          const { data: match } = await supabase
            .from("profiles")
            .select("email, full_name, phone")
            .ilike("phone", `%${digitsOnly}%`)
            .maybeSingle();

          if (match?.email) {
            emailToUse = match.email;
          } else {
            emailToUse = `${digitsOnly}@bloodhelp.org`;
          }
        } catch {}
      } else if (!cleanId.includes("@")) {
        emailToUse = `${cleanId.toLowerCase()}@bloodhelp.org`;
      }

      // 2. Attempt Supabase Auth signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      // 3. Handle "Email not confirmed" (Supabase verified password is correct, but email confirmation is active)
      if (
        error &&
        (error.message.toLowerCase().includes("email not confirmed") ||
          (error as any).code === "email_not_confirmed")
      ) {
        let profName = cleanId.includes("@") ? cleanId.split("@")[0] : cleanId;
        let profPhone = digitsOnly.length === 10 ? digitsOnly : "";

        try {
          const { data: existingProf } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", emailToUse)
            .maybeSingle();
          if (existingProf) {
            profName = existingProf.full_name || profName;
            profPhone = existingProf.phone || profPhone;
          }
        } catch {}

        const fallbackUser: User = {
          id: `usr_${Date.now()}`,
          aud: "authenticated",
          role: "authenticated",
          email: emailToUse,
          user_metadata: { full_name: profName, phone: profPhone },
          created_at: new Date().toISOString(),
          app_metadata: { provider: "email" },
        } as any;

        const resolvedProfile: UserProfile = {
          id: fallbackUser.id,
          name: profName,
          email: emailToUse,
          phone: profPhone,
          bloodGroup: "O+",
          city: "Nagpur",
          state: "Maharashtra",
          role: "recipient",
          isAvailableDonor: false,
          language: "en",
        };

        setUser(fallbackUser);
        await persistProfile(resolvedProfile);
        setLoading(false);
        return { error: null };
      }

      // 4. Handle other errors with clear messages
      if (error) {
        setLoading(false);
        if (
          error.message.toLowerCase().includes("invalid login credentials") ||
          (error as any).code === "invalid_credentials"
        ) {
          if (digitsOnly.length === 10) {
            return {
              error: `No account found for mobile "${cleanId}". Please click "Sign Up" below to register.`,
            };
          }
          return {
            error: `Invalid email or password. If you haven't created an account yet, please tap "Sign Up" below.`,
          };
        }
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id, data.user);
      }

      setLoading(false);
      return { error: null };
    } catch (err: any) {
      setLoading(false);
      return {
        error: err?.message || "An unexpected error occurred during login.",
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    profileData: SignUpProfileData
  ): Promise<{ error: string | null }> => {
    if (!supabase) return { error: "Supabase not configured" };
    setLoading(true);

    const cleanEmail = email.trim();
    const trimmedName = profileData.name.trim();

    // 1. Register with user_metadata so Supabase Auth securely stores full_name
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: trimmedName,
          name: trimmedName,
          phone: profileData.phone.trim(),
          blood_group: profileData.bloodGroup,
          city: profileData.city || "Nagpur",
          state: profileData.state || "Maharashtra",
          role: profileData.role || "recipient",
        },
      },
    });

    if (error) {
      setLoading(false);
      return { error: error.message };
    }

    // 2. Immediately create & persist the exact local profile
    const userId = data.user?.id || `usr_${Date.now()}`;
    const newProfile: UserProfile = {
      id: userId,
      name: trimmedName,
      email: cleanEmail,
      phone: profileData.phone.trim(),
      bloodGroup: profileData.bloodGroup,
      city: profileData.city || "Nagpur",
      state: profileData.state || "Maharashtra",
      role: profileData.role || "recipient",
      isAvailableDonor: false,
      language: profileData.language || "en",
    };

    await persistProfile(newProfile);

    // 3. Upsert into Supabase profiles table
    if (data.user) {
      try {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: trimmedName,
          email: cleanEmail,
          phone: profileData.phone.trim(),
          blood_group: profileData.bloodGroup || null,
          city: profileData.city || "Nagpur",
          state: profileData.state || "Maharashtra",
          role: profileData.role || "recipient",
          is_available_donor: false,
        });
      } catch (err) {
        console.warn("Could not insert profile into DB:", err);
      }
    }

    // 4. If auto-sign-in did not create session, attempt sign-in
    if (data.user && !data.session) {
      const signInRes = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (signInRes.data?.session) {
        setSession(signInRes.data.session);
        setUser(signInRes.data.user);
      }
    } else if (data.session) {
      setSession(data.session);
      setUser(data.user);
    }

    setLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (
    data: Partial<UserProfile>
  ): Promise<{ error: string | null }> => {
    if (!profile) return { error: "No profile found" };

    const updatedProfile: UserProfile = {
      ...profile,
      ...data,
      name: data.name !== undefined ? data.name.trim() : profile.name,
    };

    await persistProfile(updatedProfile);

    if (supabase && user) {
      try {
        const updates: Record<string, unknown> = {};
        if (data.name !== undefined) updates.full_name = data.name.trim();
        if (data.phone !== undefined) updates.phone = data.phone;
        if (data.bloodGroup !== undefined) updates.blood_group = data.bloodGroup;
        if (data.city !== undefined) updates.city = data.city;
        if (data.state !== undefined) updates.state = data.state;
        if (data.isAvailableDonor !== undefined)
          updates.is_available_donor = data.isAvailableDonor;

        await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id);

        if (data.name !== undefined) {
          await supabase.auth.updateUser({
            data: { full_name: data.name.trim(), name: data.name.trim() },
          });
        }
      } catch (e) {
        console.warn("Could not update remote profile:", e);
      }
    }

    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}


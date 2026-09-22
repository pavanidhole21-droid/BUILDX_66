import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "./supabase";
import { Session, User } from "@supabase/supabase-js";
import { UserProfile, UserRole, SupportedLanguage } from "@/types/user";
import { BloodGroup } from "@/types/blood";

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

  // Fetch profile from DB
  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error && data) {
      setProfile({
        id: data.id,
        name: data.full_name || data.name || "",
        email: data.email || user?.email || "",
        phone: data.phone || "",
        bloodGroup: data.blood_group as BloodGroup | undefined,
        city: data.city || "Nagpur",
        state: data.state || "Maharashtra",
        role: data.role as UserRole,
        isAvailableDonor: data.is_available_donor,
        language: (data.language as SupportedLanguage) || "en",
      });
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    if (!supabase) return { error: "Supabase not configured" };
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) return { error: error.message };
    return { error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    profileData: SignUpProfileData
  ): Promise<{ error: string | null }> => {
    if (!supabase) return { error: "Supabase not configured" };
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoading(false);
      return { error: error.message };
    }

    if (data.user) {
      // Insert profile row matching live schema (full_name, email, etc.)
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: profileData.name,
        email: email.trim(),
        phone: profileData.phone,
        blood_group: profileData.bloodGroup || null,
        city: profileData.city || "Nagpur",
        state: profileData.state || "Maharashtra",
        role: profileData.role || "recipient",
        is_available_donor: false,
      });

      if (profileError) {
        setLoading(false);
        return { error: profileError.message };
      }
    }

    setLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (
    data: Partial<UserProfile>
  ): Promise<{ error: string | null }> => {
    if (!supabase || !user) return { error: "Not authenticated" };

    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.full_name = data.name;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.bloodGroup !== undefined) updates.blood_group = data.bloodGroup;
    if (data.city !== undefined) updates.city = data.city;
    if (data.state !== undefined) updates.state = data.state;
    if (data.isAvailableDonor !== undefined) updates.is_available_donor = data.isAvailableDonor;

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (!error) await fetchProfile(user.id);
    return { error: error ? error.message : null };
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

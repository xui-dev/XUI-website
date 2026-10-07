"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { resetSavedCloudCache } from "@/hooks/useSavedComponents";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authMode: "signin" | "signup";
  openAuthModal: (mode?: "signin" | "signup") => void;
  closeAuthModal: () => void;
  signInWithGoogle: (redirectTo?: string) => Promise<{ error: AuthError | Error | null }>;
  signInWithGithub: (redirectTo?: string) => Promise<{ error: AuthError | Error | null }>;
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | Error | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error: AuthError | Error | null; data?: unknown }>;
  signOut: () => Promise<void>;
  updateUserProfile: (metadata: {
    full_name?: string;
    avatar_url?: string | null;
    avatar_palette?: number | null;
    name_updated_at?: string;
  }) => Promise<{ error: AuthError | Error | null; user?: User | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthModalOpen: false,
  authMode: "signin",
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signInWithGoogle: async () => ({ error: null }),
  signInWithGithub: async () => ({ error: null }),
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
  signOut: async () => {},
  updateUserProfile: async () => ({ error: null }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const supabase = createClient();

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // 1. Initial active session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // 2. Real-time auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const openAuthModal = useCallback((mode: "signin" | "signup" = "signin") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // 1. Google OAuth Sign In
  const signInWithGoogle = useCallback(
    async (targetRedirect?: string) => {
      if (!supabase) {
        return { error: new Error("Supabase is not configured yet") };
      }

      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://xui.dev";
      const redirectPath = targetRedirect || (typeof window !== "undefined" ? window.location.pathname : "/");
      const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(
        redirectPath
      )}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      return { error };
    },
    [supabase]
  );

  // 2. GitHub OAuth Sign In
  const signInWithGithub = useCallback(
    async (targetRedirect?: string) => {
      if (!supabase) {
        return { error: new Error("Supabase is not configured yet") };
      }

      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://xui.dev";
      const redirectPath = targetRedirect || (typeof window !== "undefined" ? window.location.pathname : "/");
      const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(
        redirectPath
      )}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: callbackUrl,
        },
      });

      return { error };
    },
    [supabase]
  );

  // 3. Email & Password Sign In
  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      if (!supabase) {
        return { error: new Error("Supabase is not configured yet") };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        closeAuthModal();
      }

      return { error };
    },
    [supabase, closeAuthModal]
  );

  // 3. Email & Password Sign Up
  const signUpWithEmail = useCallback(
    async (email: string, password: string, fullName?: string) => {
      if (!supabase) {
        return { error: new Error("Supabase is not configured yet") };
      }

      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://xui.dev";

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
          data: {
            full_name: fullName || email.split("@")[0],
          },
        },
      });

      return { data, error };
    },
    [supabase]
  );

  // 4. Sign Out
  const signOut = useCallback(async () => {
    if (!supabase) return;

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Supabase signOut error:", err);
    }

    if (typeof window !== "undefined") {
      try {
        // Purge guest and legacy shared keys
        localStorage.removeItem("xui_saved_components");
        localStorage.removeItem("xui_guest_saved_components");

        window.dispatchEvent(
          new CustomEvent("xui_saved_sync", { detail: { savedIds: [] } })
        );
      } catch {
        // LocalStorage may be restricted in private browsing
      }
    }

    // Reset module-level saved components cloud cache
    resetSavedCloudCache();

    setUser(null);
    setSession(null);
  }, [supabase]);

  // 5. Update User Profile
  const updateUserProfile = useCallback(
    async (metadata: {
      full_name?: string;
      avatar_url?: string | null;
      avatar_palette?: number | null;
      name_updated_at?: string;
    }) => {
      if (!supabase) {
        return { error: new Error("Supabase is not configured yet") };
      }

      const { data, error } = await supabase.auth.updateUser({
        data: metadata,
      });

      if (!error && data?.user) {
        setUser(data.user);
      }

      return { error, user: data?.user ?? null };
    },
    [supabase]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthModalOpen,
        authMode,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        signInWithGithub,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

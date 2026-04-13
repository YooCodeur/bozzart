"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile, ArtistProfile } from "@bozzart/api";

interface AuthContext {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  artistProfile: ArtistProfile | null;
  isLoading: boolean;
  isArtist: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContext>({
  user: null,
  session: null,
  profile: null,
  artistProfile: null,
  isLoading: true,
  isArtist: false,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Recuperer la session initiale
    supabase.auth.getSession().then(({ data: { session: s }, error }) => {
      if (error) {
        toast.error("Impossible de recuperer la session.");
        setIsLoading(false);
        return;
      }
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadProfile(s.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Ecouter les changements d'auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadProfile(s.user.id);
      } else {
        setProfile(null);
        setArtistProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function loadProfile(userId: string) {
    const { data: p, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      toast.error("Impossible de charger votre profil.");
      setIsLoading(false);
      return;
    }

    setProfile(p as Profile | null);

    if (p && (p.role === "artist" || p.role === "both")) {
      const { data: ap, error: artistError } = await supabase
        .from("artist_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (artistError && artistError.code !== "PGRST116") {
        toast.error("Impossible de charger votre profil artiste.");
      }

      setArtistProfile(ap as ArtistProfile | null);
    }

    setIsLoading(false);
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erreur lors de la deconnexion.");
      return;
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setArtistProfile(null);
  }

  const isArtist = profile?.role === "artist" || profile?.role === "both";

  return (
    <AuthContext.Provider value={{ user, session, profile, artistProfile, isLoading, isArtist, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

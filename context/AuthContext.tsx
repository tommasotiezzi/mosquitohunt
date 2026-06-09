"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface AuthState {
  profile: Profile | null;
  isGuest: boolean;            // true = anonymous (guest) session
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}
const Ctx = createContext<AuthState>({ profile: null, isGuest: false, loading: true, refresh: async () => {}, signOut: async () => {} });
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setProfile(null); setIsGuest(false); setLoading(false); return; }
    setIsGuest(Boolean((user as any).is_anonymous));
    const { data } = await supabase.from("profiles").select("id, username").eq("id", user.id).single();
    setProfile(data ?? null);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, [load, supabase]);

  const signOut = async () => { await supabase.auth.signOut(); setProfile(null); setIsGuest(false); };
  return <Ctx.Provider value={{ profile, isGuest, loading, refresh: load, signOut }}>{children}</Ctx.Provider>;
}
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Share2, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import PostCard from "@/components/PostCard";
import Dossier from "@/components/Dossier";
import AuthModal from "@/components/AuthModal";
import { C, DISPLAY, MONO, avatarColor, btnPrimary, btnGhost } from "@/lib/theme";
import { tierFor } from "@/lib/stats";
import type { FeedPost, KillStats } from "@/lib/types";

export default function ProfileView({ username }: { username: string }) {
  const supabase = createClient();
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<KillStats | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [showDossier, setShowDossier] = useState(false);
  const [auth, setAuth] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("id, username").eq("username", username).single();
      if (!prof) { setMissing(true); return; }
      setUserId(prof.id);
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase.rpc("kill_stats", { target: prof.id }),
        supabase.from("feed_ranked").select("*").eq("author_id", prof.id).order("created_at", { ascending: false }),
      ]);
      setStats(s?.[0] ?? null);
      setPosts((p as FeedPost[]) ?? []);
    })();
  }, [username, supabase]);

  const handleLogout = async () => { await signOut(); router.push("/"); };

  if (missing) return <div style={{ padding: 40, textAlign: "center", color: C.boneDim, fontFamily: MONO }}>No such hunter on record.</div>;
  if (!stats || !userId) return <div style={{ padding: 40, textAlign: "center", color: C.boneDim, fontFamily: MONO }}>Opening dossier…</div>;
  const isMe = profile?.id === userId;

  return (
    <div>
      <div style={{ padding: "18px 16px", borderBottom: `1px solid ${C.line}`, background: `linear-gradient(180deg, ${C.surface}, ${C.bg})` }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 6, background: avatarColor(username), display: "grid", placeItems: "center", fontFamily: DISPLAY, fontSize: 28, color: "#fff" }}>{username[0]?.toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: C.bone }}>@{username}{isMe ? " (you)" : ""}</div>
            <div style={{ display: "inline-block", marginTop: 4, fontFamily: MONO, fontSize: 10, letterSpacing: "1px", color: C.bone, background: C.bloodDeep, border: `1px solid ${C.bloodDark}`, padding: "3px 8px", borderRadius: 4 }}>{tierFor(stats.percentile)}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {([["TODAY", stats.kills_today], ["THIS WEEK", stats.kills_this_week], ["PERCENTILE", stats.percentile + "%"]] as const).map(([l, v]) => (
            <div key={l} style={{ flex: 1, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 8, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 26, color: C.blood, lineHeight: 1 }}>{v}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: C.boneFaint, letterSpacing: ".5px", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setShowDossier(true)} style={{ ...btnPrimary, width: "100%", marginTop: 14, padding: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Share2 size={16} /> SHARE {isMe ? "YOUR" : "THIS"} DOSSIER
        </button>
        {isMe && (
          <button onClick={handleLogout} style={{ ...btnGhost, width: "100%", marginTop: 10, padding: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: C.boneDim }}>
            <LogOut size={15} /> LOG OUT
          </button>
        )}
      </div>
      {posts.length === 0
        ? <div style={{ padding: "40px 16px", textAlign: "center", color: C.boneDim, fontFamily: MONO, fontSize: 13 }}>No kills on record yet. Suspicious.</div>
        : posts.map((p) => <PostCard key={p.id} post={p} onRequireAuth={() => setAuth(true)} />)}
      {showDossier && <Dossier userId={userId} username={username} onClose={() => setShowDossier(false)} />}
      {auth && <AuthModal onClose={() => setAuth(false)} />}
    </div>
  );
}
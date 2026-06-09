"use client";
import { useEffect, useState, useCallback } from "react";
import { Camera, Skull } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import PostCard from "@/components/PostCard";
import AuthModal from "@/components/AuthModal";
import ComposeModal, { type Draft } from "@/components/ComposeModal";
import { C, DISPLAY, MONO, avatarColor, btnPrimary, btnGhost } from "@/lib/theme";
import type { FeedPost } from "@/lib/types";

const PAGE = 20;

export default function Feed() {
  const supabase = createClient();
  const { profile, isGuest, refresh } = useAuth();
  const toast = useToast();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);
  const [compose, setCompose] = useState(false);
  const [quick, setQuick] = useState("");
  const [pending, setPending] = useState<Draft | null>(null);
  const [justPosted, setJustPosted] = useState<string[]>([]); // ids to keep pinned on top this session

  const load = useCallback(async (pinnedFirst: string[] = []) => {
    const { data } = await supabase.from("feed_ranked").select("*").order("hot_score", { ascending: false }).range(0, PAGE - 1);
    let rows = (data as FeedPost[]) ?? [];
    if (pinnedFirst.length) {
      // keep your just-posted items on top regardless of the ranking
      const pinned = pinnedFirst.map((id) => rows.find((r) => r.id === id)).filter(Boolean) as FeedPost[];
      const rest = rows.filter((r) => !pinnedFirst.includes(r.id));
      rows = [...pinned, ...rest];
    }
    setPosts(rows);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const hasText = quick.trim().length > 0;

  const createPost = useCallback(async (draft: Draft, profileId: string, username: string) => {
    let image_url: string | null = null;
    if (draft.file) {
      const path = `${profileId}/${Date.now()}-${draft.file.name}`;
      const { error: upErr } = await supabase.storage.from("evidence").upload(path, draft.file);
      if (upErr) return toast(upErr.message);
      image_url = supabase.storage.from("evidence").getPublicUrl(path).data.publicUrl;
    }
    const type = draft.file ? "snap" : "kill";
    const { data, error } = await supabase.from("posts").insert({
      author_id: profileId, type, body: draft.body || (type === "kill" ? "Confirmed a kill." : null),
      image_url, kill_count: 1,
    }).select("id, created_at").single();
    if (error || !data) return toast(error?.message || "Failed to post.");

    // Optimistically pin the new post to the very top of the feed.
    const optimistic: FeedPost = {
      id: data.id, author_id: profileId, author_username: username,
      type, body: draft.body || (type === "kill" ? "Confirmed a kill." : null),
      image_url, kill_count: 1, created_at: data.created_at,
      salute_count: 0, comment_count: 0, hot_score: Number.MAX_SAFE_INTEGER,
    };
    setJustPosted((j) => [data.id, ...j]);
    setPosts((p) => [optimistic, ...p.filter((x) => x.id !== data.id)]);
    toast(draft.file ? "Evidence logged. 🩸" : "Kill confirmed. 🩸");
  }, [supabase, toast]);

  const handleDraft = async (draft: Draft) => {
    if (draft.file && (!profile || isGuest)) { setPending(draft); setAuth(true); return; }
    let pid = profile?.id, uname = profile?.username;
    if (!pid) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error || !data.user) { setPending(draft); setAuth(true); return; }
      pid = data.user.id;
      uname = "killer_" + pid.slice(0, 8);
      refresh();
    }
    createPost(draft, pid!, uname!);
  };

  useEffect(() => {
    if (profile && !isGuest && pending) { createPost(pending, profile.id, profile.username); setPending(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, isGuest]);

  const logKill = () => {
    if (!hasText) return;
    handleDraft({ body: quick.trim(), file: null });
    setQuick("");
  };

  return (
    <div>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.line}`, background: C.surface }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 4, background: profile ? avatarColor(profile.username) : C.raised, display: "grid", placeItems: "center", fontFamily: DISPLAY, color: "#fff", flexShrink: 0 }}>
            {profile ? profile.username[0].toUpperCase() : "?"}
          </div>
          <input value={quick} onChange={(e) => setQuick(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && hasText) logKill(); }}
            placeholder="What did you kill?" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.bone, fontSize: 15 }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
          <span style={{ fontFamily: MONO, fontSize: 10, color: C.boneFaint, flex: 1 }}>Nothing to say? Bottom right to confirm a kill</span>
          <button onClick={() => setCompose(true)} style={{ ...btnGhost, display: "flex", alignItems: "center", gap: 6 }}><Camera size={15} /> SNAP A KILL</button>
          <button onClick={logKill} disabled={!hasText} style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: 6, opacity: hasText ? 1 : 0.4, cursor: hasText ? "pointer" : "not-allowed" }}><Skull size={15} /> LOG A KILL</button>
        </div>
      </div>

      {isGuest && (
        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.line}`, background: C.bloodDeep, fontFamily: MONO, fontSize: 12, color: C.bone, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <span>Hunting as a guest — your kills aren't saved to a name yet.</span>
          <button onClick={() => setAuth(true)} style={{ ...btnPrimary, padding: "6px 10px", whiteSpace: "nowrap" }}>CLAIM</button>
        </div>
      )}

      <div style={{ padding: "8px 16px 4px", fontFamily: MONO, fontSize: 10, letterSpacing: "1.5px", color: C.boneFaint }}>// FOR YOU — RANKED BY FRESHNESS &amp; SALUTES</div>

      {loading ? <div style={{ padding: 40, textAlign: "center", color: C.boneDim, fontFamily: MONO, fontSize: 13 }}>Pulling the case files…</div>
        : posts.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: C.boneDim, fontFamily: MONO, fontSize: 13 }}>No kills logged yet. Suspicious.</div>
          : posts.map((p) => <PostCard key={p.id} post={p} mine={!!profile && p.author_id === profile.id} onRequireAuth={() => setAuth(true)} />)}

      <button onClick={() => setCompose(true)} title="Confirm a kill"
        style={{ position: "fixed", right: "max(16px, calc(50% - 204px))", bottom: 88, width: 56, height: 56, borderRadius: 14, background: C.blood, border: "none", color: "#fff", boxShadow: "0 6px 20px rgba(209,26,42,.45)", cursor: "pointer", display: "grid", placeItems: "center", zIndex: 30 }}>
        <Skull size={26} />
      </button>

      {auth && (
        <AuthModal
          onClose={() => { setAuth(false); setPending(null); }}
          onAuthed={() => setAuth(false)}
          subtitle={pending ? "Create an account to post photo evidence 🩸" : isGuest ? "Claim your account to keep your kills 🩸" : undefined}
        />
      )}
      {compose && <ComposeModal onClose={() => setCompose(false)} onSubmit={handleDraft} />}
    </div>
  );
}
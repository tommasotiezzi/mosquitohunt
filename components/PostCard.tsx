"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, Share2, Droplet, MoreHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { C, DISPLAY, MONO, avatarColor, actBtn, btnSm } from "@/lib/theme";
import { ago } from "@/lib/time";
import type { FeedPost, Comment } from "@/lib/types";

const menuItem: React.CSSProperties = {
  display: "block", width: "100%", textAlign: "left", padding: "10px 14px",
  background: "none", border: "none", color: C.bone, fontFamily: MONO, fontSize: 12, cursor: "pointer",
};

export default function PostCard({ post, onRequireAuth, onShareDossier, defaultOpen = false }: {
  post: FeedPost; onRequireAuth: () => void; onShareDossier?: (uid: string, username: string) => void; defaultOpen?: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const { profile } = useAuth();
  const toast = useToast();
  const [saluted, setSaluted] = useState(false);
  const [salutes, setSalutes] = useState(post.salute_count);
  const [open, setOpen] = useState(defaultOpen);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState("");
  const [menu, setMenu] = useState(false);

  const linkToPost = !defaultOpen;
  const openPost = () => { if (linkToPost) router.push(`/post/${post.id}`); };
  const bodyCursor = linkToPost ? "pointer" : "default";
  const permalink = () => `${window.location.origin}/post/${post.id}`;

  const fetchComments = async () => {
    if (loaded) return;
    const { data } = await supabase
      .from("comments").select("id, body, created_at, profiles(username)")
      .eq("post_id", post.id).order("created_at");
    setComments((data ?? []).map((c: any) => ({ id: c.id, body: c.body, created_at: c.created_at, author_username: c.profiles?.username ?? "unknown" })));
    setLoaded(true);
  };

  useEffect(() => { if (defaultOpen) fetchComments(); /* eslint-disable-next-line */ }, [defaultOpen]);

  const toggleSalute = async () => {
    if (!profile) return onRequireAuth();
    const next = !saluted;
    setSaluted(next); setSalutes((n) => n + (next ? 1 : -1));
    if (next) await supabase.from("reactions").insert({ post_id: post.id, user_id: profile.id });
    else await supabase.from("reactions").delete().eq("post_id", post.id).eq("user_id", profile.id);
  };

  const toggleComments = async () => {
    if (linkToPost) return router.push(`/post/${post.id}`);
    const next = !open;
    setOpen(next);
    if (next) await fetchComments();
  };

  const addComment = async () => {
    if (!profile) return onRequireAuth();
    if (!draft.trim()) return;
    const { data } = await supabase.from("comments")
      .insert({ post_id: post.id, author_id: profile.id, body: draft.trim() }).select("id, body, created_at").single();
    if (data) setComments((c) => [...c, { id: data.id, body: data.body, created_at: data.created_at, author_username: profile.username }]);
    setDraft("");
  };

  // Record the share without blocking the native sheet (fire-and-forget).
  const logShare = () => { supabase.from("shares").insert({ post_id: post.id, user_id: profile?.id ?? null }).then(() => {}); };

  const share = async () => {
    // Dossier share (on profiles) keeps its custom behavior.
    if (onShareDossier) return onShareDossier(post.author_id, post.author_username);

    const url = permalink();
    const text = post.body ? `${post.body} — @${post.author_username} on MosquitoHunt` : `A confirmed kill by @${post.author_username} on MosquitoHunt`;

    // Native share sheet (iOS / Android / Safari). Must be called from the tap,
    // so we DON'T await anything before it.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "MosquitoHunt", text, url });
        logShare();
      } catch (e: any) {
        // User cancelled the sheet -> do nothing. Other errors -> fall back to copy.
        if (e?.name !== "AbortError") {
          try { await navigator.clipboard.writeText(url); toast("Link copied. 🩸"); logShare(); } catch {}
        }
      }
      return;
    }

    // Desktop / unsupported: copy the link.
    try { await navigator.clipboard.writeText(url); toast("Link copied. 🩸"); logShare(); }
    catch { toast("Couldn't share."); }
  };

  const copyLink = async () => {
    setMenu(false);
    try { await navigator.clipboard.writeText(permalink()); toast("Link copied. 🩸"); }
    catch { toast("Couldn't copy link."); }
  };

  const report = async () => {
    setMenu(false);
    if (!profile) return onRequireAuth();
    const { error } = await supabase.from("reports").insert({ post_id: post.id, reporter_id: profile.id });
    if (error) toast(error.code === "23505" ? "You already reported this." : error.message);
    else toast("Reported. We'll take a look.");
  };

  return (
    <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.line}` }}>
      <div style={{ display: "flex", gap: 10 }}>
        <Link href={`/profile/${post.author_username}`} style={{ width: 38, height: 38, borderRadius: 4, background: avatarColor(post.author_username), display: "grid", placeItems: "center", fontFamily: DISPLAY, fontSize: 18, color: "#fff", flexShrink: 0, textDecoration: "none" }}>
          {post.author_username[0]?.toUpperCase()}
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href={`/profile/${post.author_username}`} style={{ fontWeight: 700, fontSize: 14, color: C.bone, textDecoration: "none" }}>@{post.author_username}</Link>
            <Link href={`/post/${post.id}`} style={{ fontFamily: MONO, fontSize: 11, color: C.boneFaint, textDecoration: "none" }}>{ago(post.created_at)}</Link>
          </div>

          {post.type !== "text" && (
            <div onClick={openPost} style={{ cursor: bodyCursor, fontFamily: MONO, fontSize: 10, letterSpacing: "1px", color: C.blood, marginTop: 2 }}>
              ◢ CONFIRMED KILL{post.kill_count > 1 ? ` ×${post.kill_count}` : ""} · CASE #{post.id.slice(-4).toUpperCase()}
            </div>
          )}
          {post.body && <div onClick={openPost} style={{ cursor: bodyCursor, fontSize: 14.5, lineHeight: 1.5, marginTop: 6, color: C.bone, wordBreak: "break-word" }}>{post.body}</div>}
          {post.type === "snap" && (
            <div onClick={openPost} style={{ cursor: bodyCursor, marginTop: 10, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.line}`, background: "#000", position: "relative" }}>
              {post.image_url ? <img src={post.image_url} alt="" style={{ width: "100%", display: "block", maxHeight: 320, objectFit: "cover" }} />
                : <div style={{ height: 150, display: "grid", placeItems: "center", background: `radial-gradient(circle at 50% 40%, ${C.bloodDeep}, #000)` }}><Droplet size={40} color={C.blood} /></div>}
            </div>
          )}

          <div style={{ display: "flex", gap: 22, marginTop: 12, alignItems: "center" }}>
            <button onClick={toggleSalute} style={{ ...actBtn, color: saluted ? C.blood : C.boneDim }}>
              <span style={{ fontSize: 15 }}>🫡</span> <span style={{ fontFamily: MONO, fontSize: 12 }}>{salutes}</span>
            </button>
            <button onClick={toggleComments} style={{ ...actBtn, color: open ? C.blood : C.boneDim }}>
              <MessageCircle size={16} /> <span style={{ fontFamily: MONO, fontSize: 12 }}>{loaded ? comments.length : post.comment_count}</span>
            </button>
            <div style={{ marginLeft: "auto", display: "flex", gap: 18, alignItems: "center" }}>
              <button onClick={share} style={{ ...actBtn, color: C.boneDim }}><Share2 size={16} /></button>
              <div style={{ position: "relative" }}>
                <button onClick={() => setMenu((m) => !m)} style={{ ...actBtn, color: C.boneDim }}><MoreHorizontal size={16} /></button>
                {menu && (
                  <>
                    <div onClick={() => setMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 9 }} />
                    <div style={{ position: "absolute", right: 0, bottom: 24, background: C.raised, border: `1px solid ${C.line}`, borderRadius: 8, overflow: "hidden", zIndex: 10, minWidth: 150, boxShadow: "0 6px 20px rgba(0,0,0,.5)" }}>
                      <button onClick={copyLink} style={menuItem}>Copy link</button>
                      <button onClick={report} style={{ ...menuItem, color: C.blood, borderTop: `1px solid ${C.line}` }}>Report</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {open && (
            <div style={{ marginTop: 12, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
              {loaded && comments.length === 0 && <div style={{ fontFamily: MONO, fontSize: 12, color: C.boneFaint, marginBottom: 8 }}>No statements on record yet.</div>}
              {comments.map((cm) => (
                <div key={cm.id} style={{ marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: C.bone }}>@{cm.author_username} </span>
                  <span style={{ fontSize: 13, color: C.bone }}>{cm.body}</span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add to the record…"
                  style={{ flex: 1, background: C.raised, border: `1px solid ${C.line}`, borderRadius: 6, padding: "7px 10px", color: C.bone, fontSize: 13, outline: "none" }} />
                <button onClick={addComment} style={btnSm}>POST</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
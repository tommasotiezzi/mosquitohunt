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

// Squashed mosquito on a blood splatter — the signature "kill confirmed" mark.
const KillSplat = ({ size = 50 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <g fill={C.blood}>
      <circle cx="32" cy="33" r="15" />
      <circle cx="20" cy="26" r="7" />
      <circle cx="45" cy="24" r="6" />
      <circle cx="46" cy="42" r="8" />
      <circle cx="22" cy="44" r="6" />
      <circle cx="12" cy="18" r="2.4" /><circle cx="54" cy="14" r="2" /><circle cx="57" cy="33" r="1.8" />
      <circle cx="9" cy="36" r="1.6" /><circle cx="16" cy="54" r="2.6" /><circle cx="50" cy="53" r="2" /><circle cx="36" cy="57" r="1.5" />
    </g>
    <g fill={C.bloodDeep} opacity="0.5">
      <circle cx="30" cy="35" r="9" /><circle cx="41" cy="30" r="4" />
    </g>
    <g stroke="#160305" strokeWidth="1.6" strokeLinecap="round" fill="none">
      <path d="M30 30 L20 22" /><path d="M30 32 L18 30" /><path d="M30 34 L21 40" />
      <path d="M37 30 L47 23" /><path d="M37 32 L49 31" /><path d="M37 34 L46 41" />
    </g>
    <g fill="#160305">
      <ellipse cx="34" cy="33" rx="7" ry="2.6" transform="rotate(12 34 33)" />
      <circle cx="27" cy="31" r="2.3" />
    </g>
    <path d="M25 30 L19 27" stroke="#160305" strokeWidth="1.4" strokeLinecap="round" />
    <g fill={C.bone} opacity="0.45">
      <ellipse cx="36" cy="28" rx="6" ry="2.4" transform="rotate(-28 36 28)" />
      <ellipse cx="39" cy="36" rx="5.5" ry="2.2" transform="rotate(28 39 36)" />
    </g>
  </svg>
);

export default function PostCard({ post, onRequireAuth, onShareDossier, defaultOpen = false, mine = false }: {
  post: FeedPost; onRequireAuth: () => void; onShareDossier?: (uid: string, username: string) => void; defaultOpen?: boolean; mine?: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const { profile, isGuest, ensureSession } = useAuth();
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

  const isKill = post.type === "kill";
  const note = post.body && post.body !== "Confirmed a kill." ? post.body : null; // user's own commentary, if any

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
    const sess = profile ? { id: profile.id } : await ensureSession();
    if (!sess) return onRequireAuth();
    const next = !saluted;
    setSaluted(next); setSalutes((n) => n + (next ? 1 : -1));
    if (next) await supabase.from("reactions").insert({ post_id: post.id, user_id: sess.id });
    else await supabase.from("reactions").delete().eq("post_id", post.id).eq("user_id", sess.id);
  };

  const toggleComments = async () => {
    if (linkToPost) return router.push(`/post/${post.id}`);
    const next = !open;
    setOpen(next);
    if (next) await fetchComments();
  };

  const addComment = async () => {
    if (!profile || isGuest) return onRequireAuth();
    if (!draft.trim()) return;
    const { data } = await supabase.from("comments")
      .insert({ post_id: post.id, author_id: profile.id, body: draft.trim() }).select("id, body, created_at").single();
    if (data) setComments((c) => [...c, { id: data.id, body: data.body, created_at: data.created_at, author_username: profile.username }]);
    setDraft("");
  };

  const logShare = () => { supabase.from("shares").insert({ post_id: post.id, user_id: profile?.id ?? null }).then(() => {}); };

  const share = async () => {
    if (onShareDossier) return onShareDossier(post.author_id, post.author_username);
    const url = permalink();
    const text = post.body ? `${post.body} — @${post.author_username} on MosquitoHunt` : `A confirmed kill by @${post.author_username} on MosquitoHunt`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: "MosquitoHunt", text, url }); logShare(); }
      catch (e: any) { if (e?.name !== "AbortError") { try { await navigator.clipboard.writeText(url); toast("Link copied. 🩸"); logShare(); } catch {} } }
      return;
    }
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

  const commentLocked = !profile || isGuest;

  return (
    <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.line}`, background: mine ? "rgba(62,8,16,.18)" : "transparent" }}>
      <div style={{ display: "flex", gap: 10 }}>
        <Link href={`/profile/${post.author_username}`} style={{ width: 38, height: 38, borderRadius: 4, background: avatarColor(post.author_username), display: "grid", placeItems: "center", fontFamily: DISPLAY, fontSize: 18, color: "#fff", flexShrink: 0, textDecoration: "none" }}>
          {post.author_username[0]?.toUpperCase()}
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href={`/profile/${post.author_username}`} style={{ fontWeight: 700, fontSize: 14, color: C.bone, textDecoration: "none" }}>@{post.author_username}</Link>
            {mine && <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: ".5px", color: "#fff", background: C.blood, padding: "1px 5px", borderRadius: 3 }}>YOU</span>}
            <Link href={`/post/${post.id}`} style={{ fontFamily: MONO, fontSize: 11, color: C.boneFaint, textDecoration: "none" }}>{ago(post.created_at)}</Link>
          </div>

          {isKill && !note ? (
            // ── BARE KILL CONFIRMATION (no commentary) — distinct evidence card ──
            <div onClick={openPost} style={{ cursor: bodyCursor, marginTop: 8, display: "flex", alignItems: "center", gap: 12, background: "rgba(209,26,42,.07)", border: "1px solid rgba(209,26,42,.32)", borderRadius: 10, padding: "10px 14px" }}>
              <KillSplat size={50} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 21, lineHeight: 1, color: C.blood, letterSpacing: ".5px" }}>
                  CONFIRMED KILL{post.kill_count > 1 ? ` ×${post.kill_count}` : ""}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 9.5, color: C.boneDim, marginTop: 5, letterSpacing: "1px" }}>
                  CASE #{post.id.slice(-4).toUpperCase()} · STATUS: TERMINATED
                </div>
              </div>
            </div>
          ) : isKill ? (
            // ── KILL WITH COMMENTARY — normal post look, small case label ──
            <>
              <div onClick={openPost} style={{ cursor: bodyCursor, fontFamily: MONO, fontSize: 10, letterSpacing: "1px", color: C.blood, marginTop: 2 }}>
                ◢ CONFIRMED KILL{post.kill_count > 1 ? ` ×${post.kill_count}` : ""} · CASE #{post.id.slice(-4).toUpperCase()}
              </div>
              <div onClick={openPost} style={{ cursor: bodyCursor, fontSize: 14.5, lineHeight: 1.5, marginTop: 6, color: C.bone, wordBreak: "break-word" }}>{note}</div>
            </>
          ) : post.type === "snap" ? (
            // ── PHOTO EVIDENCE ──
            <>
              <div onClick={openPost} style={{ cursor: bodyCursor, fontFamily: MONO, fontSize: 10, letterSpacing: "1px", color: C.blood, marginTop: 2 }}>
                ◢ EVIDENCE FILED · CASE #{post.id.slice(-4).toUpperCase()}
              </div>
              {post.body && <div onClick={openPost} style={{ cursor: bodyCursor, fontSize: 14.5, lineHeight: 1.5, marginTop: 6, color: C.bone, wordBreak: "break-word" }}>{post.body}</div>}
              <div onClick={openPost} style={{ cursor: bodyCursor, marginTop: 10, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.line}`, background: "#000" }}>
                {post.image_url ? <img src={post.image_url} alt="" style={{ width: "100%", display: "block", maxHeight: 320, objectFit: "cover" }} />
                  : <div style={{ height: 150, display: "grid", placeItems: "center", background: `radial-gradient(circle at 50% 40%, ${C.bloodDeep}, #000)` }}><Droplet size={40} color={C.blood} /></div>}
              </div>
            </>
          ) : (
            // ── PLAIN TEXT ──
            post.body && <div onClick={openPost} style={{ cursor: bodyCursor, fontSize: 14.5, lineHeight: 1.5, marginTop: 6, color: C.bone, wordBreak: "break-word" }}>{post.body}</div>
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
              {commentLocked ? (
                <button onClick={onRequireAuth} style={{ ...btnSm, width: "100%", padding: "9px 10px", marginTop: 4 }}>🔒 SIGN UP TO COMMENT</button>
              ) : (
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add to the record…"
                    style={{ flex: 1, background: C.raised, border: `1px solid ${C.line}`, borderRadius: 6, padding: "7px 10px", color: C.bone, fontSize: 13, outline: "none" }} />
                  <button onClick={addComment} style={btnSm}>POST</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
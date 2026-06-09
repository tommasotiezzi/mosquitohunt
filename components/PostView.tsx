"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import PostCard from "@/components/PostCard";
import AuthModal from "@/components/AuthModal";
import { C, MONO } from "@/lib/theme";
import type { FeedPost } from "@/lib/types";

export default function PostView({ id }: { id: string }) {
  const supabase = createClient();
  const [post, setPost] = useState<FeedPost | null>(null);
  const [missing, setMissing] = useState(false);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    supabase.from("feed_ranked").select("*").eq("id", id).single()
      .then(({ data }) => { if (data) setPost(data as FeedPost); else setMissing(true); });
  }, [id, supabase]);

  if (missing) return <div style={{ padding: 40, textAlign: "center", color: C.boneDim, fontFamily: MONO }}>This case file no longer exists.</div>;
  if (!post) return <div style={{ padding: 40, textAlign: "center", color: C.boneDim, fontFamily: MONO }}>Pulling the file…</div>;

  return (
    <div>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 10, letterSpacing: "1.5px", color: C.boneFaint, display: "flex", justifyContent: "space-between" }}>
        <span>// CASE FILE #{post.id.slice(-4).toUpperCase()}</span>
        <Link href="/" style={{ color: C.boneDim, textDecoration: "none" }}>← FEED</Link>
      </div>
      <PostCard post={post} onRequireAuth={() => setAuth(true)} defaultOpen />
      {auth && <AuthModal onClose={() => setAuth(false)} />}
    </div>
  );
}
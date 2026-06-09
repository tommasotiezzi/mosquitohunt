"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { C, DISPLAY, BODY, MONO, overlay, btnGhost } from "@/lib/theme";
import { LINES } from "@/lib/stats";
import type { KillStats } from "@/lib/types";

export default function Dossier({ userId, username, onClose }: { userId: string; username: string; onClose: () => void }) {
  const supabase = createClient();
  const [s, setS] = useState<KillStats | null>(null);
  useEffect(() => {
    supabase.rpc("kill_stats", { target: userId }).then(({ data }) => setS(data?.[0] ?? null));
  }, [userId, supabase]);
  if (!s) return <div onClick={onClose} style={overlay} />;
  const line = LINES[(username.length + s.kills_this_week) % LINES.length];
  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ background: C.bg, border: `1.5px solid ${C.bloodDark}`, borderRadius: 12, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 80% 0%, ${C.bloodDeep}, transparent 55%)`, pointerEvents: "none" }} />
          <div style={{ background: C.blood, padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: DISPLAY, fontSize: 16, color: "#fff", letterSpacing: ".5px" }}>MOSQUITOHUNT</span>
            <span style={{ fontFamily: MONO, fontSize: 9, color: "#fff", letterSpacing: "1px" }}>CASE FILE · CONFIDENTIAL</span>
          </div>
          <div style={{ padding: "22px 18px 18px", position: "relative" }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.boneFaint, letterSpacing: "1px" }}>SUBJECT</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 30, color: C.bone, lineHeight: 1, marginTop: 2 }}>@{username}</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginTop: 18 }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 84, color: C.blood, lineHeight: 0.85 }}>{s.kills_this_week}</span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: C.boneDim, marginBottom: 12 }}>CONFIRMED<br />THIS WEEK</span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: C.boneDim, marginTop: 4 }}>{s.kills_today} today · classification below</div>
            <div style={{ marginTop: 16, border: `1px dashed ${C.bloodDark}`, borderRadius: 8, padding: "12px 14px", background: "rgba(62,8,16,.35)" }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: C.boneFaint, letterSpacing: "1px" }}>CLASSIFICATION · {s.percentile}TH PERCENTILE</div>
              <div style={{ fontFamily: DISPLAY, fontSize: 26, color: C.bone, lineHeight: 1, marginTop: 4 }}>{s.tier_title}</div>
            </div>
            <div style={{ fontFamily: BODY, fontSize: 13, fontStyle: "italic", color: C.boneDim, marginTop: 14 }}>&ldquo;{line}&rdquo;</div>
            <div style={{ position: "absolute", right: 10, top: 14, border: `2.5px solid ${C.blood}`, color: C.blood, fontFamily: DISPLAY, fontSize: 13, letterSpacing: "1px", padding: "4px 8px", borderRadius: 4, transform: "rotate(-10deg)", opacity: 0.9 }}>CONFIRMED</div>
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 9, color: C.boneFaint, letterSpacing: ".5px" }}>
              <span>FILE #{(s.kills_this_week * 137 + username.length).toString().padStart(6, "0")}</span>
              <span>mosquitohunt.org</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.boneDim }}>Screenshot to share your dossier 🩸</div>
          <button onClick={onClose} style={{ ...btnGhost, marginTop: 10 }}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}

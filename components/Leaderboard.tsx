"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { C, DISPLAY, MONO, avatarColor } from "@/lib/theme";

type Row = { user_id: string; username: string; kills: number; salutes: number };

export default function Leaderboard() {
  const supabase = createClient();
  const { profile } = useAuth();
  const [mode, setMode] = useState<"kills" | "salutes">("kills");
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    supabase.from("leaderboard_weekly").select("*").order(mode, { ascending: false }).limit(50)
      .then(({ data }) => setRows((data as Row[]) ?? []));
  }, [mode, supabase]);

  return (
    <div>
      <div style={{ padding: "16px 16px 8px" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 30, color: C.bone }}>THE BOARD</div>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "1px", color: C.boneFaint }}>// WEEKLY STANDINGS · RESETS MONDAY 00:00</div>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "4px 16px 14px" }}>
        {([["kills", "MOST KILLS"], ["salutes", "MOST SALUTED"]] as const).map(([m, l]) => (
          <button key={m} onClick={() => setMode(m)}
            style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: `1px solid ${mode === m ? C.blood : C.line}`, background: mode === m ? C.bloodDeep : "transparent", color: mode === m ? C.bone : C.boneDim, fontFamily: MONO, fontSize: 11, letterSpacing: ".5px", cursor: "pointer" }}>{l}</button>
        ))}
      </div>
      {rows.map((r, i) => (
        <Link key={r.user_id} href={`/profile/${r.username}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: `1px solid ${C.line}`, background: r.user_id === profile?.id ? C.bloodDeep : "transparent" }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 22, width: 30, color: i === 0 ? C.blood : C.boneDim, textAlign: "center" }}>{i + 1}</div>
          <div style={{ width: 36, height: 36, borderRadius: 4, background: avatarColor(r.username), display: "grid", placeItems: "center", fontFamily: DISPLAY, fontSize: 17, color: "#fff" }}>{r.username[0]?.toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.bone, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>@{r.username}{r.user_id === profile?.id ? " (you)" : ""}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 24, color: C.blood, lineHeight: 1 }}>{mode === "kills" ? r.kills : r.salutes}</div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: C.boneFaint, letterSpacing: ".5px" }}>{mode === "kills" ? "KILLS" : "SALUTES"}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

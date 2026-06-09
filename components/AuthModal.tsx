"use client";
import { useState } from "react";
import Link from "next/link";
import { Skull } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { C, DISPLAY, MONO, overlay, btnPrimary, input } from "@/lib/theme";

export default function AuthModal({ onClose, onAuthed, subtitle }: {
  onClose: () => void; onAuthed?: () => void; subtitle?: string;
}) {
  const supabase = createClient();
  const { refresh } = useAuth();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [uname, setUname] = useState("killer_" + Math.random().toString(36).slice(2, 6));
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr("");
    if (!email.includes("@")) return setErr("That's not an email. We need somewhere to send your case files.");
    if (pw.length < 6) return setErr("Password too short. The mosquitoes will guess it.");
    if (mode === "signup") {
      if (!uname.trim()) return setErr("Pick a hunter name.");
      if (!agree) return setErr("You must accept the Terms & Privacy Policy.");
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password: pw, options: { data: { username: uname.trim() } } });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
      }
      await refresh();
      if (onAuthed) onAuthed(); else onClose();
    } catch (e: any) {
      setErr(e.message || "Something went wrong.");
    } finally { setBusy(false); }
  };

  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 360, background: C.surface, border: `1px solid ${C.bloodDark}`, borderRadius: 14, padding: 22 }}>
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <Skull size={26} color={C.blood} />
          <div style={{ fontFamily: DISPLAY, fontSize: 28, marginTop: 4, color: C.bone }}>{mode === "signup" ? "JOIN THE HUNT" : "WELCOME BACK"}</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.boneDim }}>{subtitle ?? "Keep score. Take revenge."}</div>
        </div>
        {mode === "signup" && <input value={uname} onChange={(e) => setUname(e.target.value)} placeholder="hunter name" style={input} />}
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" style={input} />
        <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="password" style={input} />
        {mode === "signup" && (
          <label style={{ display: "flex", gap: 9, alignItems: "flex-start", marginTop: 12, cursor: "pointer" }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 2, accentColor: C.blood, width: 16, height: 16 }} />
            <span style={{ fontSize: 12, color: C.boneDim, lineHeight: 1.45 }}>
              I agree to the{" "}
              <Link href="/terms" target="_blank" style={{ color: C.blood }}>Terms</Link>{" & "}
              <Link href="/privacy" target="_blank" style={{ color: C.blood }}>Privacy Policy</Link>.
              I confirm I am only hunting mosquitoes.
            </span>
          </label>
        )}
        {err && <div style={{ fontFamily: MONO, fontSize: 11, color: C.blood, marginTop: 10 }}>{err}</div>}
        <button onClick={submit} disabled={busy} style={{ ...btnPrimary, width: "100%", padding: 13, marginTop: 14, fontSize: 14, opacity: busy ? 0.6 : 1 }}>
          {busy ? "..." : mode === "signup" ? "CONFIRM & POST" : "LOG IN"}
        </button>
        <div onClick={() => setMode(mode === "signup" ? "login" : "signup")} style={{ textAlign: "center", marginTop: 12, fontFamily: MONO, fontSize: 11, color: C.boneDim, cursor: "pointer" }}>
          {mode === "signup" ? "Already hunting? Log in" : "New here? Join the hunt"}
        </div>
      </div>
    </div>
  );
}
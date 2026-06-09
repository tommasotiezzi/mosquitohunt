"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Skull, Home, Trophy, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";
import { C, DISPLAY, MONO } from "@/lib/theme";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [auth, setAuth] = useState(false);

  const goProfile = () => { if (!profile) setAuth(true); else router.push(`/profile/${profile.username}`); };

  const nav: [string, any, string, () => void][] = [
    ["/", Home, "FEED", () => router.push("/")],
    ["/leaderboard", Trophy, "THE BOARD", () => router.push("/leaderboard")],
    ["profile", User, "DOSSIER", goProfile],
  ];

  return (
    <div
      style={{
        maxWidth: 440,
        margin: "0 auto",
        minHeight: "100dvh",
        background: C.bg,
        color: C.bone,
        position: "relative",
        borderLeft: `1px solid ${C.line}`,
        borderRight: `1px solid ${C.line}`,
        boxShadow: "0 0 60px rgba(0,0,0,.6)",
      }}
    >
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(12,10,10,.92)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${C.line}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Skull size={20} color={C.blood} />
          <span style={{ fontFamily: DISPLAY, fontSize: 24, letterSpacing: ".5px", color: C.bone }}>MOSQUITO<span style={{ color: C.blood }}>HUNT</span></span>
        </Link>
        {profile
          ? <Link href={`/profile/${profile.username}`} style={{ width: 30, height: 30, borderRadius: 4, background: C.blood, display: "grid", placeItems: "center", fontFamily: DISPLAY, fontSize: 16, color: "#fff", textDecoration: "none" }}>{profile.username[0].toUpperCase()}</Link>
          : <button onClick={() => setAuth(true)} style={{ background: C.blood, color: "#fff", border: "none", borderRadius: 6, padding: "7px 11px", fontFamily: MONO, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>JOIN THE HUNT</button>}
      </header>

      <main style={{ paddingBottom: 76 }}>{children}</main>

      <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 440, background: "rgba(12,10,10,.96)", borderTop: `1px solid ${C.line}`, display: "flex", zIndex: 20 }}>
        {nav.map(([key, Icon, label, fn]) => {
          const active = key === "profile" ? pathname.startsWith("/profile") : pathname === key;
          return (
            <button key={label} onClick={fn} style={{ flex: 1, background: "none", border: "none", padding: "10px 0 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", color: active ? C.blood : C.boneFaint }}>
              <Icon size={20} /><span style={{ fontSize: 9, fontFamily: MONO, letterSpacing: ".5px" }}>{label}</span>
            </button>
          );
        })}
      </nav>
      {auth && <AuthModal onClose={() => setAuth(false)} />}
    </div>
  );
}
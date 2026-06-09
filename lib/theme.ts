import type React from "react";
// Centralized design tokens — the true-crime / public-health-bulletin brand.
export const C = {
  bg: "#0C0A0A", surface: "#141010", raised: "#1B1514", line: "#2A2120",
  blood: "#D11A2A", bloodDark: "#7A0E18", bloodDeep: "#3E0810",
  bone: "#EDE6DC", boneDim: "#9A8F86", boneFaint: "#5E544F",
};
export const DISPLAY = "Impact, 'Haettenschweiler', 'Arial Narrow Bold', sans-serif";
export const BODY = "var(--font-body), -apple-system, system-ui, 'Segoe UI', Roboto, sans-serif";
export const MONO = "ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, monospace";

export const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(6,4,4,.82)", backdropFilter: "blur(4px)", zIndex: 50, display: "grid", placeItems: "center", padding: 18 };
export const btnPrimary: React.CSSProperties = { background: C.blood, color: "#fff", border: "none", borderRadius: 8, padding: "9px 14px", fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: ".5px", cursor: "pointer" };
export const btnGhost: React.CSSProperties = { background: "transparent", color: C.bone, border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 14px", fontFamily: MONO, fontSize: 12, letterSpacing: ".5px", cursor: "pointer" };
export const btnSm: React.CSSProperties = { background: C.blood, color: "#fff", border: "none", borderRadius: 6, padding: "7px 11px", fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: ".5px", cursor: "pointer" };
export const actBtn: React.CSSProperties = { background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: 0 };
export const input: React.CSSProperties = { width: "100%", background: C.raised, border: `1px solid ${C.line}`, borderRadius: 8, padding: "11px 13px", color: C.bone, fontSize: 14, fontFamily: BODY, outline: "none", marginTop: 10 };

const palette = ["#D11A2A", "#A8323F", "#7A0E18", "#B5443A", "#8C2630", "#C0152B"];
export const avatarColor = (name: string) => palette[(name || "?").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length];

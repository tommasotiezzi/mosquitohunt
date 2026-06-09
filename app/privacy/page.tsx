import { C, DISPLAY, MONO } from "@/lib/theme";

const wrap: React.CSSProperties = { padding: "24px 18px 60px", maxWidth: 640, margin: "0 auto", lineHeight: 1.6, fontSize: 14, color: C.bone };
const h1: React.CSSProperties = { fontFamily: DISPLAY, fontSize: 34, marginBottom: 4 };
const h2: React.CSSProperties = { fontFamily: DISPLAY, fontSize: 20, marginTop: 26, marginBottom: 8, color: C.bone };
const note: React.CSSProperties = { fontFamily: MONO, fontSize: 11, color: C.boneDim, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 8, padding: 12, margin: "12px 0" };

export default function Privacy() {
  return (
    <div style={wrap}>
      <h1 style={h1}>PRIVACY POLICY</h1>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.boneDim }}>Effective: {"{{EFFECTIVE_DATE}}"}</div>
      <p style={note}>⚠️ Draft template — you are an EU (Italy) operator; replace {"{{placeholders}}"} and have a privacy lawyer review before launch.</p>

      <h2 style={h2}>1. Who we are</h2>
      <p>MosquitoHunt is operated by {"{{OPERATOR_NAME}}"}, based in {"{{CITY, ITALY}}"}, the data controller. Privacy contact: {"{{contact@mosquitohunt.org}}"}.</p>
      <h2 style={h2}>2. What we collect</h2>
      <p>Your email address (for your account and login); the content you post (posts, photos, salutes, comments — public by design); and technical/usage data collected automatically by our hosting and auth providers (IP address, device info, timestamps, logs). We do not sell your data and run no advertising or third-party tracking.</p>
      <h2 style={h2}>3. Legal basis (GDPR Art. 6)</h2>
      <p>Providing the Service (contract); keeping it secure (legitimate interests); responding to you (legitimate interests/consent).</p>
      <h2 style={h2}>4. Processors</h2>
      <p>Supabase (database, auth, file storage) and {"{{HOSTING_PROVIDER, e.g. Vercel}}"} (hosting), under data-processing agreements. {"{{Confirm your Supabase region; if data leaves the EU/EEA, disclose the transfer and safeguard (e.g. SCCs). Easiest: pick an EU region.}}"}</p>
      <h2 style={h2}>5. Retention</h2>
      <p>We keep account data and posts while your account is active. Deleting a post removes it; deleting your account removes your personal data within {"{{30}}"} days, except where law requires retention.</p>
      <h2 style={h2}>6. Your rights</h2>
      <p>Access, rectification, erasure, restriction, objection, portability, and withdrawal of consent — email {"{{contact@mosquitohunt.org}}"}. You may also complain to the Italian authority, the Garante per la protezione dei dati personali (garante.it).</p>
      <h2 style={h2}>7. Cookies</h2>
      <p>Only strictly-necessary authentication storage to keep you logged in. No advertising or analytics cookies.</p>
      <h2 style={h2}>8. Children</h2>
      <p>Not intended for anyone under {"{{16}}"}. We don’t knowingly collect data from anyone below this age.</p>
    </div>
  );
}

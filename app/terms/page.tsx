import { C, DISPLAY, MONO } from "@/lib/theme";

const wrap: React.CSSProperties = { padding: "24px 18px 60px", maxWidth: 640, margin: "0 auto", lineHeight: 1.6, fontSize: 14, color: C.bone };
const h1: React.CSSProperties = { fontFamily: DISPLAY, fontSize: 34, marginBottom: 4 };
const h2: React.CSSProperties = { fontFamily: DISPLAY, fontSize: 20, marginTop: 26, marginBottom: 8, color: C.bone };
const note: React.CSSProperties = { fontFamily: MONO, fontSize: 11, color: C.boneDim, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 8, padding: 12, margin: "12px 0" };

export default function Terms() {
  return (
    <div style={wrap}>
      <h1 style={h1}>TERMS &amp; CONDITIONS</h1>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.boneDim }}>Effective: {"{{EFFECTIVE_DATE}}"}</div>
      <p style={note}>⚠️ Draft template — replace {"{{placeholders}}"} and have a lawyer review before launch.</p>

      <h2 style={h2}>1. Acceptance</h2>
      <p>By creating an account or using MosquitoHunt (the “Service”), you agree to these Terms and to our Privacy Policy. If you don’t agree, don’t use the Service.</p>
      <h2 style={h2}>2. Who can use it</h2>
      <p>You must be at least {"{{16}}"} years old. By using the Service you confirm you meet this age requirement.</p>
      <h2 style={h2}>3. What MosquitoHunt is</h2>
      <p>MosquitoHunt is a humor and entertainment social platform where users log and share their mosquito kills, salute and comment on others’ posts, and appear on leaderboards. It is meant for fun. Nothing on the Service is professional advice of any kind, including pest-control, medical, or safety advice.</p>
      <h2 style={h2}>4. Your content</h2>
      <p>You keep ownership of what you post. By posting, you grant us a non-exclusive, worldwide, royalty-free licence to host and display it for the purpose of operating and promoting the Service. You are responsible for what you post and confirm you have the right to post it and that it does not break the law or these Terms.</p>
      <h2 style={h2}>5. Acceptable use</h2>
      <p>You must not post: content harming people or vertebrate animals (the Service is for mosquitoes and similar nuisance insects only); promotion of dangerous or illegal pest-control methods; or any illegal, hateful, harassing, threatening, or sexual content, spam, doxxing, impersonation, or IP infringement.</p>
      <h2 style={h2}>6. Mosquitoes, methods, and your responsibility</h2>
      <p>We do not instruct you on how to kill mosquitoes and do not endorse any method any user describes or shows. How you deal with mosquitoes is your decision and responsibility, and you must comply with all applicable laws and safety requirements. We are not liable for actions you take based on anything you see here.</p>
      <h2 style={h2}>7. Moderation</h2>
      <p>We may review, remove, or restrict any content and suspend or terminate any account at our discretion, including for breaches of these Terms.</p>
      <h2 style={h2}>8. Disclaimers &amp; liability</h2>
      <p>The Service is provided “as is” without warranties, to the maximum extent permitted by law. To the maximum extent permitted by law, we are not liable for indirect or consequential damages, or for content posted by users. {"{{A lawyer should adapt this for Italian/EU consumer law.}}"}</p>
      <h2 style={h2}>9. Governing law</h2>
      <p>These Terms are governed by the laws of Italy, with disputes subject to the courts of {"{{CITY}}"}, without prejudice to mandatory consumer-protection rights you have where you live.</p>
      <h2 style={h2}>10. Contact</h2>
      <p>{"{{contact@mosquitohunt.org}}"}</p>
    </div>
  );
}

"use client";
import { useState, useRef } from "react";
import { Camera, Skull, X } from "lucide-react";
import { C, DISPLAY, BODY, overlay, btnPrimary, btnGhost } from "@/lib/theme";

export type Draft = { body: string; file: File | null };

export default function ComposeModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (draft: Draft) => void }) {
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const submit = () => { onSubmit({ body: body.trim(), file }); onClose(); };

  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 380, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 22, color: C.bone }}>FILE A REPORT</span>
          <X size={20} color={C.boneDim} onClick={onClose} style={{ cursor: "pointer" }} />
        </div>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Describe the kill, or leave it blank and just confirm one."
          style={{ width: "100%", minHeight: 80, background: C.raised, border: `1px solid ${C.line}`, borderRadius: 8, padding: 12, color: C.bone, fontSize: 14, fontFamily: BODY, outline: "none", resize: "none" }} />
        {preview && <img src={preview} alt="" style={{ width: "100%", borderRadius: 8, marginTop: 10, maxHeight: 220, objectFit: "cover" }} />}
        <input ref={fileRef} type="file" accept="image/*" onChange={pick} style={{ display: "none" }} />
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button onClick={() => fileRef.current?.click()} style={{ ...btnGhost, display: "flex", alignItems: "center", gap: 6 }}>
            <Camera size={15} /> {preview ? "CHANGE" : "ADD EVIDENCE"}
          </button>
          <button onClick={submit} style={{ ...btnPrimary, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Skull size={15} /> CONFIRM KILL
          </button>
        </div>
      </div>
    </div>
  );
}
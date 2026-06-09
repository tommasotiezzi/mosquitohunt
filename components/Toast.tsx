"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { C, MONO } from "@/lib/theme";

const Ctx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<{ id: number; msg: string }[]>([]);
  const push = useCallback((msg: string) => {
    const id = Math.random();
    setItems((s) => [...s, { id, msg }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 2200);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div style={{ position: "fixed", bottom: 150, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 60, pointerEvents: "none" }}>
        {items.map((t) => (
          <div key={t.id} style={{ background: C.raised, border: `1px solid ${C.bloodDark}`, color: C.bone, padding: "9px 16px", borderRadius: 8, fontSize: 13, fontFamily: MONO }}>{t.msg}</div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

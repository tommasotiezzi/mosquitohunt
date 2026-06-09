import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/Toast";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "MosquitoHunt — confirm your kills",
  description: "Log your mosquito kills. Climb the board. Take revenge. A humor case file.",
  openGraph: { title: "MosquitoHunt", description: "Confirm your kills.", url: "https://mosquitohunt.org" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

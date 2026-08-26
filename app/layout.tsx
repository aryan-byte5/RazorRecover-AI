import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RazorRecover AI - Autonomous AI Payment Revenue Recovery",
  description:
    "Production-grade AI fintech SaaS platform that autonomously diagnoses payment failures, orchestrates context-aware recovery workflows, and maximizes revenue recovery.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 font-sans">
        {children}
      </body>
    </html>
  );
}

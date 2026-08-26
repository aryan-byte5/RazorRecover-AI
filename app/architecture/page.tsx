"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Architecture3D from "@/components/Architecture3D";
import Link from "next/link";
import {
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  Database,
  Workflow,
  Server,
  ArrowRight,
  Code2,
  Terminal,
  Activity,
} from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="py-16 border-b border-border/40 bg-card/30 gradient-mesh">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <Workflow className="w-3.5 h-3.5" />
              Production Architecture & Security Specifications
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Built for Fintech-Grade Reliability
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Engineered with clean domain boundaries, autonomous agent orchestration, cryptographic idempotency, and multi-tenant workspace isolation.
            </p>
          </div>
        </section>

        {/* Architecture Flow Chart & Breakdown */}
        <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Interactive 3D Architecture Stack */}
          <Architecture3D />

          {/* Architecture Diagram Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <Server className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">End-to-End System Pipeline</h2>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
                Next.js 14 App Router + Prisma ORM
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-2">
                <div className="text-[10px] font-bold text-blue-500 uppercase">1. Ingestion Layer</div>
                <div className="font-bold text-foreground">Webhook / API</div>
                <p className="text-[11px] text-muted-foreground">
                  Signature verification, idempotency checking, payment payload normalization.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-2">
                <div className="text-[10px] font-bold text-indigo-500 uppercase">2. Intelligence Layer</div>
                <div className="font-bold text-foreground">6-Agent Orchestrator</div>
                <p className="text-[11px] text-muted-foreground">
                  Diagnosis, Customer Context, Strategy Matrix, Guardrail Enforcement.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                <div className="text-[10px] font-bold text-emerald-500 uppercase">3. Execution Layer</div>
                <div className="font-bold text-foreground">Action Dispatcher</div>
                <p className="text-[11px] text-muted-foreground">
                  Smart Retry, Payment Link generation, WhatsApp Business API templates.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-2">
                <div className="text-[10px] font-bold text-purple-500 uppercase">4. Persistence Layer</div>
                <div className="font-bold text-foreground">PostgreSQL / Prisma</div>
                <p className="text-[11px] text-muted-foreground">
                  Immutable audit trail, real-time analytics aggregates, cohort metrics.
                </p>
              </div>
            </div>
          </div>

          {/* Architectural Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-border bg-card space-y-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">Multi-Tenant Isolation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every transaction, customer profile, and recovery case is strictly partitioned by `workspaceId`. Sessions are protected with HMAC JWT tokens and bcrypt password hashing.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">Zero-Key Fallback Engine</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The platform includes an autonomous Deterministic Fintech Expert reasoning engine that delivers instant probabilistic diagnoses without requiring external API keys.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card space-y-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">Persistent Audit Trail</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every diagnostic conclusion, guardrail check, and recovery outcome is recorded immutably in PostgreSQL, providing full audit compliance.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 border-t border-border bg-card/30 text-center">
          <div className="max-w-3xl mx-auto px-4 space-y-4">
            <h3 className="text-2xl font-bold text-foreground">
              Ready to verify the architecture?
            </h3>
            <p className="text-xs text-muted-foreground">
              Explore the live dashboard and inspect real-time database transactions.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 transition-all inline-flex items-center gap-2"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DecisionTree3D from "@/components/DecisionTree3D";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Receipt,
  Cpu,
  UserCheck,
  Layers,
  ShieldCheck,
  Send,
  CheckCircle2,
  Play,
  RotateCw,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

const STEPS = [
  {
    step: "01",
    name: "Payment Failure Webhook",
    icon: Receipt,
    color: "blue",
    title: "Gateway Event Ingestion",
    description:
      "A checkout payment fails on Razorpay. The webhook event is ingested with cryptographic signature verification and idempotency deduplication.",
    telemetry: {
      event: "payment.failed",
      payment_id: "pay_N9823f9823",
      amount: "₹4,999.00",
      method: "UPI (aarav@okhdfcbank)",
      error_code: "GATEWAY_TIMEOUT",
      bank: "HDFC Core Switch",
    },
  },
  {
    step: "02",
    name: "AI Root Cause Diagnosis",
    icon: Cpu,
    color: "indigo",
    title: "Real-Time AI Diagnosis Agent",
    description:
      "The diagnostic agent classifies whether the failure is transient network latency, core issuer bank downtime, expired credentials, or balance deficiency.",
    telemetry: {
      category: "ISSUER_DOWNTIME",
      root_cause: "HDFC Core Banking UPI Switch latency > 8000ms",
      downtime_prob: "92%",
      transient: "true",
      confidence: "94%",
    },
  },
  {
    step: "03",
    name: "Customer Context Modeling",
    icon: UserCheck,
    color: "purple",
    title: "Customer Context Agent",
    description:
      "Synthesizes customer LTV, past recovery responsiveness, preferred communication rails, and contact fatigue history to determine propensity.",
    telemetry: {
      customer: "Aarav Sharma",
      profile: "VIP Tier (LTV ₹1.85L)",
      success_rate: "92% (12/13 payments)",
      preferred_channel: "WhatsApp Business API",
      fatigue_risk: "LOW (0 contacts in 24h)",
    },
  },
  {
    step: "04",
    name: "Strategy Selection & Scoring",
    icon: Layers,
    color: "amber",
    title: "Recovery Strategy Agent",
    description:
      "Scores 7 potential interventions and calculates the expected recovery value ($EV = P_{rec} \\times \\text{Amount} - \\text{Friction}$).",
    telemetry: {
      chosen_strategy: "PAYMENT_LINK",
      channel: "WhatsApp",
      recovery_prob: "88%",
      expected_recovery: "₹4,399.12",
      rationale: "UPI payment link via WhatsApp converts highest during active HDFC switch lag.",
    },
  },
  {
    step: "05",
    name: "Guardrail Policy Validation",
    icon: ShieldCheck,
    color: "emerald",
    title: "Guardrail & Compliance Engine",
    description:
      "Enforces stopping rules, max 3 retries, quiet hours, anti-fraud checks, and high-value human sign-off thresholds.",
    telemetry: {
      status: "APPROVED",
      max_retries_check: "PASS (1 of 3)",
      quiet_hours_check: "PASS (15:30 IST)",
      min_prob_check: "PASS (88% > 35%)",
      fraud_shield: "PASS (Risk score 0.12)",
    },
  },
  {
    step: "06",
    name: "Outcome & Incremental ROI",
    icon: CheckCircle2,
    color: "cyan",
    title: "Autonomous Execution & Verification",
    description:
      "Dispatches the intervention, tracks customer settlement confirmation, records incremental lift over baseline, and updates compliance logs.",
    telemetry: {
      status: "RECOVERED",
      settled_amount: "₹4,999.00",
      latency: "4.2 minutes",
      baseline_would_win: "false (0% baseline lift)",
      net_incremental_revenue: "+₹4,999.00",
    },
  },
];

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0);

  const current = STEPS[activeStep];
  const Icon = current.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="py-16 border-b border-border/40 bg-card/30 gradient-mesh">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Recovery Pipeline Visualizer
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              How RazorRecover AI Works
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Step through the exact 6-stage autonomous workflow executed for every failed payment transaction.
            </p>
          </div>
        </section>

        {/* Step-by-Step Interactive Workflow */}
        <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* 3D Decision Tree Interactive Flow */}
          <DecisionTree3D />

          {/* Step Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {STEPS.map((s, idx) => {
              const StepIcon = s.icon;
              const isSelected = activeStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold">{s.step}</span>
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold truncate text-foreground">{s.name}</div>
                </button>
              );
            })}
          </div>

          {/* Active Step Deep Dive Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-border rounded-2xl p-6 sm:p-8 bg-card shadow-sm">
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">
                  STAGE {current.step} OF 06
                </span>
                <span className="text-xs font-semibold text-muted-foreground">{current.name}</span>
              </div>

              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                {current.title}
              </h2>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {current.description}
              </p>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : STEPS.length - 1))}
                  className="px-4 py-2 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
                >
                  ← Previous Stage
                </button>
                <button
                  onClick={() => setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : 0))}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Next Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live Telemetry Mock Output */}
            <div className="lg:col-span-6 p-6 rounded-xl border border-border/80 bg-zinc-950 text-zinc-100 font-mono text-xs shadow-inner space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>LIVE_TELEMETRY_FRAME</span>
                </div>
                <span className="text-[10px]">STAGE_{current.step}</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                {Object.entries(current.telemetry).map(([k, v], idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-zinc-400">{k}:</span>
                    <span className="text-emerald-400 font-semibold">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 border-t border-border bg-card/30 text-center">
          <div className="max-w-3xl mx-auto px-4 space-y-4">
            <h3 className="text-2xl font-bold text-foreground">
              Ready to test the live multi-agent engine?
            </h3>
            <p className="text-xs text-muted-foreground">
              Open the interactive demo console and run investigations on live failed payments.
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

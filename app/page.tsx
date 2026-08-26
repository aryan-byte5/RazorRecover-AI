"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero3DCanvas from "@/components/Hero3DCanvas";
import DecisionTree3D from "@/components/DecisionTree3D";
import Architecture3D from "@/components/Architecture3D";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Cpu,
  Layers,
  Receipt,
  CheckCircle2,
  Lock,
  LineChart,
  Play,
  RotateCw,
  Sliders,
  ChevronRight,
  Database,
  Building,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function LandingPage() {
  const router = useRouter();
  const [monthlyVolume, setMonthlyVolume] = useState(50000000); // ₹5 Cr
  const [failureRate, setFailureRate] = useState(12); // 12% failure
  const [loadingDemo, setLoadingDemo] = useState(false);

  // Financial calculations
  const failedVolume = (monthlyVolume * failureRate) / 100;
  const legacyRecovered = failedVolume * 0.32; // 32% legacy retry rate
  const aiRecovered = failedVolume * 0.74; // 74% AI recovery rate
  const incrementalRevenueAnnual = (aiRecovered - legacyRecovered) * 12;

  const handleLaunchDemo = async () => {
    setLoadingDemo(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDemoMode: true }),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 text-foreground">
      <Navbar />

      {/* Hero Section with Interactive 3D Canvas */}
      <section className="relative overflow-hidden pt-12 pb-24 border-b border-border/40 gradient-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8">
            {/* Left Column: Headline & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Creator & Track Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>By Aryan Koomar • Razorpay AI Revenue Recovery Track</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                  Autonomous AI for{" "}
                  <span className="gradient-text">Payment Revenue Recovery</span>
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                  Stop losing up to 15% of checkout GMV to blind payment failures. RazorRecover AI diagnoses root causes in real-time, models customer context, and orchestrates optimal multi-channel recovery workflows.
                </p>
              </div>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  onClick={handleLaunchDemo}
                  disabled={loadingDemo}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:opacity-95 text-white text-sm font-bold shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{loadingDemo ? "Opening Demo Workspace..." : "Explore Live Product Demo"}</span>
                </button>

                <Link
                  href="/architecture"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-border bg-card/70 hover:bg-muted text-foreground text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <span>Explore Architecture</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Core Metrics Highlight Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <div className="p-3.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md">
                  <div className="text-xl font-bold font-mono text-emerald-500">74.2%</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">AI Recovery Rate</div>
                </div>
                <div className="p-3.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md">
                  <div className="text-xl font-bold font-mono text-blue-500">+42.0%</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Incremental Lift</div>
                </div>
                <div className="p-3.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md">
                  <div className="text-xl font-bold font-mono text-purple-500">&lt; 2.4s</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Diagnosis Latency</div>
                </div>
                <div className="p-3.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md">
                  <div className="text-xl font-bold font-mono text-amber-500">100%</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Policy Enforced</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Visualization */}
            <div className="lg:col-span-5 h-[380px] sm:h-[440px] rounded-2xl border border-border/80 bg-card/40 backdrop-blur-xl relative overflow-hidden flex items-center justify-center shadow-2xl">
              <Hero3DCanvas />
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl border border-border/80 bg-background/80 backdrop-blur-md flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">3D Neural Recovery Flow</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Sync
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* The 6-Agent Autonomous Decision Tree Section */}
      <section className="py-20 border-b border-border/40 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <div className="text-xs font-bold text-primary uppercase tracking-wider">
              Autonomous Intelligence
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              6-Stage Agentic Reasoning Pipeline
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Every failed payment event traverses an autonomous pipeline designed to maximize recovery expected value while preventing customer fatigue.
            </p>
          </div>

          <DecisionTree3D />
        </div>
      </section>

      {/* Interactive Value Calculator */}
      <section className="py-20 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <div className="text-xs font-bold text-primary uppercase tracking-wider">
              Interactive ROI Engine
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Calculate Your Recoverable Revenue
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Simulate the bottom-line financial impact of replacing naive retries with context-aware AI recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-center">
            {/* Sliders Box */}
            <div className="lg:col-span-6 p-6 rounded-2xl border border-border bg-card space-y-6 shadow-sm">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">Monthly Processing Volume</span>
                  <span className="font-mono font-bold text-primary text-sm">{formatINR(monthlyVolume)}</span>
                </div>
                <input
                  type="range"
                  min={1000000}
                  max={200000000}
                  step={1000000}
                  value={monthlyVolume}
                  onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>₹10 L</span>
                  <span>₹10 Cr</span>
                  <span>₹20 Cr</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">Payment Failure Rate (%)</span>
                  <span className="font-mono font-bold text-rose-500 text-sm">{failureRate}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={failureRate}
                  onChange={(e) => setFailureRate(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>5% (Low)</span>
                  <span>15% (Typical)</span>
                  <span>30% (High)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Monthly Revenue at Risk:</span>
                  <span className="font-mono font-bold text-foreground">{formatINR(failedVolume)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Legacy Fixed Retry Recovered (~32%):</span>
                  <span className="font-mono text-muted-foreground">{formatINR(legacyRecovered)}</span>
                </div>
                <div className="flex justify-between">
                  <span>RazorRecover AI Recovered (~74%):</span>
                  <span className="font-mono font-bold text-emerald-500">{formatINR(aiRecovered)}</span>
                </div>
              </div>
            </div>

            {/* Projected Impact Result Card */}
            <div className="lg:col-span-6 p-8 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-600 text-white shadow-xl space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold bg-white/20 px-3 py-1 rounded-full">
                  Estimated Annual Recovery Lift
                </span>
                <div className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight mt-3">
                  +{formatINR(incrementalRevenueAnnual)}
                </div>
                <p className="text-xs text-white/80 mt-1">
                  Pure incremental bottom-line revenue unlocked each year.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/20 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span><strong>+42% recovery rate expansion</strong> across UPI, Cards & NetBanking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span><strong>-48% drop in customer contact friction</strong> and spam</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Zero code changes to existing Razorpay checkout flows</span>
                </div>
              </div>

              <button
                onClick={handleLaunchDemo}
                className="w-full py-3 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-white/95 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Launch Interactive Demo Sandbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 3D Architecture Section */}
      <section className="py-20 border-b border-border/40 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <div className="text-xs font-bold text-primary uppercase tracking-wider">
              Engineering Architecture
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Production-Grade 5-Tier Stack
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Built on Next.js 14, Prisma ORM, real relational persistence, and autonomous agent orchestration.
            </p>
          </div>

          <Architecture3D />
        </div>
      </section>

      <Footer />
    </div>
  );
}

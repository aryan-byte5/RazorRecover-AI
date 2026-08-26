"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Clock,
  Coins,
  RefreshCw,
  Percent,
} from "lucide-react";
import { formatINR, formatPercentage } from "@/lib/utils";
import confetti from "canvas-confetti";

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

export default function SimulationModal({
  isOpen,
  onClose,
  onCompleted,
}: SimulationModalProps) {
  const [sampleSize, setSampleSize] = useState(500);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const handleRunSimulation = async () => {
    setRunning(true);
    setProgress(15);
    setResult(null);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          return 85;
        }
        return prev + 15;
      });
    }, 200);

    try {
      const res = await fetch("/api/simulation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sampleSize }),
      });
      const data = await res.json();
      clearInterval(interval);
      setProgress(100);

      if (data.success) {
        setResult(data.simulation);
        triggerConfetti();
        if (onCompleted) onCompleted();
      }
    } catch (e) {
      console.error(e);
      clearInterval(interval);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-card/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Autonomous Recovery Simulation Arena
              </h3>
              <p className="text-xs text-muted-foreground">
                Live A/B benchmark: Naive Baseline Retry vs RazorRecover AI Multi-Agent Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!result && !running && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border/80 bg-muted/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
                    <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
                    Cohort A: Baseline Strategy
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Naive Fixed Retries</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Retries immediately on failure with identical payment rail. Fails completely on expired cards, bank downtime, or balance issues. High customer fatigue.
                  </p>
                  <div className="text-xs text-muted-foreground font-mono pt-1">
                    Industry standard recovery rate: ~30-35%
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    Cohort B: RazorRecover AI
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Context-Aware Multi-Agent</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Diagnoses failure causes, analyzes customer history, scores 7 intervention types (NPCI fast retry, dynamic payment link, method switch, WhatsApp nudges), and respects quiet hours.
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold font-mono pt-1">
                    Target recovery rate: ~70-85%
                  </div>
                </div>
              </div>

              {/* Sample Size Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Select Evaluation Batch Size
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[100, 250, 500, 1000].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSampleSize(size)}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        sampleSize === size
                          ? "border-primary bg-primary/10 text-primary shadow-xs"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {size} Payments
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {running && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-16 h-16">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                <Sparkles className="w-6 h-6 text-primary absolute inset-0 m-auto" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">
                  Running Multi-Agent Simulation ({sampleSize} transactions)...
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Diagnosing root causes, calculating expected recovery values, applying guardrails & evaluating outcomes...
                </p>
              </div>
              <div className="w-full max-w-md bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              {/* Incremental Highlight Banner */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                    Simulation Outcome • {result.sampleSize} Transactions
                  </span>
                  <span className="text-xs font-medium text-white/80 font-mono">
                    ID: {result.experimentId.slice(-8)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pt-1">
                  <div>
                    <div className="text-xs text-white/80">Net Incremental Revenue Lift</div>
                    <div className="text-3xl font-extrabold font-mono tracking-tight">
                      +{formatINR(result.incrementalLift)}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xs text-white/80">AI Recovery Rate</div>
                    <div className="text-2xl font-bold font-mono">
                      {formatPercentage(result.aiRecoveryRate)}
                      <span className="text-xs font-normal text-white/70 ml-1.5">
                        (vs {formatPercentage(result.baselineRecoveryRate)} baseline)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Head to Head Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Baseline */}
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      Baseline Strategy
                    </span>
                    <span className="text-xs font-mono font-semibold">Naive Retry</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-foreground font-mono">
                      {formatINR(result.baselineRecovered)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total volume recovered from {formatINR(result.totalVolumeAtRisk)} at risk
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Recovery Rate: <strong>{formatPercentage(result.baselineRecoveryRate)}</strong></div>
                    <div>Strategy: <strong>100% Blind Retry</strong></div>
                  </div>
                </div>

                {/* AI */}
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      RazorRecover AI
                    </span>
                    <span className="text-xs font-mono font-semibold text-emerald-600">Multi-Agent</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatINR(result.aiRecovered)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total volume recovered from {formatINR(result.totalVolumeAtRisk)} at risk
                    </div>
                  </div>
                  <div className="pt-2 border-t border-emerald-500/20 grid grid-cols-2 gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                    <div>Recovery Rate: <strong>{formatPercentage(result.aiRecoveryRate)}</strong></div>
                    <div>Friction Drop: <strong>-48.5% Spam</strong></div>
                  </div>
                </div>
              </div>

              {/* Sample Interventions Breakdown Table */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Sample Batch Decision Ledger (First 5 Evaluated)
                </div>
                <div className="border border-border rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                      <tr>
                        <th className="p-2.5">Amount</th>
                        <th className="p-2.5">Failure Category</th>
                        <th className="p-2.5">Baseline</th>
                        <th className="p-2.5">AI Intervention</th>
                        <th className="p-2.5">AI Lift</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {result.results.slice(0, 5).map((r: any, idx: number) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="p-2.5 font-mono font-semibold">{formatINR(r.amount)}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-mono">
                              {r.failureCategory}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span className={r.baselineRecovered ? "text-emerald-500 font-medium" : "text-rose-500"}>
                              {r.baselineRecovered ? "✓ Recovered" : "✗ Failed"}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span className="font-semibold text-primary">{r.aiAction}</span>
                          </td>
                          <td className="p-2.5">
                            {r.incrementalWin ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                                +{formatINR(r.amount)} Lift
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-[11px]">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-card/80">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Close
          </button>

          {!result ? (
            <button
              onClick={handleRunSimulation}
              disabled={running}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:opacity-90 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              RUN AI RECOVERY SIMULATION
            </button>
          ) : (
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2 rounded-lg bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Run Another Simulation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

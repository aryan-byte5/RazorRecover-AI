"use client";

import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import SimulationModal from "@/components/SimulationModal";
import {
  FlaskConical,
  Sparkles,
  Play,
  RotateCw,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Receipt,
  CheckCircle2,
} from "lucide-react";
import { formatINR, formatPercentage, formatTimeAgo } from "@/lib/utils";

export default function ExperimentsPage() {
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExperiments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      if (data.recentExperiments) {
        setExperiments(data.recentExperiments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AppHeader
        title="AI vs Baseline Simulation Arena"
        subtitle="A/B experimental simulation benchmarking autonomous recovery vs naive retries"
        onOpenSimulation={() => setIsSimModalOpen(true)}
      />

      <div className="p-6 space-y-6 flex-1 max-w-7xl">
        {/* Arena Action Banner */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Live Simulation Arena
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Test Context-Aware Multi-Agent Recovery
            </h2>
            <p className="text-xs text-white/90 leading-relaxed">
              Run statistical batches through both strategies simultaneously. Compare recovery probability, incremental revenue (₹), and customer friction reductions in real-time.
            </p>
          </div>

          <button
            onClick={() => setIsSimModalOpen(true)}
            className="px-8 py-4 rounded-xl bg-white text-blue-700 font-extrabold text-sm shadow-xl hover:bg-white/95 transition-all transform active:scale-95 cursor-pointer shrink-0 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-blue-700" />
            <span>RUN AI RECOVERY SIMULATION</span>
          </button>
        </div>

        {/* Experiment History */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">
              Simulation Benchmark History
            </h3>
            <button
              onClick={fetchExperiments}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="border border-border rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Simulation Run</th>
                  <th className="p-3.5">Sample Size</th>
                  <th className="p-3.5">Volume at Risk</th>
                  <th className="p-3.5">Baseline Recovered</th>
                  <th className="p-3.5">AI Recovered</th>
                  <th className="p-3.5 font-bold text-emerald-600">Net Incremental Lift</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Loading simulation runs...
                    </td>
                  </tr>
                )}

                {!loading && experiments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No simulation experiments recorded yet. Click "RUN AI RECOVERY SIMULATION" above to execute your first benchmark.
                    </td>
                  </tr>
                )}

                {!loading && experiments.map((exp) => (
                  <tr key={exp.id} className="hover:bg-muted/20">
                    <td className="p-3.5 font-semibold text-foreground">{exp.name}</td>
                    <td className="p-3.5 font-mono">{exp.sampleSize} txns</td>
                    <td className="p-3.5 font-mono text-muted-foreground">{formatINR(exp.totalVolumeAtRisk)}</td>
                    <td className="p-3.5 font-mono text-muted-foreground">
                      {formatINR(exp.baselineRecovered)} ({formatPercentage(exp.baselineRecoveryRate)})
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-500">
                      {formatINR(exp.aiRecovered)} ({formatPercentage(exp.aiRecoveryRate)})
                    </td>
                    <td className="p-3.5 font-mono font-extrabold text-emerald-600">
                      +{formatINR(exp.incrementalLift)}
                    </td>
                    <td className="p-3.5 font-mono text-muted-foreground text-[11px]">
                      {formatTimeAgo(exp.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <SimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        onCompleted={fetchExperiments}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import {
  LineChart,
  Building2,
  TrendingUp,
  Clock,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Coins,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from "recharts";
import { formatINR } from "@/lib/utils";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AppHeader
        title="Revenue & Recovery Intelligence"
        subtitle="Issuer switch health correlations, strategy ROI matrices, and cohort analytics"
        onRefresh={fetchAnalytics}
      />

      <div className="p-6 space-y-6 flex-1 max-w-7xl">
        {/* Hourly Failure Heatmap Chart */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                24-Hour Failure & Recovery Distribution
              </h3>
              <p className="text-xs text-muted-foreground">
                Temporal correlation of payment drop-offs vs AI recovery settlements
              </p>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.hourlyHeatmap || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "11px" }}
                />
                <Bar dataKey="failures" name="Failures" fill="#f43f5e" radius={[2, 2, 0, 0]} />
                <Bar dataKey="recovered" name="Recovered" fill="#10b981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bank Switch Health Table */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Core Banking Switch Telemetry & Downtime Tracking
            </h3>
            <p className="text-xs text-muted-foreground">
              Automated issuer network health monitoring across Indian banking rails
            </p>
          </div>

          <div className="border border-border rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th className="p-3">Issuing Bank Rail</th>
                  <th className="p-3">Switch Health</th>
                  <th className="p-3">Failure Rate</th>
                  <th className="p-3">Peak Congestion Window</th>
                  <th className="p-3 text-right">AI Recovery Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {(data?.bankTelemetry || []).map((b: any, idx: number) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="p-3 font-semibold text-foreground">{b.bank}</td>
                    <td className="p-3">
                      <span className="text-emerald-500 font-mono font-bold">{b.switchHealth}</span>
                    </td>
                    <td className="p-3 font-mono text-rose-500">{b.avgFailureRate}</td>
                    <td className="p-3 font-mono text-muted-foreground">{b.peakDowntimeHours}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-600">
                      {b.recoveryRate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strategy ROI Table */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Recovery Intervention Efficiency & Unit Economics
            </h3>
            <p className="text-xs text-muted-foreground">
              Volume recovered, cost per recovery, and net margin impact
            </p>
          </div>

          <div className="border border-border rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th className="p-3">Intervention Strategy</th>
                  <th className="p-3">Volume Attempted</th>
                  <th className="p-3">Volume Recovered</th>
                  <th className="p-3">Conversion Rate</th>
                  <th className="p-3">Avg Latency</th>
                  <th className="p-3 text-right">Cost / Recovery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {(data?.strategyRoi || []).map((s: any, idx: number) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="p-3 font-semibold text-foreground">{s.strategy}</td>
                    <td className="p-3 font-mono text-muted-foreground">{s.volumeAttempted}</td>
                    <td className="p-3 font-mono font-bold text-emerald-500">{s.volumeRecovered}</td>
                    <td className="p-3 font-mono font-bold text-primary">{s.recoveryRate}</td>
                    <td className="p-3 font-mono text-muted-foreground">{s.avgLatency}</td>
                    <td className="p-3 text-right font-mono text-foreground font-semibold">
                      {s.costPerRecovery}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

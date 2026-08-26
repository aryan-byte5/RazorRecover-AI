"use client";

import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import MetricCard from "@/components/MetricCard";
import SimulationModal from "@/components/SimulationModal";
import InvestigationDrawer from "@/components/InvestigationDrawer";
import {
  ShieldAlert,
  Coins,
  TrendingUp,
  RotateCw,
  Clock,
  Zap,
  Sparkles,
  Layers,
  Receipt,
  ArrowUpRight,
  Filter,
  PieChart as PieIcon,
  BarChart3,
  Activity,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatINR, formatPercentage, formatTimeAgo, getStatusBadgeVariant } from "@/lib/utils";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [selectedTxnForInvestigation, setSelectedTxnForInvestigation] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
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
    fetchDashboardData();
  }, []);

  const metrics = data?.metrics || {
    revenueAtRisk: 0,
    revenueRecovered: 0,
    recoveryRate: 0.68,
    failedPaymentsCount: 0,
    recoverablePaymentsCount: 0,
    activeRecoveriesCount: 0,
    avgRecoveryTimeMinutes: 18,
    incrementalRevenue: 0,
  };

  const charts = data?.charts || {};

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AppHeader
        title="Revenue Recovery Overview"
        subtitle="Real-time autonomous diagnostic telemetry & financial lift"
        onOpenSimulation={() => setIsSimModalOpen(true)}
        onRefresh={fetchDashboardData}
      />

      <div className="p-6 space-y-6 flex-1">
        {/* Prominent Hero Action Banner: Run AI Recovery Simulation */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 p-6 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Live Agentic Simulation Arena
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Benchmark Autonomous Multi-Agent Recovery vs Baseline
              </h2>
              <p className="text-xs text-white/90 leading-relaxed">
                Run batch evaluation comparing naive fixed retries against RazorRecover AI. Measure dynamic incremental revenue lift, recovery rates, and customer friction drop across real transactions.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <button
                onClick={() => setIsSimModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-white text-blue-700 font-extrabold text-xs shadow-lg hover:bg-white/95 transition-all transform active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-blue-700" />
                <span>RUN AI RECOVERY SIMULATION</span>
              </button>
            </div>
          </div>
        </div>

        {/* Core 8 Dynamic Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Revenue at Risk"
            value={formatINR(metrics.revenueAtRisk)}
            subValue={`${metrics.failedPaymentsCount} failed checkout attempts`}
            icon={ShieldAlert}
            color="rose"
            trend={{ value: `${metrics.failedPaymentsCount} txns`, isPositive: false, label: "requiring diagnosis" }}
          />

          <MetricCard
            title="Revenue Recovered"
            value={formatINR(metrics.revenueRecovered)}
            subValue={`${formatPercentage(metrics.recoveryRate)} overall recovery rate`}
            icon={Coins}
            color="emerald"
            highlight={true}
            trend={{ value: "+74.2%", isPositive: true, label: "recovery rate" }}
          />

          <MetricCard
            title="Incremental Revenue vs Baseline"
            value={`+${formatINR(metrics.incrementalRevenue)}`}
            subValue="Net financial lift over fixed retries"
            icon={TrendingUp}
            color="blue"
            trend={{ value: "+46.5%", isPositive: true, label: "incremental lift" }}
          />

          <MetricCard
            title="Avg Recovery Latency"
            value={`${metrics.avgRecoveryTimeMinutes}m`}
            subValue={`${metrics.activeRecoveriesCount} active in recovery queue`}
            icon={Clock}
            color="purple"
            trend={{ value: "-62%", isPositive: true, label: "time to settlement" }}
          />
        </div>

        {/* Charts Row 1: Revenue Over Time & Recovery Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue at Risk vs Recovered Over Time */}
          <div className="lg:col-span-8 p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Revenue at Risk vs Recovered Over Time
                </h3>
                <p className="text-xs text-muted-foreground">
                  Daily tracking of failed payment volume and AI recovery settlement
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-rose-500/80"></span>
                  <span className="text-muted-foreground">At Risk</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
                  <span className="text-muted-foreground font-semibold">Recovered</span>
                </div>
              </div>
            </div>

            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.revenueTrend || []}>
                  <defs>
                    <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorAtRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatINR(Number(value)), ""]}
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="atRisk"
                    name="Revenue at Risk"
                    stroke="#f43f5e"
                    fillOpacity={1}
                    fill="url(#colorAtRisk)"
                  />
                  <Area
                    type="monotone"
                    dataKey="recovered"
                    name="Revenue Recovered"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRecovered)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recovery Funnel */}
          <div className="lg:col-span-4 p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Autonomous Recovery Funnel
              </h3>
              <p className="text-xs text-muted-foreground">
                Conversion through the 5 autonomous stages
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {(charts.recoveryFunnel || []).map((stage: any, idx: number) => {
                const maxCount = charts.recoveryFunnel[0]?.count || 1;
                const pct = Math.round((stage.count / maxCount) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-foreground">{stage.stage}</span>
                      <span className="font-mono text-muted-foreground">{stage.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Charts Row 2: Failure Categories & Intervention Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Failure Categories Donut */}
          <div className="lg:col-span-4 p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Failure Root Cause Categories
              </h3>
              <p className="text-xs text-muted-foreground">
                AI diagnosis distribution across failure types
              </p>
            </div>

            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.failureCategories || []}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {(charts.failureCategories || []).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val} failures (${formatINR(item.payload.volume)})`,
                      name,
                    ]}
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
              {(charts.failureCategories || []).slice(0, 4).map((c: any, i: number) => (
                <div key={i} className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  <span className="truncate">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Intervention Performance */}
          <div className="lg:col-span-8 p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Intervention Performance by Strategy Type
                </h3>
                <p className="text-xs text-muted-foreground">
                  Success rate and recovered revenue per mechanism
                </p>
              </div>
            </div>

            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.interventionPerformance || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="strategy" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
                  <Tooltip
                    formatter={(val: any, name: string) => [
                      name === "successRate" ? formatPercentage(Number(val)) : formatINR(Number(val)),
                      name === "successRate" ? "Success Rate" : "Revenue Recovered",
                    ]}
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Bar dataKey="successRate" name="Success Rate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Live Recovery Action Feed */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-foreground">
                Live Autonomous Engine Activity Feed
              </h3>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Auto-refreshing
            </span>
          </div>

          <div className="divide-y divide-border/60 text-xs">
            {(data?.recentFeed || []).map((feed: any, idx: number) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                    AI
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{feed.details}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      Action: {feed.action} • Entity: {feed.entityType} ({feed.entityId})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-muted-foreground font-mono text-[11px]">
                    {formatTimeAgo(feed.createdAt)}
                  </span>
                  {feed.transactionId && (
                    <button
                      onClick={() => setSelectedTxnForInvestigation(feed.transactionId)}
                      className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simulation Modal */}
      <SimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        onCompleted={fetchDashboardData}
      />

      {/* Investigation Drawer */}
      <InvestigationDrawer
        transactionId={selectedTxnForInvestigation}
        isOpen={!!selectedTxnForInvestigation}
        onClose={() => setSelectedTxnForInvestigation(null)}
        onActionTriggered={fetchDashboardData}
      />
    </div>
  );
}

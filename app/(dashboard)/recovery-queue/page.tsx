"use client";

import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import InvestigationDrawer from "@/components/InvestigationDrawer";
import TransactionDrawer from "@/components/TransactionDrawer";
import {
  Layers,
  Search,
  Filter,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  RefreshCw,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import { formatINR, formatPercentage, formatTimeAgo, getStatusBadgeVariant } from "@/lib/utils";

export default function RecoveryQueuePage() {
  const [cases, setCases] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [strategyFilter, setStrategyFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>({ queued: 0, inProgress: 0, recovered: 0, failed: 0 });

  const [selectedTxnForInvestigation, setSelectedTxnForInvestigation] = useState<string | null>(null);
  const [selectedTxnForDetails, setSelectedTxnForDetails] = useState<string | null>(null);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        status: statusFilter,
        strategy: strategyFilter,
        search,
      });

      const res = await fetch(`/api/recovery-queue?${params}`);
      const data = await res.json();
      if (data.cases) {
        setCases(data.cases);
        setTotal(data.total);
        if (data.summary) setSummary(data.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [page, statusFilter, strategyFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCases();
  };

  const handleQuickExecute = async (caseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/recovery/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recoveryCaseId: caseId }),
      });
      if (res.ok) {
        fetchCases();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AppHeader
        title="Recovery Pipeline Queue"
        subtitle="Active revenue recovery workflows and AI intervention management"
        onRefresh={fetchCases}
      />

      <div className="p-6 space-y-6 flex-1">
        {/* Status Filter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => { setStatusFilter("QUEUED"); setPage(1); }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === "QUEUED"
                ? "border-amber-500 bg-amber-500/10 shadow-xs"
                : "border-border bg-card hover:bg-muted/40"
            }`}
          >
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Queued</div>
            <div className="text-2xl font-bold font-mono text-foreground mt-1">{summary.queued}</div>
            <div className="text-[11px] text-muted-foreground">Awaiting auto-dispatch</div>
          </button>

          <button
            onClick={() => { setStatusFilter("DIAGNOSED"); setPage(1); }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === "DIAGNOSED"
                ? "border-blue-500 bg-blue-500/10 shadow-xs"
                : "border-border bg-card hover:bg-muted/40"
            }`}
          >
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Diagnosed & In Progress</div>
            <div className="text-2xl font-bold font-mono text-foreground mt-1">{summary.inProgress}</div>
            <div className="text-[11px] text-muted-foreground">Strategy selected</div>
          </button>

          <button
            onClick={() => { setStatusFilter("RECOVERED"); setPage(1); }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === "RECOVERED"
                ? "border-emerald-500 bg-emerald-500/10 shadow-xs"
                : "border-border bg-card hover:bg-muted/40"
            }`}
          >
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Settled Recovered</div>
            <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">{summary.recovered}</div>
            <div className="text-[11px] text-muted-foreground">Successfully converted</div>
          </button>

          <button
            onClick={() => { setStatusFilter("ALL"); setPage(1); }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === "ALL"
                ? "border-primary bg-primary/10 shadow-xs"
                : "border-border bg-card hover:bg-muted/40"
            }`}
          >
            <div className="text-xs font-semibold text-primary uppercase">All Pipeline Cases</div>
            <div className="text-2xl font-bold font-mono text-foreground mt-1">{total}</div>
            <div className="text-[11px] text-muted-foreground">Total records</div>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, error, txn ID..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </form>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={strategyFilter}
              onChange={(e) => { setStrategyFilter(e.target.value); setPage(1); }}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Strategies</option>
              <option value="SMART_RETRY">Smart NPCI Retry</option>
              <option value="PAYMENT_LINK">Payment Link</option>
              <option value="METHOD_SWITCH">Method Switch</option>
              <option value="DELAYED_RETRY">Delayed Retry</option>
              <option value="ESCALATE">VIP Escalation</option>
            </select>

            <button
              onClick={fetchCases}
              className="p-2 rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground cursor-pointer"
              title="Refresh queue"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Customer & Account</th>
                  <th className="p-3.5">Amount (₹)</th>
                  <th className="p-3.5">AI Root Cause Diagnosis</th>
                  <th className="p-3.5">Strategy Assigned</th>
                  <th className="p-3.5">Win Prob</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Loading recovery cases...
                    </td>
                  </tr>
                )}

                {!loading && cases.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No recovery cases found matching current filters.
                    </td>
                  </tr>
                )}

                {!loading && cases.map((c) => {
                  const badge = getStatusBadgeVariant(c.status);
                  const isRecovered = c.status === "RECOVERED";

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedTxnForInvestigation(c.transactionId)}
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <td className="p-3.5">
                        <div className="font-semibold text-foreground">{c.customer.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono truncate max-w-[140px]">
                          {c.customer.email}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono font-bold text-foreground">
                        {formatINR(c.transaction.amount)}
                      </td>

                      <td className="p-3.5 max-w-[220px]">
                        <div className="font-medium text-foreground truncate">
                          {c.failureRootCause || "Payment gateway processing error"}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          Method: {c.transaction.paymentMethod} • Code: {c.transaction.errorCode || "TIMEOUT"}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-primary font-mono text-[11px]">
                          {c.assignedStrategy || "SMART_RETRY"}
                        </span>
                        <div className="text-[10px] text-muted-foreground">
                          Expected: {formatINR(c.expectedRecovery)}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${Math.round((c.recoveryProbability || 0.7) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-[11px]">
                            {Math.round((c.recoveryProbability || 0.7) * 100)}%
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        {!isRecovered ? (
                          <button
                            onClick={(e) => handleQuickExecute(c.id, e)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Execute
                          </button>
                        ) : (
                          <span className="text-emerald-500 text-[11px] font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div>
              Showing page {page} of {Math.ceil(total / 20) || 1} ({total} cases)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded border border-border bg-background disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= Math.ceil(total / 20)}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded border border-border bg-background disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Investigation Drawer */}
      <InvestigationDrawer
        transactionId={selectedTxnForInvestigation}
        isOpen={!!selectedTxnForInvestigation}
        onClose={() => setSelectedTxnForInvestigation(null)}
        onActionTriggered={fetchCases}
      />
    </div>
  );
}

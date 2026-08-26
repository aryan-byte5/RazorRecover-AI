"use client";

import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import {
  ScrollText,
  Search,
  Filter,
  RefreshCw,
  ShieldCheck,
  Cpu,
  User,
  Webhook,
  Sliders,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [actorFilter, setActorFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "30",
        action: actionFilter,
        actor: actorFilter,
        search,
      });

      const res = await fetch(`/api/audit-logs?${params}`);
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, actorFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AppHeader
        title="Immutable Audit Trail"
        subtitle="Complete compliance timeline of payment failures, AI diagnoses, guardrail checks & outcomes"
        onRefresh={fetchLogs}
      />

      <div className="p-6 space-y-6 flex-1 max-w-7xl">
        {/* Filter Bar */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit details, entity ID..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </form>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="PAYMENT_FAILED">Payment Failed</option>
              <option value="AI_DIAGNOSED">AI Diagnosed</option>
              <option value="OUTCOME_RECORDED">Outcome Recorded</option>
              <option value="SIMULATION_EXECUTED">Simulation Executed</option>
            </select>

            <select
              value={actorFilter}
              onChange={(e) => { setActorFilter(e.target.value); setPage(1); }}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Actors</option>
              <option value="SYSTEM_AI">System AI</option>
              <option value="WEBHOOK">Webhook</option>
              <option value="USER">User / Admin</option>
            </select>

            <button
              onClick={fetchLogs}
              className="p-2 rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Audit Trail List */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Actor</th>
                  <th className="p-3.5">Action Event</th>
                  <th className="p-3.5">Entity</th>
                  <th className="p-3.5">Details</th>
                  <th className="p-3.5 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Loading audit logs...
                    </td>
                  </tr>
                )}

                {!loading && logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;

                  return (
                    <>
                      <tr
                        key={log.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="p-3.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                          {formatTimeAgo(log.createdAt)}
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              log.actor === "SYSTEM_AI"
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                : log.actor === "WEBHOOK"
                                ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            }`}
                          >
                            {log.actor}
                          </span>
                        </td>

                        <td className="p-3.5 font-mono font-bold text-foreground">
                          {log.action}
                        </td>

                        <td className="p-3.5 font-mono text-[11px] text-muted-foreground">
                          {log.entityType} ({log.entityId?.slice(-8)})
                        </td>

                        <td className="p-3.5 max-w-[320px] truncate text-foreground font-medium">
                          {log.details}
                        </td>

                        <td className="p-3.5 text-right">
                          {log.payloadJson && (
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-[11px] font-semibold text-foreground inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>JSON</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </td>
                      </tr>

                      {isExpanded && log.payloadJson && (
                        <tr className="bg-zinc-950/80">
                          <td colSpan={6} className="p-4">
                            <pre className="p-3 rounded-lg bg-black text-emerald-400 font-mono text-[11px] overflow-x-auto">
                              <code>{JSON.stringify(JSON.parse(log.payloadJson), null, 2)}</code>
                            </pre>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

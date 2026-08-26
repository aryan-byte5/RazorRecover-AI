"use client";

import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import TransactionDrawer from "@/components/TransactionDrawer";
import InvestigationDrawer from "@/components/InvestigationDrawer";
import {
  Receipt,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  ArrowUpDown,
  CreditCard,
  Building,
  Plus,
  X,
  RotateCw,
  CheckCircle2,
} from "lucide-react";
import { formatINR, formatTimeAgo, getStatusBadgeVariant } from "@/lib/utils";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);
  const [investigateTxnId, setInvestigateTxnId] = useState<string | null>(null);

  // New Transaction Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [amount, setAmount] = useState(4999);
  const [method, setMethod] = useState<"UPI" | "CARD" | "NETBANKING">("UPI");
  const [status, setStatus] = useState<"FAILED" | "SUCCESS">("FAILED");
  const [errorCode, setErrorCode] = useState("GATEWAY_TIMEOUT");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState("");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
        status: statusFilter,
        method: methodFilter,
        search,
      });

      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();
      if (data.transactions) {
        setTransactions(data.transactions);
        setTotal(data.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await fetch("/api/customers?limit=50");
      const data = await res.json();
      if (data.customers && data.customers.length > 0) {
        setCustomers(data.customers);
        setSelectedCustomerId(data.customers[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTransactions();
    loadCustomers();
  }, [page, statusFilter, methodFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;
    setCreating(true);
    setCreateMsg("");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          amount,
          paymentMethod: method,
          status,
          errorCode: status === "FAILED" ? errorCode : undefined,
          errorDescription:
            status === "FAILED"
              ? errorCode === "GATEWAY_TIMEOUT"
                ? "HDFC Core Banking switch latency timeout"
                : "Insufficient account balance"
              : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreateMsg("Transaction recorded in database! Autonomous recovery case queued.");
        fetchTransactions();
        setTimeout(() => {
          setIsCreateModalOpen(false);
          setCreateMsg("");
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AppHeader
        title="Transaction Ledger & Settlement Audit"
        subtitle="Complete log of synthetic payment attempts, failure diagnoses, and recovery outcomes"
        onRefresh={fetchTransactions}
      />

      <div className="p-6 space-y-6 flex-1 max-w-7xl">
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by transaction ID, customer, order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="FAILED">FAILED (At Risk)</option>
              <option value="RECOVERED">RECOVERED (AI Win)</option>
              <option value="SUCCESS">SUCCESS</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Rails</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Cards</option>
              <option value="NETBANKING">NetBanking</option>
            </select>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
          </div>
        </div>

        {/* Transaction Ledger Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method / Rail</th>
                  <th className="py-3 px-4">Gateway Status</th>
                  <th className="py-3 px-4">AI Recovery Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                      Loading transaction records from database...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      No transaction records found matching filter.
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn) => {
                    const badgeVariant = getStatusBadgeVariant(txn.status);
                    return (
                      <tr key={txn.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          {txn.externalId || txn.id.slice(0, 14)}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground">{txn.customer?.name || "Guest Checkout"}</div>
                          <div className="text-[11px] text-muted-foreground">{txn.customer?.email}</div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          {formatINR(txn.amount)}
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px]">
                          <div>{txn.paymentMethod}</div>
                          <div className="text-muted-foreground text-[10px]">{txn.vpa || txn.cardNetwork || txn.bankCode}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              txn.status === "RECOVERED"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : txn.status === "FAILED"
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            }`}
                          >
                            {txn.status}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {txn.recoveryStatus === "RECOVERED" ? (
                            <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                              <span>✓ Recovered</span>
                            </span>
                          ) : txn.recoveryStatus === "QUEUED" || txn.recoveryStatus === "IN_PROGRESS" ? (
                            <span className="text-[11px] font-semibold text-blue-500 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                              <span>Autonomous Queue</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">None</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                          {formatTimeAgo(txn.createdAt)}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedTxnId(txn.id)}
                              className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                            >
                              Inspect
                            </button>
                            {txn.status === "FAILED" && (
                              <button
                                onClick={() => setInvestigateTxnId(txn.id)}
                                className="text-xs text-purple-500 hover:text-purple-400 font-semibold cursor-pointer flex items-center gap-0.5"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>AI Lab</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Record Transaction Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                Record Payment Event to Database
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{createMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateTransaction} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Select Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs cursor-pointer"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email}) - LTV ₹{c.lifetimeValue}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Payment Amount (INR ₹)</label>
                <input
                  type="number"
                  min={100}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Payment Rail</label>
                  <select
                    value={method}
                    onChange={(e: any) => setMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs cursor-pointer"
                  >
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                    <option value="NETBANKING">NetBanking</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs cursor-pointer font-semibold"
                  >
                    <option value="FAILED">FAILED (At Risk)</option>
                    <option value="SUCCESS">SUCCESS (Settled)</option>
                  </select>
                </div>
              </div>

              {status === "FAILED" && (
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Gateway Error Simulation</label>
                  <select
                    value={errorCode}
                    onChange={(e) => setErrorCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-xs cursor-pointer"
                  >
                    <option value="GATEWAY_TIMEOUT">GATEWAY_TIMEOUT (HDFC UPI Switch Latency)</option>
                    <option value="INSUFFICIENT_FUNDS">INSUFFICIENT_FUNDS (Account balance low)</option>
                    <option value="AUTHENTICATION_FAILED">AUTHENTICATION_FAILED (OTP failure)</option>
                  </select>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 flex items-center gap-1.5 shadow-sm"
                >
                  {creating && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{creating ? "Storing Record..." : "Record Payment"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction & AI Drawers */}
      <TransactionDrawer
        transactionId={selectedTxnId}
        isOpen={!!selectedTxnId}
        onClose={() => setSelectedTxnId(null)}
      />

      <InvestigationDrawer
        transactionId={investigateTxnId}
        isOpen={!!investigateTxnId}
        onClose={() => setInvestigateTxnId(null)}
        onActionTriggered={fetchTransactions}
      />
    </div>
  );
}

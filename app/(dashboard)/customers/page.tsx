"use client";

import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Zap,
  Plus,
  X,
  RotateCw,
  CheckCircle2,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // New Customer Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRisk, setNewRisk] = useState<"LOW" | "MEDIUM" | "HIGH" | "VIP">("LOW");
  const [newMethod, setNewMethod] = useState<"UPI" | "CARD" | "NETBANKING">("UPI");
  const [newLtv, setNewLtv] = useState(25000);
  const [createSuccessMsg, setCreateSuccessMsg] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        risk: riskFilter,
        search,
      });

      const res = await fetch(`/api/customers?${params}`);
      const data = await res.json();
      if (data.customers) {
        setCustomers(data.customers);
        setTotal(data.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, riskFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateSuccessMsg("");

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          phone: newPhone,
          riskProfile: newRisk,
          preferredMethod: newMethod,
          lifetimeValue: newLtv,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreateSuccessMsg("Customer created and stored in PostgreSQL database!");
        setNewName("");
        setNewEmail("");
        setNewPhone("");
        fetchCustomers();
        setTimeout(() => {
          setIsCreateModalOpen(false);
          setCreateSuccessMsg("");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AppHeader
        title="Customer Intelligence & LTV"
        subtitle="Customer propensity profiles, historical recovery conversion & risk tiers"
        onRefresh={fetchCustomers}
      />

      <div className="p-6 space-y-6 flex-1 max-w-7xl">
        {/* Controls & Actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by customer name, email, VPA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </form>

          <div className="flex items-center gap-2">
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="VIP">VIP (LTV ₹1L+)</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
            </select>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Customer Directory Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Risk Profile</th>
                  <th className="py-3 px-4">Lifetime Value</th>
                  <th className="py-3 px-4">Payments (Success / Fail)</th>
                  <th className="py-3 px-4">Preferred Method</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                      Loading customer directory from database...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      No customers found matching filter.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => {
                    const totalPayments = (c.successCount || 0) + (c.failureCount || 0);
                    const successRate = totalPayments > 0 ? (c.successCount / totalPayments) * 100 : 90;

                    return (
                      <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground">{c.name}</div>
                          <div className="text-[11px] text-muted-foreground">{c.email}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.riskProfile === "VIP"
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                : c.riskProfile === "LOW"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : c.riskProfile === "MEDIUM"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {c.riskProfile}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono font-semibold text-foreground">
                          {formatINR(c.lifetimeValue || 0)}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-emerald-500 font-semibold">{c.successCount}</span>
                            <span className="text-muted-foreground">/</span>
                            <span className="font-mono text-rose-500 font-semibold">{c.failureCount}</span>
                            <span className="text-[11px] text-muted-foreground">({successRate.toFixed(0)}%)</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px]">
                          <div>{c.preferredMethod || "UPI"}</div>
                          <div className="text-muted-foreground text-[10px]">{c.preferredVpa || "@okaxis"}</div>
                        </td>

                        <td className="py-3 px-4">
                          <Link
                            href={`/customers/${c.id}`}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                          >
                            <span>Profile 360</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
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

      {/* Create Customer Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Create New Customer Record
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createSuccessMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{createSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Customer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sen"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="ananya.sen@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Risk Profile</label>
                  <select
                    value={newRisk}
                    onChange={(e: any) => setNewRisk(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs cursor-pointer"
                  >
                    <option value="LOW">LOW Risk</option>
                    <option value="VIP">VIP (LTV ₹1L+)</option>
                    <option value="MEDIUM">MEDIUM Risk</option>
                    <option value="HIGH">HIGH Risk</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Preferred Rail</label>
                  <select
                    value={newMethod}
                    onChange={(e: any) => setNewMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs cursor-pointer"
                  >
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                    <option value="NETBANKING">NetBanking</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Initial Lifetime Value (INR ₹)</label>
                <input
                  type="number"
                  min={0}
                  value={newLtv}
                  onChange={(e) => setNewLtv(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-xs"
                />
              </div>

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
                  <span>{creating ? "Saving to Database..." : "Save Customer"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Users,
  Receipt,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Coins,
  ShieldCheck,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import { formatINR, formatTimeAgo, getStatusBadgeVariant } from "@/lib/utils";

export default function CustomerDetailPage() {
  const params = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    fetch(`/api/customers/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCustomer(data.customer);
          setMetrics(data.metrics);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AppHeader
        title="Customer 360 Intelligence"
        subtitle="Historical payment propensity, recovery conversions, and risk modeling"
      />

      <div className="p-6 space-y-6 flex-1">
        <div>
          <Link
            href="/customers"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Customers Directory</span>
          </Link>
        </div>

        {loading && (
          <div className="py-20 text-center text-xs text-muted-foreground">
            Loading Customer 360 profile...
          </div>
        )}

        {!loading && customer && (
          <div className="space-y-6">
            {/* Top Customer Info Banner */}
            <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col md:flex-row justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-xl flex items-center justify-center shrink-0">
                  {customer.name.charAt(0)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">{customer.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                      {customer.riskProfile} Tier
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {customer.email} • {customer.phone || "No phone linked"}
                  </div>
                  <div className="text-xs text-muted-foreground pt-1">
                    Preferred VPA: <strong className="text-foreground">{customer.preferredVpa || "aarav@okhdfcbank"}</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-left border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                <div>
                  <div className="text-xs text-muted-foreground">Lifetime Value</div>
                  <div className="text-lg font-bold font-mono text-foreground mt-0.5">
                    {formatINR(customer.lifetimeValue)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Recovered Volume</div>
                  <div className="text-lg font-bold font-mono text-emerald-500 mt-0.5">
                    {formatINR(metrics?.totalRecoveredVolume || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Recovery Rate</div>
                  <div className="text-lg font-bold font-mono text-primary mt-0.5">
                    {((metrics?.recoverySuccessRate || 0.8) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Transactions Ledger */}
            <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-foreground">
                Transaction History ({customer.transactions?.length || 0})
              </h3>

              <div className="border border-border rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px]">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Gateway Error</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {(customer.transactions || []).map((t: any) => {
                      const badge = getStatusBadgeVariant(t.status);
                      return (
                        <tr key={t.id} className="hover:bg-muted/20">
                          <td className="p-3 font-mono font-semibold text-primary">{t.id}</td>
                          <td className="p-3 font-mono font-bold">{formatINR(t.amount)}</td>
                          <td className="p-3">{t.paymentMethod}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-muted-foreground">
                            {t.errorCode || "—"}
                          </td>
                          <td className="p-3 text-muted-foreground font-mono text-[11px]">
                            {formatTimeAgo(t.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

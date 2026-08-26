"use client";

import { useEffect, useState } from "react";
import {
  X,
  Receipt,
  CreditCard,
  Building2,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { formatINR, formatTimeAgo, getStatusBadgeVariant } from "@/lib/utils";

interface TransactionDrawerProps {
  transactionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onInvestigate?: (txnId: string) => void;
}

export default function TransactionDrawer({
  transactionId,
  isOpen,
  onClose,
  onInvestigate,
}: TransactionDrawerProps) {
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!transactionId || !isOpen) return;

    setLoading(true);
    fetch(`/api/transactions/${transactionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTransaction(data.transaction);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [transactionId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-card border-l border-border h-full shadow-2xl flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Transaction Ledger Inspector
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                {transactionId}
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

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="py-20 text-center text-xs text-muted-foreground">
              Loading transaction telemetry...
            </div>
          )}

          {!loading && transaction && (
            <div className="space-y-6">
              {/* Top Overview Card */}
              <div className="p-5 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Amount</span>
                  {(() => {
                    const badge = getStatusBadgeVariant(transaction.status);
                    return (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>
                <div className="text-3xl font-extrabold font-mono text-foreground">
                  {formatINR(transaction.amount)}
                </div>
                <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <div>Method: <strong className="text-foreground">{transaction.paymentMethod}</strong> {transaction.vpa ? `(${transaction.vpa})` : ""}</div>
                  <div>Timestamp: <strong className="text-foreground">{new Date(transaction.createdAt).toLocaleString("en-IN")}</strong></div>
                </div>
              </div>

              {/* Customer Profile Snippet */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Customer Information
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Name: <strong className="text-foreground">{transaction.customer.name}</strong> ({transaction.customer.riskProfile} Risk Profile)</div>
                  <div>Email: <strong className="text-foreground">{transaction.customer.email}</strong></div>
                  <div>Phone: <strong className="text-foreground font-mono">{transaction.customer.phone || "—"}</strong></div>
                  <div>Lifetime Value: <strong className="text-emerald-600 font-mono">₹{transaction.customer.lifetimeValue.toLocaleString("en-IN")}</strong></div>
                </div>
              </div>

              {/* Gateway & Failure Payload */}
              {transaction.errorCode && (
                <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-2">
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Payment Gateway Error Telemetry
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Error Code: <strong className="text-rose-600 dark:text-rose-400 font-mono">{transaction.errorCode}</strong></div>
                    <div>Description: <strong className="text-foreground">{transaction.errorDescription}</strong></div>
                    <div>Failure Category: <strong className="text-foreground font-mono">{transaction.failureCategory}</strong></div>
                    <div>Retry Attempts: <strong className="text-foreground">{transaction.retryCount}</strong></div>
                  </div>
                </div>
              )}

              {/* AI Recovery Case Link */}
              {transaction.recoveryCases && transaction.recoveryCases.length > 0 && (
                <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Autonomous Recovery Case
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-600">
                      {transaction.recoveryCases[0].status}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Assigned Strategy: <strong className="text-foreground">{transaction.recoveryCases[0].assignedStrategy || "SMART_RETRY"}</strong></div>
                    <div>Recovery Probability: <strong className="text-emerald-600 font-mono">{(transaction.recoveryCases[0].recoveryProbability * 100).toFixed(0)}%</strong></div>
                    <div>Expected Value: <strong className="text-foreground font-mono">{formatINR(transaction.recoveryCases[0].expectedRecovery)}</strong></div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      if (onInvestigate) onInvestigate(transaction.id);
                    }}
                    className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    Open in AI Diagnostic Lab
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border flex items-center justify-end bg-card">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

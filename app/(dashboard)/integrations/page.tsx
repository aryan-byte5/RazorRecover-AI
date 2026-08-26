"use client";

import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import {
  Workflow,
  Webhook,
  Key,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCw,
  Sparkles,
  Zap,
  Terminal,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function IntegrationsPage() {
  const [amount, setAmount] = useState(4999);
  const [method, setMethod] = useState("upi");
  const [errorCode, setErrorCode] = useState("GATEWAY_TIMEOUT");
  const [errorDesc, setErrorDesc] = useState("HDFC Bank UPI Switch not responding");
  const [email, setEmail] = useState("aarav.sharma@example.com");
  const [name, setName] = useState("Aarav Sharma");

  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    setSimResult(null);

    try {
      const res = await fetch("/api/webhooks/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "payment.failed",
          amount,
          method,
          errorCode,
          errorDescription: errorDesc,
          email,
          name,
        }),
      });

      const data = await res.json();
      setSimResult(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AppHeader
        title="Integrations & Webhooks"
        subtitle="Live payment gateway connections, webhook simulators & API authentication"
      />

      <div className="p-6 space-y-6 flex-1 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Webhook Simulator */}
          <div className="lg:col-span-6 p-6 rounded-2xl border border-border bg-card shadow-sm space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                <Webhook className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Razorpay Webhook Event Dispatcher
                </h3>
                <p className="text-xs text-muted-foreground">
                  Simulate incoming <code className="text-primary font-mono">payment.failed</code> events and test real-time AI ingestion
                </p>
              </div>
            </div>

            <form onSubmit={handleSimulateWebhook} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Failed Payment Amount (INR ₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Payment Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="netbanking">NetBanking</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Gateway Error Code</label>
                  <select
                    value={errorCode}
                    onChange={(e) => {
                      setErrorCode(e.target.value);
                      if (e.target.value === "GATEWAY_TIMEOUT") setErrorDesc("HDFC Bank UPI Switch not responding");
                      if (e.target.value === "INSUFFICIENT_FUNDS") setErrorDesc("Account balance low");
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none cursor-pointer font-mono"
                  >
                    <option value="GATEWAY_TIMEOUT">GATEWAY_TIMEOUT</option>
                    <option value="INSUFFICIENT_FUNDS">INSUFFICIENT_FUNDS</option>
                    <option value="AUTHENTICATION_FAILED">AUTHENTICATION_FAILED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Customer Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={simulating}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                {simulating ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{simulating ? "Dispatching Webhook..." : "Dispatch Simulated Webhook"}</span>
              </button>
            </form>

            {simResult && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Webhook Ingested & AI Investigation Triggered
                </div>
                <div className="text-muted-foreground">
                  Transaction created: <strong className="text-foreground font-mono">{simResult.webhookResponse?.transactionId}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: API Keys & Endpoints */}
          <div className="lg:col-span-6 space-y-6">
            {/* Live Webhook Endpoint */}
            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  Your Webhook Receiver Endpoint
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add this URL to your Razorpay Dashboard webhooks to enable autonomous recovery.
              </p>
              <div className="p-3 rounded-lg bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto">
                POST /api/webhooks/razorpay
              </div>
            </div>

            {/* API Key */}
            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  Live API Credentials
                </h3>
              </div>
              <div className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between font-mono text-xs">
                <span>rzp_live_rec_9823487f98234sd87f</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("rzp_live_rec_9823487f98234sd87f");
                    setCopiedKey(true);
                    setTimeout(() => setCopiedKey(false), 2000);
                  }}
                  className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

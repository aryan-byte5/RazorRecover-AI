"use client";

import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import DecisionTree3D from "@/components/DecisionTree3D";
import {
  SearchCode,
  Sparkles,
  Cpu,
  UserCheck,
  Layers,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Sliders,
  Check,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function InvestigationsPage() {
  const [amount, setAmount] = useState(4999);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [errorCode, setErrorCode] = useState("GATEWAY_TIMEOUT");
  const [errorDesc, setErrorDesc] = useState("HDFC Core Banking UPI Switch latency > 8000ms");
  const [customerName, setCustomerName] = useState("Priya Patel");
  const [customerEmail, setCustomerEmail] = useState("priya.p@example.com");
  const [customerLtv, setCustomerLtv] = useState(45000);
  const [customerRisk, setCustomerRisk] = useState("LOW");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRunDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/investigations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customPayload: {
            amount,
            paymentMethod,
            errorCode,
            errorDescription: errorDesc,
            customerName,
            customerEmail,
            customerLtv,
            customerRisk,
          },
          autoExecute: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AppHeader
        title="AI Diagnostic & Investigation Workbench"
        subtitle="Test autonomous 6-agent reasoning pipeline on custom payment payloads"
      />

      <div className="p-6 space-y-6 flex-1 max-w-7xl">
        {/* Interactive 3D Decision Tree Visualizer */}
        <DecisionTree3D />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Form Panel */}
          <div className="lg:col-span-5 p-6 rounded-2xl border border-border bg-card shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <SearchCode className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-foreground">
                Payment Failure Payload Simulator
              </h2>
            </div>

            <form onSubmit={handleRunDiagnosis} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Payment Amount (INR ₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Payment Rail</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="UPI">UPI (NPCI)</option>
                    <option value="CARD">Credit/Debit Card</option>
                    <option value="NETBANKING">NetBanking</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Gateway Error Code</label>
                  <select
                    value={errorCode}
                    onChange={(e) => {
                      setErrorCode(e.target.value);
                      if (e.target.value === "GATEWAY_TIMEOUT") setErrorDesc("HDFC Core Banking UPI Switch latency > 8000ms");
                      if (e.target.value === "INSUFFICIENT_FUNDS") setErrorDesc("Account balance low; declined by issuing bank");
                      if (e.target.value === "AUTHENTICATION_FAILED") setErrorDesc("UPI MPIN entered was incorrect");
                      if (e.target.value === "EXPIRED_CARD") setErrorDesc("Card validity year passed (04/26)");
                      if (e.target.value === "BANK_DEEMED_HIGH_RISK") setErrorDesc("Velocity check triggered by issuer anti-fraud rule");
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none cursor-pointer font-mono"
                  >
                    <option value="GATEWAY_TIMEOUT">GATEWAY_TIMEOUT</option>
                    <option value="INSUFFICIENT_FUNDS">INSUFFICIENT_FUNDS</option>
                    <option value="AUTHENTICATION_FAILED">AUTHENTICATION_FAILED</option>
                    <option value="EXPIRED_CARD">EXPIRED_CARD</option>
                    <option value="BANK_DEEMED_HIGH_RISK">BANK_DEEMED_HIGH_RISK</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Gateway Error Description</label>
                <input
                  type="text"
                  value={errorDesc}
                  onChange={(e) => setErrorDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:ring-1 focus:ring-primary focus:outline-none font-mono"
                />
              </div>

              <div className="pt-2 border-t border-border space-y-3">
                <div className="font-semibold text-foreground">Customer Context</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-muted-foreground text-[11px]">Customer Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground text-[11px]">Lifetime Value (₹)</label>
                    <input
                      type="number"
                      value={customerLtv}
                      onChange={(e) => setCustomerLtv(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {loading ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{loading ? "Orchestrating 6 Agents..." : "Run AI Investigation"}</span>
              </button>
            </form>
          </div>

          {/* Reasoning & Output Telemetry Display */}
          <div className="lg:col-span-7 space-y-6">
            {!result && !loading && (
              <div className="p-12 border border-border rounded-2xl bg-card/60 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  Ready to Run AI Agent Investigation
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Adjust payment and customer parameters on the left and click "Run AI Investigation" to step through the 6-agent diagnostic workflow.
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                {/* Top Decision Banner */}
                <div className="p-5 rounded-2xl border border-blue-500/30 bg-blue-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      ★ Chosen Strategy: {result.strategy.chosenStrategy}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-500">
                      Win Prob: {(result.strategy.recoveryProbability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-foreground font-medium leading-relaxed">
                    {result.strategy.primaryRationale}
                  </p>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    Model: {result.aiModelUsed} • Latency: {result.totalProcessingMs}ms
                  </div>
                </div>

                {/* 1. Diagnosis */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-2 text-xs">
                  <div className="font-bold text-foreground flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</div>
                    Payment Diagnosis Agent Output
                  </div>
                  <div className="pl-7 space-y-1 text-muted-foreground">
                    <div>Category: <strong className="text-foreground font-mono">{result.diagnosis.failureCategory}</strong></div>
                    <div>Root Cause: <strong className="text-foreground">{result.diagnosis.rootCause}</strong></div>
                    <div>Transient Failure: <strong className="text-foreground">{result.diagnosis.isTransient ? "Yes" : "No"}</strong></div>
                  </div>
                </div>

                {/* 2. Customer Context */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-2 text-xs">
                  <div className="font-bold text-foreground flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</div>
                    Customer Context Agent Output
                  </div>
                  <div className="pl-7 space-y-1 text-muted-foreground">
                    <div>Profile: <strong className="text-foreground">{result.customerContext.riskProfile} Tier</strong> (LTV: ₹{result.customerContext.lifetimeValue.toLocaleString("en-IN")})</div>
                    <div>Historical Success Rate: <strong className="text-foreground">{(result.customerContext.historicalSuccessRate * 100).toFixed(0)}%</strong></div>
                    <div>Recommended Outreach Channel: <strong className="text-foreground">{result.strategy.recommendedChannel}</strong></div>
                  </div>
                </div>

                {/* 3. Guardrails */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-2 text-xs">
                  <div className="font-bold text-foreground flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">3</div>
                      Guardrail Policy Shield
                    </div>
                    <span className="text-emerald-500 font-bold">{result.guardrail.status}</span>
                  </div>
                  <div className="pl-7 space-y-1 text-muted-foreground">
                    {result.guardrail.ruleEvaluations.map((r: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        {r.passed ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                        <span><strong>{r.ruleName}:</strong> {r.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Execution & Outcome */}
                {result.execution && (
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2 text-xs">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Executed Outcome
                      </div>
                      <span className="font-mono">{result.outcome?.isSuccessful ? "SUCCESS" : "FAILED"}</span>
                    </div>
                    <div className="pl-6 space-y-1 text-muted-foreground">
                      <div>Summary: <strong className="text-foreground">{result.outcome?.outcomeSummary}</strong></div>
                      <div>Net Incremental Revenue: <strong className="text-emerald-600 font-bold font-mono">+{formatINR(result.outcome?.incrementalValue || 0)}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

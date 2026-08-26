"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Send,
  RefreshCw,
  Cpu,
  Layers,
  FileText,
  UserCheck,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";
import { formatINR, formatPercentage } from "@/lib/utils";

interface InvestigationDrawerProps {
  transactionId?: string | null;
  recoveryCaseId?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onActionTriggered?: () => void;
}

export default function InvestigationDrawer({
  transactionId,
  recoveryCaseId,
  isOpen,
  onClose,
  onActionTriggered,
}: InvestigationDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [investigationData, setInvestigationData] = useState<any>(null);
  const [executing, setExecuting] = useState(false);
  const [executionSuccess, setExecutionSuccess] = useState(false);

  // Load investigation data when opened
  const loadInvestigation = async () => {
    if (!transactionId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/investigations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, autoExecute: false }),
      });
      const data = await res.json();
      if (data.success) {
        setInvestigationData(data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualExecute = async () => {
    if (!recoveryCaseId && !transactionId) return;
    setExecuting(true);
    try {
      const res = await fetch("/api/investigations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, autoExecute: true }),
      });
      const data = await res.json();
      if (data.success) {
        setInvestigationData(data.result);
        setExecutionSuccess(true);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
        if (onActionTriggered) onActionTriggered();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExecuting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-card border-l border-border h-full shadow-2xl flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                AI Autonomous Investigation
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                Txn: {transactionId || "Select Transaction"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!investigationData && !loading && (
              <button
                onClick={loadInvestigation}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5" />
                Run AI Agent Lab
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <div className="text-sm font-semibold text-foreground">
                Orchestrating 6-Agent AI Investigation Pipeline...
              </div>
              <p className="text-xs text-muted-foreground">
                Diagnosing payment failure cause, synthesizing customer context, scoring interventions & checking guardrails...
              </p>
            </div>
          )}

          {!loading && !investigationData && (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium text-foreground">
                Ready to investigate failed transaction
              </div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Click "Run AI Agent Lab" to trigger the multi-agent diagnostic pipeline and inspect all reasoning evidence.
              </p>
              <button
                onClick={loadInvestigation}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer"
              >
                Start Autonomous Diagnosis
              </button>
            </div>
          )}

          {investigationData && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              {/* Executive Summary Card */}
              <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Autonomous Diagnostic Summary
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-semibold">
                    Confidence: {(investigationData.diagnosis.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="text-sm font-semibold text-foreground">
                  {investigationData.diagnosis.rootCause}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {investigationData.strategy.primaryRationale}
                </p>

                <div className="pt-3 border-t border-blue-500/20 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground text-[11px]">Recovery Probability</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      {(investigationData.strategy.recoveryProbability * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[11px]">Expected Value</div>
                    <div className="font-bold text-foreground font-mono text-sm">
                      {formatINR(investigationData.strategy.expectedRecoveryINR)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[11px]">Recommended Strategy</div>
                    <div className="font-bold text-primary font-mono text-sm">
                      {investigationData.strategy.chosenStrategy}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 1: Diagnosis Agent */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</div>
                  Payment Diagnosis Agent
                </div>
                <div className="text-xs text-muted-foreground space-y-1 pl-7">
                  <div>Category: <strong className="text-foreground font-mono">{investigationData.diagnosis.failureCategory}</strong></div>
                  <div>Transient Failure: <strong className="text-foreground">{investigationData.diagnosis.isTransient ? "Yes" : "No"}</strong></div>
                  <div>Bank Switch Downtime Probability: <strong className="text-foreground">{(investigationData.diagnosis.downtimeProbability * 100).toFixed(0)}%</strong></div>
                  <div className="pt-1">
                    <span className="font-semibold text-foreground">Evidence Log:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground mt-1">
                      {investigationData.diagnosis.evidence.map((ev: string, idx: number) => (
                        <li key={idx}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2: Customer Context Agent */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</div>
                  Customer Context Agent
                </div>
                <div className="text-xs text-muted-foreground space-y-1 pl-7">
                  <div>Customer Profile: <strong className="text-foreground">{investigationData.customerContext.riskProfile} Risk</strong> (LTV: ₹{investigationData.customerContext.lifetimeValue.toLocaleString("en-IN")})</div>
                  <div>Historical Success Rate: <strong className="text-foreground font-mono">{(investigationData.customerContext.historicalSuccessRate * 100).toFixed(0)}%</strong></div>
                  <div>Preferred Rail: <strong className="text-foreground font-mono">{investigationData.customerContext.preferredPaymentMethod}</strong> ({investigationData.customerContext.preferredVpa || "Default"})</div>
                  <div>Contact Fatigue Risk: <strong className="text-foreground">{investigationData.customerContext.contactFatigueRisk}</strong></div>
                  <div className="text-[11px] text-muted-foreground italic pt-1">{investigationData.customerContext.contextNotes}</div>
                </div>
              </div>

              {/* Step 3: Recovery Strategy Agent */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</div>
                  Recovery Strategy Agent & Scoring Matrix
                </div>
                <div className="space-y-2 pl-7 pt-1">
                  <div className="space-y-1.5">
                    <div className="p-2.5 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-primary">★ {investigationData.strategy.chosenStrategy}</span>
                        <span className="text-muted-foreground text-[11px] ml-2">Channel: {investigationData.strategy.recommendedChannel}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {(investigationData.strategy.recoveryProbability * 100).toFixed(0)}% Prob
                      </span>
                    </div>

                    {investigationData.strategy.alternativeStrategies?.slice(0, 3).map((alt: any, idx: number) => (
                      <div key={idx} className="p-2 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                        <div>
                          <span>{alt.strategy}</span>
                          <span className="text-[10px] ml-2 font-mono">({alt.recommendedChannel})</span>
                        </div>
                        <span className="font-mono">{(alt.recoveryProbability * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 4: Guardrail Engine */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">4</div>
                    Policy & Guardrail Engine
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      investigationData.guardrail.passed
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                    }`}
                  >
                    {investigationData.guardrail.status}
                  </span>
                </div>
                <div className="space-y-1 pl-7 pt-1 text-xs">
                  {investigationData.guardrail.ruleEvaluations.map((r: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-muted-foreground">
                      {r.passed ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <span>
                        <strong className="text-foreground">{r.ruleName}:</strong> {r.reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 5 & 6: Action Execution & Outcome */}
              {investigationData.execution && (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Execution & Outcome Recorded
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-600">
                      {investigationData.outcome?.isSuccessful ? "RECOVERED" : "UNRECOVERABLE"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground pl-6 space-y-1">
                    <div>Intervention Dispatched: <strong className="text-foreground">{investigationData.execution.actionType}</strong> via {investigationData.execution.channel}</div>
                    <div>Gateway Response Code: <strong className="text-foreground font-mono">{investigationData.execution.simulatedGatewayResponseCode}</strong></div>
                    <div>Outcome Note: <strong className="text-foreground">{investigationData.outcome?.outcomeSummary}</strong></div>
                    <div>Incremental Lift: <strong className="text-emerald-600 font-mono font-bold">+{formatINR(investigationData.outcome?.incrementalValue || 0)}</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-card">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Close
          </button>

          {investigationData && !investigationData.execution && (
            <button
              onClick={handleManualExecute}
              disabled={executing}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {executing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{executing ? "Executing..." : "Execute Recommended Action"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

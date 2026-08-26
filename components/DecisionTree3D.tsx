"use client";

import { useState } from "react";
import {
  Activity,
  UserCheck,
  Calculator,
  ShieldCheck,
  Send,
  Trophy,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Stage {
  id: string;
  name: string;
  agent: string;
  role: string;
  icon: any;
  color: string;
  bgGlow: string;
  telemetry: {
    label: string;
    value: string;
    subtext: string;
  };
  details: string;
}

const STAGES: Stage[] = [
  {
    id: "stage-1",
    name: "Payment Event",
    agent: "Diagnosis Agent",
    role: "Root Cause Classification",
    icon: Activity,
    color: "#f43f5e",
    bgGlow: "rgba(244, 63, 94, 0.15)",
    telemetry: {
      label: "Categorization",
      value: "ISSUER_DOWNTIME",
      subtext: "HDFC Core Switch Latency > 8s",
    },
    details: "Analyzes raw gateway error codes and issuer telemetry to differentiate transient network issues from fundamental payment terminal errors.",
  },
  {
    id: "stage-2",
    name: "Customer Context",
    agent: "Customer Context Agent",
    role: "LTV & Channel Modeling",
    icon: UserCheck,
    color: "#38bdf8",
    bgGlow: "rgba(56, 189, 248, 0.15)",
    telemetry: {
      label: "Customer Risk",
      value: "VIP (LTV ₹1.85L)",
      subtext: "WhatsApp Preferred / Zero Fatigue",
    },
    details: "Evaluates historical settlement propensity, contact fatigue risk, and preferred UPI/Card payment handles to tailor friction.",
  },
  {
    id: "stage-3",
    name: "Recovery Strategy",
    agent: "Recovery Strategy Agent",
    role: "Expected Value ($EV) Scoring",
    icon: Calculator,
    color: "#818cf8",
    bgGlow: "rgba(129, 140, 248, 0.15)",
    telemetry: {
      label: "Optimal Rail",
      value: "PAYMENT_LINK (88%)",
      subtext: "Expected Value: ₹4,399.12",
    },
    details: "Scores 7 recovery interventions mathematically: EV = Amount * P(Recovery) - Friction Cost.",
  },
  {
    id: "stage-4",
    name: "Policy Shield",
    agent: "Guardrail Engine",
    role: "Safety & Stopping Rules",
    icon: ShieldCheck,
    color: "#fbbf24",
    bgGlow: "rgba(251, 191, 36, 0.15)",
    telemetry: {
      label: "Compliance",
      value: "APPROVED (0/3 Retries)",
      subtext: "Quiet Hours (10PM-8AM) Checked",
    },
    details: "Enforces max retries, TRAI quiet hours, minimum 35% win probability floor, and ₹50k+ human escalation review.",
  },
  {
    id: "stage-5",
    name: "Action Execution",
    agent: "Action Executor",
    role: "Multi-Channel Dispatch",
    icon: Send,
    color: "#c084fc",
    bgGlow: "rgba(192, 132, 252, 0.15)",
    telemetry: {
      label: "Channel Payload",
      value: "WHATSAPP_API_V2",
      subtext: "Razorpay Checkout URL Dispatched",
    },
    details: "Dispatches the optimal intervention payload with zero developer friction.",
  },
  {
    id: "stage-6",
    name: "Settlement & Lift",
    agent: "Outcome Evaluator",
    role: "Financial Verification",
    icon: Trophy,
    color: "#10b981",
    bgGlow: "rgba(16, 185, 129, 0.15)",
    telemetry: {
      label: "Incremental Gain",
      value: "+₹4,999.00 (100%)",
      subtext: "Settled in 3.4 mins (+42% Lift)",
    },
    details: "Verifies gateway settlement and updates live ROI models & customer propensity weights.",
  },
];

export default function DecisionTree3D() {
  const [activeStage, setActiveStage] = useState<string>("stage-3");
  const currentStage = STAGES.find((s) => s.id === activeStage) || STAGES[2];

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Interactive 6-Stage Autonomous Decision Tree
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Hover over any stage to inspect real-time agent telemetry and reasoning
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-Time Autonomous Sync</span>
        </div>
      </div>

      {/* 3D Flow Nodes Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = activeStage === stage.id;

          return (
            <div
              key={stage.id}
              onMouseEnter={() => setActiveStage(stage.id)}
              className={cn(
                "relative group cursor-pointer p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between space-y-3",
                isActive
                  ? "border-blue-500/60 bg-blue-950/20 shadow-lg shadow-blue-500/10 scale-[1.03]"
                  : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider uppercase font-mono text-slate-400">
                  Stage 0{idx + 1}
                </span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: stage.bgGlow, color: stage.color }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-white truncate">{stage.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{stage.agent}</div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-300">
                <div className="text-slate-400 font-sans text-[9px] uppercase">{stage.telemetry.label}</div>
                <div className="font-bold text-white truncate mt-0.5" style={{ color: isActive ? stage.color : "#ffffff" }}>
                  {stage.telemetry.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Stage Inspector Detail Panel */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold font-mono px-2 py-0.5 rounded"
              style={{ backgroundColor: currentStage.bgGlow, color: currentStage.color }}
            >
              {currentStage.agent}
            </span>
            <span className="text-xs font-semibold text-white">{currentStage.role}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{currentStage.details}</p>
        </div>

        <div className="shrink-0 p-3 rounded-lg border border-slate-800 bg-slate-950/80 font-mono text-xs text-right">
          <div className="text-[10px] text-slate-400 uppercase">Live Output Metric</div>
          <div className="text-sm font-bold text-white mt-0.5" style={{ color: currentStage.color }}>
            {currentStage.telemetry.value}
          </div>
          <div className="text-[10px] text-slate-400">{currentStage.telemetry.subtext}</div>
        </div>
      </div>
    </div>
  );
}

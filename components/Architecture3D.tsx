"use client";

import { useState } from "react";
import {
  Globe,
  Server,
  Cpu,
  Zap,
  Database,
  ShieldCheck,
  ArrowDown,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Layer {
  id: string;
  name: string;
  category: string;
  icon: any;
  color: string;
  borderColor: string;
  description: string;
  specs: string[];
}

const LAYERS: Layer[] = [
  {
    id: "layer-1",
    name: "Public Edge & Next.js 14 Frontend",
    category: "Presentation Layer",
    icon: Globe,
    color: "text-blue-400",
    borderColor: "border-blue-500/40",
    description: "Responsive Next.js App Router client rendering dynamic Recharts data, interactive 3D Canvas nodes, and 1-click execution drawers.",
    specs: ["Next.js 14.2 App Router", "Tailwind CSS & Glassmorphism", "Recharts Visualizations", "Zero Client Secrets"],
  },
  {
    id: "layer-2",
    name: "Secure HTTPS REST API & Middleware",
    category: "Gateway & Security Layer",
    icon: Server,
    color: "text-indigo-400",
    borderColor: "border-indigo-500/40",
    description: "Multi-tenant routing layer with JWT session cookie validation, bcrypt security, input sanitation with Zod, and Razorpay webhook verification.",
    specs: ["18 REST Endpoints", "HTTP-Only Secure Cookies", "Zod Schema Validation", "Signature Verification"],
  },
  {
    id: "layer-3",
    name: "6-Agent Autonomous AI Mesh",
    category: "Cognitive AI Layer",
    icon: Cpu,
    color: "text-purple-400",
    borderColor: "border-purple-500/40",
    description: "Hybrid AI decision engine running real-time payment failure diagnosis, customer propensity modeling, and mathematical expected value optimization.",
    specs: ["Diagnosis Agent", "Customer Context Agent", "Strategy EV Engine", "Deterministic Expert Fallback"],
  },
  {
    id: "layer-4",
    name: "Recovery Engine & Guardrail Shield",
    category: "Orchestration & Policy Layer",
    icon: Zap,
    color: "text-amber-400",
    borderColor: "border-amber-500/40",
    description: "Enforces TRAI quiet hours (10PM-8AM IST), max 3 retry hard caps, and multi-channel action execution across NPCI UPI and Razorpay payment links.",
    specs: ["Quiet Hours Suppression", "Max 3 Retries Hard Stop", "WhatsApp / SMS Dispatch", "NPCI UPI Smart Switch"],
  },
  {
    id: "layer-5",
    name: "PostgreSQL & Prisma Relational Ledger",
    category: "Persistence Layer",
    icon: Database,
    color: "text-emerald-400",
    borderColor: "border-emerald-500/40",
    description: "Persistent multi-tenant database storing transactions, customer 360 profiles, recovery cases, AI decision trees, and immutable audit logs.",
    specs: ["Prisma ORM", "16 Relational Models", "PostgreSQL / SQLite", "Immutable Compliance Audit Trail"],
  },
];

export default function Architecture3D() {
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Interactive Full-Stack Architecture Stack
          </h3>
          <p className="text-xs text-slate-400">
            Hover over any architectural layer to inspect its subsystem specifications
          </p>
        </div>

        <span className="text-[11px] font-mono text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20 bg-blue-500/10">
          5-Tier SaaS Architecture
        </span>
      </div>

      {/* Isometric / Layered Stack */}
      <div className="space-y-3">
        {LAYERS.map((layer, index) => {
          const Icon = layer.icon;
          const isHovered = hoveredLayer === layer.id;

          return (
            <div
              key={layer.id}
              onMouseEnter={() => setHoveredLayer(layer.id)}
              onMouseLeave={() => setHoveredLayer(null)}
              className={cn(
                "group cursor-pointer p-4 rounded-xl border transition-all duration-300 relative overflow-hidden",
                isHovered
                  ? `bg-slate-900/90 ${layer.borderColor} shadow-xl scale-[1.01] -translate-y-0.5`
                  : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
              )}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-lg border border-slate-800 bg-slate-950 shrink-0", layer.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{layer.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {layer.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{layer.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 md:justify-end shrink-0">
                  {layer.specs.map((spec) => (
                    <span
                      key={spec}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-300"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

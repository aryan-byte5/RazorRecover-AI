import Link from "next/link";
import { Zap, ShieldCheck, Cpu, Terminal, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-bold text-base">RazorRecover AI</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Autonomous AI-powered payment revenue recovery platform. Intelligently diagnosing payment failures and orchestrating multi-channel recovery workflows.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium border border-blue-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Razorpay AI Buildathon Track: Revenue Recovery
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/features" className="hover:text-foreground transition-colors">AI Diagnosis Agent</Link></li>
              <li><Link href="/features" className="hover:text-foreground transition-colors">Smart NPCI Retry Engine</Link></li>
              <li><Link href="/features" className="hover:text-foreground transition-colors">Customer Context Modeling</Link></li>
              <li><Link href="/features" className="hover:text-foreground transition-colors">Dynamic Payment Links</Link></li>
              <li><Link href="/features" className="hover:text-foreground transition-colors">Guardrails & Policy Shield</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Architecture & Docs</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/architecture" className="hover:text-foreground transition-colors">Multi-Agent Workflow</Link></li>
              <li><Link href="/docs" className="hover:text-foreground transition-colors">Webhook Ingestion Specs</Link></li>
              <li><Link href="/docs" className="hover:text-foreground transition-colors">API Reference</Link></li>
              <li><Link href="/how-it-works" className="hover:text-foreground transition-colors">Interactive Demo Flow</Link></li>
              <li><Link href="/experiments" className="hover:text-foreground transition-colors">AI vs Baseline Simulator</Link></li>
            </ul>
          </div>

          {/* Compliance & Sandbox notice */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Fintech Sandbox</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              This application operates on realistic synthetic Indian payment payloads simulating Razorpay gateway events, NPCI UPI responses, and bank switches.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Terminal className="w-3.5 h-3.5" />
              <span>v2.6.0 (Production Build)</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} RazorRecover AI. Built for the Razorpay AI Buildathon.</p>
          <div className="flex items-center gap-6">
            <Link href="/docs" className="hover:text-foreground">API Docs</Link>
            <Link href="/architecture" className="hover:text-foreground">Security & Isolation</Link>
            <Link href="/login" className="text-primary hover:underline font-medium">Launch Console →</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

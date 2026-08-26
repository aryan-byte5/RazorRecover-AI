"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Link2,
  RefreshCw,
  UserCheck,
  Building2,
  Database,
  Lock,
} from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="py-16 border-b border-border/40 bg-card/30 gradient-mesh">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Comprehensive Platform Capabilities
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Built for Autonomous Revenue Protection
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Explore the six interconnected engines powering RazorRecover AI's autonomous payment recovery infrastructure.
            </p>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Feature 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Payment Diagnosis Agent
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Real-time root cause analysis for every payment failure event. The agent categorizes failures into transient network drops, issuer bank switch downtime, authentication timeouts, card expiry, or insufficient funds.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span>Instant NPCI & Razorpay gateway error code decomposition</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span>Telemetry-driven bank downtime health monitoring (HDFC, SBI, ICICI)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span>Zero hallucination guarantee with verifiable evidence extraction</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Diagnosis Output</span>
                <span className="text-emerald-500 font-bold">Confidence: 94%</span>
              </div>
              <div className="space-y-2 text-muted-foreground">
                <div><span className="text-foreground font-semibold">Category:</span> ISSUER_DOWNTIME</div>
                <div><span className="text-foreground font-semibold">Root Cause:</span> HDFC Core Banking UPI Switch latency &gt; 8000ms</div>
                <div><span className="text-foreground font-semibold">Transient Flag:</span> true (adaptive retry recommended)</div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4 font-mono text-xs order-2 lg:order-1">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Customer Context Profile</span>
                <span className="text-blue-500 font-bold">Risk: LOW • VIP</span>
              </div>
              <div className="space-y-2 text-muted-foreground">
                <div><span className="text-foreground font-semibold">Customer LTV:</span> ₹1,85,000 (Top 5% Tier)</div>
                <div><span className="text-foreground font-semibold">Historical Success:</span> 92% (12/13 payments)</div>
                <div><span className="text-foreground font-semibold">Preferred Channel:</span> WhatsApp Business API</div>
                <div><span className="text-foreground font-semibold">Quiet Hours Status:</span> Allowed (Active Window)</div>
              </div>
            </div>

            <div className="space-y-4 order-1 lg:order-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Customer Context Modeling Engine
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Interventions are personalized to the specific customer. Our context agent evaluates historical lifetime value, past recovery success, communication channel preferences, and contact fatigue risk.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                  <span>Prevents spamming customers with redundant retries or messages</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                  <span>High-LTV accounts receive VIP concierge escalation protocols</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                  <span>Multi-rail awareness (UPI VPAs, Tokenized Cards, NetBanking)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                7 Intelligent Recovery Interventions
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Rather than relying only on immediate blind retries, RazorRecover dynamically selects the optimal recovery mechanism:
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="font-semibold text-foreground">1. Smart NPCI Retry</div>
                  <div className="text-muted-foreground text-[11px]">Sub-second silent re-dispatch</div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="font-semibold text-foreground">2. Dynamic Payment Link</div>
                  <div className="text-muted-foreground text-[11px]">One-click prefilled checkout</div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="font-semibold text-foreground">3. Method Recommendation</div>
                  <div className="text-muted-foreground text-[11px]">Switch failing card to UPI</div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="font-semibold text-foreground">4. Delayed Retry</div>
                  <div className="text-muted-foreground text-[11px]">Queued for bank switch recovery</div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="font-semibold text-foreground">5. Personalized WhatsApp</div>
                  <div className="text-muted-foreground text-[11px]">Rich template notification</div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="font-semibold text-foreground">6. VIP Escalation</div>
                  <div className="text-muted-foreground text-[11px]">Human concierge ticket for ₹50k+</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-3 font-mono text-xs">
              <div className="text-xs font-bold text-foreground uppercase tracking-wider">
                Strategy Scoring Matrix
              </div>
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-foreground space-y-1">
                <div className="flex justify-between font-bold">
                  <span>★ PAYMENT_LINK (WhatsApp)</span>
                  <span className="text-emerald-500">Score: 0.88</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Expected Value: ₹4,399 • Latency: 12 mins • Friction: Low
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border bg-muted/20 text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>SMART_RETRY (API)</span>
                  <span>Score: 0.12</span>
                </div>
                <p className="text-[11px]">
                  Fails on insufficient balance without customer notification.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4 font-mono text-xs order-2 lg:order-1">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Guardrail Policy Evaluator</span>
                <span className="text-emerald-500 font-bold">STATUS: APPROVED</span>
              </div>
              <div className="space-y-1.5 text-muted-foreground">
                <div className="text-emerald-600">✓ Max Retries Rule (1 / 3 attempts)</div>
                <div className="text-emerald-600">✓ Quiet Hours Policy (14:30 IST active window)</div>
                <div className="text-emerald-600">✓ Minimum Probability Floor (78% &gt; 35%)</div>
                <div className="text-emerald-600">✓ Anti-Fraud Shield (Risk score safe)</div>
                <div className="text-emerald-600">✓ Contact Fatigue Shield (No contact in 24h)</div>
              </div>
            </div>

            <div className="space-y-4 order-1 lg:order-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Guardrail & Policy Shield
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Autonomous recovery must respect business rules and regulatory compliance. Every action is gated by an active policy engine before execution.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span>Enforces maximum 3 retry attempts per order</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span>TRAI quiet hours compliance (pauses customer outreach 10 PM - 8 AM)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span>High-ticket floor requiring human sign-off for amounts over ₹50,000</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 border-t border-border bg-card/40 text-center">
          <div className="max-w-3xl mx-auto px-4 space-y-4">
            <h3 className="text-2xl font-bold text-foreground">
              Ready to see the platform in action?
            </h3>
            <p className="text-xs text-muted-foreground">
              Launch our pre-seeded interactive demo sandbox with 2,500+ realistic payment failure events.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 transition-all inline-flex items-center gap-2"
              >
                <span>Launch Demo Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Code2,
  Terminal,
  Copy,
  Check,
  Zap,
  Webhook,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const curlExample = `curl -X POST https://api.razorrecover.ai/v1/investigations \\
  -H "Authorization: Bearer rzp_live_rec_key_98234" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 4999.00,
    "paymentMethod": "UPI",
    "errorCode": "GATEWAY_TIMEOUT",
    "errorDescription": "HDFC Core Banking switch response timed out",
    "customer": {
      "name": "Aarav Sharma",
      "email": "aarav.sharma@example.com",
      "vpa": "aarav@okhdfcbank"
    }
  }'`;

  const nodeExample = `import { RazorRecover } from '@razorrecover/sdk';

const client = new RazorRecover({
  apiKey: process.env.RAZOR_RECOVER_API_KEY
});

// Run autonomous AI investigation and dispatch recovery
const result = await client.investigations.create({
  amount: 4999,
  paymentMethod: 'UPI',
  errorCode: 'GATEWAY_TIMEOUT',
  customer: {
    email: 'aarav.sharma@example.com',
    vpa: 'aarav@okhdfcbank'
  },
  autoExecute: true
});

console.log('AI Chosen Strategy:', result.strategy.chosenStrategy);
console.log('Recovery Status:', result.execution.status);`;

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <Code2 className="w-3.5 h-3.5" />
            Developer Documentation & API Reference
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Integrating RazorRecover AI
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Simple, drop-in integration with your existing Razorpay webhooks or direct REST API client.
          </p>
        </div>

        {/* Section 1: Webhook Ingestion */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Webhook className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">1. Razorpay Webhook Ingestion</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Configure your Razorpay Dashboard webhooks to point to your RazorRecover AI endpoint. Supported event: <code className="text-primary font-mono font-bold">payment.failed</code>.
          </p>

          <div className="p-4 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto space-y-1">
            <div className="text-zinc-500"># Webhook Receiver URL</div>
            <div className="text-emerald-400">POST https://your-domain.com/api/webhooks/razorpay</div>
            <div className="text-zinc-500 pt-2"># Headers required:</div>
            <div>x-razorpay-signature: &lt;HMAC-SHA256-SIGNATURE&gt;</div>
          </div>
        </div>

        {/* Section 2: REST API Reference & SDKs */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">2. Direct AI Investigation API</h2>
            </div>
          </div>

          {/* cURL Example */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>cURL Request</span>
              <button
                onClick={() => copyToClipboard(curlExample, "curl")}
                className="flex items-center gap-1 hover:text-foreground cursor-pointer"
              >
                {copiedCode === "curl" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === "curl" ? "Copied!" : "Copy"}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto">
              <code>{curlExample}</code>
            </pre>
          </div>

          {/* Node.js Example */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Node.js / TypeScript SDK</span>
              <button
                onClick={() => copyToClipboard(nodeExample, "node")}
                className="flex items-center gap-1 hover:text-foreground cursor-pointer"
              >
                {copiedCode === "node" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === "node" ? "Copied!" : "Copy"}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto">
              <code>{nodeExample}</code>
            </pre>
          </div>
        </div>

        {/* Section 3: Guardrail Rules Reference */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">3. Standard Policy Guardrail Matrix</h2>
          </div>
          <div className="border border-border rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="p-3">Rule Name</th>
                  <th className="p-3">Default Threshold</th>
                  <th className="p-3">Behavior on Violation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3 font-mono font-semibold">MAX_RETRIES_LIMIT</td>
                  <td className="p-3 text-muted-foreground">3 attempts</td>
                  <td className="p-3 text-rose-500">Halts autonomous retries; flags as unrecoverable</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-semibold">QUIET_HOURS_POLICY</td>
                  <td className="p-3 text-muted-foreground">22:00 - 08:00 IST</td>
                  <td className="p-3 text-amber-500">Direct WhatsApp/SMS messages queued until 08:00</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-semibold">HIGH_VALUE_THRESHOLD</td>
                  <td className="p-3 text-muted-foreground">₹50,000 INR</td>
                  <td className="p-3 text-blue-500">Escalated to VIP Concierge Desk for human agent review</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-semibold">MIN_CONFIDENCE_THRESHOLD</td>
                  <td className="p-3 text-muted-foreground">35% Recovery Probability</td>
                  <td className="p-3 text-rose-500">Suppresses costly interventions with low win rates</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

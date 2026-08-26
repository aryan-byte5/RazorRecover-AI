"use client";

import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import {
  Settings,
  ShieldCheck,
  Cpu,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({
    maxRetries: 3,
    cooldownHours: 2,
    minRecoveryProbability: 0.35,
    enableWhatsAppReminders: true,
    enableSmsReminders: true,
    enableSmartSwitch: true,
    enableAutoLinks: true,
    quietHoursStart: 22,
    quietHoursEnd: 8,
    humanReviewThreshold: 50000,
    aiProvider: "DETERMINISTIC_EXPERT",
    geminiApiKey: "",
    openaiApiKey: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AppHeader
        title="Settings & Guardrails"
        subtitle="Configure autonomous recovery policies, stopping rules, quiet hours, and AI providers"
      />

      <div className="p-6 space-y-6 flex-1 max-w-4xl">
        <form onSubmit={handleSave} className="space-y-6">
          {saveSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardrail thresholds and workspace settings updated successfully!</span>
            </div>
          )}

          {/* Section 1: Guardrail Policies */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">
                Autonomous Recovery Guardrail Rules
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Max Retry Limit Per Payment</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={settings.maxRetries}
                  onChange={(e) => setSettings({ ...settings, maxRetries: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">Hard cap to prevent customer card fatigue</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">High Value Human Escalation Ceiling (₹)</label>
                <input
                  type="number"
                  step={5000}
                  value={settings.humanReviewThreshold}
                  onChange={(e) => setSettings({ ...settings, humanReviewThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">Transactions exceeding this require VIP concierge sign-off</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Quiet Hours Start (Hour 0-23)</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={settings.quietHoursStart}
                  onChange={(e) => setSettings({ ...settings, quietHoursStart: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">22:00 = 10 PM IST</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Quiet Hours End (Hour 0-23)</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={settings.quietHoursEnd}
                  onChange={(e) => setSettings({ ...settings, quietHoursEnd: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">08:00 = 8 AM IST</p>
              </div>
            </div>
          </div>

          {/* Section 2: AI Provider & Engine */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">
                AI Reasoning Provider
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Active Model Provider</label>
                <select
                  value={settings.aiProvider}
                  onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="DETERMINISTIC_EXPERT">Built-in Deterministic Fintech Expert (Recommended - Zero API Key Needed)</option>
                  <option value="GEMINI">Google Gemini API (gemini-1.5-flash)</option>
                  <option value="OPENAI">OpenAI API (gpt-4o)</option>
                </select>
              </div>

              {settings.aiProvider === "GEMINI" && (
                <div className="space-y-1.5 pt-2">
                  <label className="font-semibold text-foreground">Google Gemini API Key</label>
                  <input
                    type="password"
                    value={settings.geminiApiKey || ""}
                    onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-mono"
                  />
                </div>
              )}

              {settings.aiProvider === "OPENAI" && (
                <div className="space-y-1.5 pt-2">
                  <label className="font-semibold text-foreground">OpenAI API Key</label>
                  <input
                    type="password"
                    value={settings.openaiApiKey || ""}
                    onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {saving ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? "Saving Settings..." : "Save Guardrail Configuration"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

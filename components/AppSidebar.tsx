"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  RotateCcw,
  Users,
  SearchCode,
  LineChart,
  FlaskConical,
  FileCheck2,
  Workflow,
  Settings,
  LogOut,
  Shield,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Recovery Queue", href: "/recovery-queue", icon: Zap, badge: "Live" },
  { label: "Transactions", href: "/transactions", icon: RotateCcw },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "AI Diagnostic Lab", href: "/investigations", icon: SearchCode, highlight: true },
  { label: "Bank Telemetry", href: "/analytics", icon: LineChart },
  { label: "AI vs Baseline", href: "/experiments", icon: FlaskConical, special: true },
  { label: "Audit Ledger", href: "/audit-logs", icon: FileCheck2 },
  { label: "Integrations", href: "/integrations", icon: Workflow },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface AppSidebarProps {
  user?: any;
  workspace?: any;
  onOpenSimulation?: () => void;
}

export default function AppSidebar({
  user: initialUser,
  workspace,
  onOpenSimulation,
}: AppSidebarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(initialUser || null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <aside className="w-64 border-r border-border/80 bg-card/40 flex flex-col justify-between shrink-0 h-screen sticky top-0 backdrop-blur-md select-none">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="h-14 px-5 border-b border-border/80 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-tight text-foreground flex items-center gap-1.5">
                RazorRecover <span className="text-[10px] px-1 py-0.2 rounded bg-primary/10 text-primary font-mono font-semibold">AI</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">FINTECH SAAS</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          <div className="px-2 py-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            Operations & AI
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.2 rounded-full",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                {item.special && (
                  <span
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.2 rounded-full",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                    )}
                  >
                    A/B
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-border/80 bg-card/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0 font-mono">
              {(user?.name || "Aryan").charAt(0)}
            </div>
            <div className="truncate text-left">
              <div className="text-xs font-semibold text-foreground truncate">
                {user?.name || "Aryan Koomar"}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {user?.email || "demo@razorrecover.ai"}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign Out"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

"use client";

import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import SimulationModal from "./SimulationModal";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => Promise<void> | void;
  onOpenSimulation?: () => void;
}

export default function AppHeader({
  title,
  subtitle,
  onRefresh,
  onOpenSimulation,
}: AppHeaderProps) {
  const [internalSimOpen, setInternalSimOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleOpenSim = () => {
    if (onOpenSimulation) {
      onOpenSimulation();
    } else {
      setInternalSimOpen(true);
    }
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/80 bg-background/80 px-6 backdrop-blur-md">
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground hidden sm:block">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Autonomous Status */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Autonomous Engine Active</span>
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh Data"
              className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
            </button>
          )}

          {/* Quick Simulation Trigger */}
          <button
            onClick={handleOpenSim}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run AI Simulation</span>
          </button>
        </div>
      </header>

      <SimulationModal isOpen={internalSimOpen} onClose={() => setInternalSimOpen(false)} />
    </>
  );
}

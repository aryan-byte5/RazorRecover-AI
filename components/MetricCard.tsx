import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  subtitle?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  color?: string;
  highlight?: boolean;
  variant?: "default" | "primary" | "success" | "warning";
  sparkline?: boolean;
  trend?: {
    value?: string;
    label?: string;
    isPositive?: boolean;
  };
}

export default function MetricCard({
  title,
  value,
  subValue,
  subtitle,
  change,
  changeType = "neutral",
  icon: Icon,
  color,
  highlight = false,
  variant = "default",
  trend,
}: MetricCardProps) {
  const displaySubtitle = subtitle || subValue || trend?.label;
  const displayChange = change || trend?.value;
  const isPositive = trend?.isPositive !== undefined ? trend.isPositive : changeType === "positive";

  return (
    <div
      className={cn(
        "group relative rounded-xl border p-5 shadow-sm transition-all duration-200",
        highlight
          ? "border-primary/40 bg-primary/5 dark:bg-primary/10"
          : "border-border/80 bg-card/60 hover:border-border hover:bg-card/90"
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-[13px] font-medium text-muted-foreground">{title}</span>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground transition-colors group-hover:text-foreground",
            highlight
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border/60 bg-muted/30"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-foreground font-mono">{value}</span>
      </div>

      {(displayChange || displaySubtitle) && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {displayChange && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded text-[11px]",
                isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold"
              )}
            >
              {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {displayChange}
            </span>
          )}
          {displaySubtitle && (
            <span className="text-[11px] text-muted-foreground truncate">{displaySubtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}

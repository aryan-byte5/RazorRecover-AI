import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  if (isNaN(amount)) return "₹0";
  if (Math.abs(amount) >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  if (Math.abs(amount) >= 1000) {
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  }
  return `₹${amount.toFixed(2)}`;
}

export function formatINRPrecise(amount: number): string {
  if (isNaN(amount)) return "₹0.00";
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function getStatusBadgeVariant(status: string): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  switch (status.toUpperCase()) {
    case "SUCCESS":
    case "RECOVERED":
    case "COMPLETED":
      return {
        bg: "bg-emerald-500/10 dark:bg-emerald-950/40",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-500/20",
        label: "Recovered",
      };
    case "IN_PROGRESS":
    case "DIAGNOSED":
    case "ACTION_PENDING":
      return {
        bg: "bg-blue-500/10 dark:bg-blue-950/40",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-500/20",
        label: "In Recovery",
      };
    case "QUEUED":
    case "PENDING":
      return {
        bg: "bg-amber-500/10 dark:bg-amber-950/40",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-500/20",
        label: "Queued",
      };
    case "ESCALATED":
      return {
        bg: "bg-purple-500/10 dark:bg-purple-950/40",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-500/20",
        label: "Escalated",
      };
    case "FAILED":
    case "UNRECOVERABLE":
    case "BLOCKED_BY_GUARDRAIL":
      return {
        bg: "bg-rose-500/10 dark:bg-rose-950/40",
        text: "text-rose-600 dark:text-rose-400",
        border: "border-rose-500/20",
        label: "Unrecoverable",
      };
    default:
      return {
        bg: "bg-zinc-500/10 dark:bg-zinc-800/40",
        text: "text-zinc-600 dark:text-zinc-400",
        border: "border-zinc-500/20",
        label: status,
      };
  }
}

export function formatTimeAgo(dateStringOrObj: string | Date): string {
  const date = new Date(dateStringOrObj);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

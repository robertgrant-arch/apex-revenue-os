import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt$(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export function scoreColor(score: number): string {
  if (score >= 90) return "#10b981";
  if (score >= 70) return "#6366f1";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

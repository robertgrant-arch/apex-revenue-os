"use client";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  accent?: "emerald" | "violet" | "amber" | "blue" | "rose";
  className?: string;
}

export default function MetricCard({ title, value, change, changeLabel, icon, accent = "emerald", className }: MetricCardProps) {
  const accentColors = {
    emerald: "text-emerald-400 bg-emerald-400/10",
    violet: "text-violet-400 bg-violet-400/10",
    amber: "text-amber-400 bg-amber-400/10",
    blue: "text-blue-400 bg-blue-400/10",
    rose: "text-rose-400 bg-rose-400/10",
  };
  const isPositive = change !== undefined && change >= 0;
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-slate-400 font-medium">{title}</p>
        {icon && <div className={cn("p-2 rounded-lg", accentColors[accent])}>{icon}</div>}
      </div>
      <p className="text-2xl font-bold text-white mb-2">{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span className={cn("text-xs font-medium", isPositive ? "text-emerald-400" : "text-rose-400")}>
            {isPositive ? "+" : ""}{change}%
          </span>
          {changeLabel && <span className="text-xs text-slate-500">{changeLabel}</span>}
        </div>
      )}
    </Card>
  );
}
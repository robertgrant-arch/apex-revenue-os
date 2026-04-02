import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { Card } from "./Card";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  color?: string;
}

export function MetricCard({ label, value, sub, trend, icon: Icon, color }: MetricCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-slate-400 font-medium">{label}</span>
        {Icon && (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: (color ?? "#10b981") + "20" }}
          >
            <Icon size={14} style={{ color: color ?? "#10b981" }} />
          </div>
        )}
      </div>
      <div className="text-xl font-bold text-white mb-0.5">{value}</div>
      {sub && (
        <div className="flex items-center gap-1 text-xs">
          {trend === "up" && <ArrowUpRight size={12} className="text-emerald-400" />}
          {trend === "down" && <ArrowDownRight size={12} className="text-red-400" />}
          <span className={trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-slate-500"}>
            {sub}
          </span>
        </div>
      )}
    </Card>
  );
}

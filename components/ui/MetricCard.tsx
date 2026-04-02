"use client";

import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { Card } from "./Card";
import { useEffect, useState, useRef } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  color?: string;
}

function AnimatedValue({ value }: { value: string }) {
  const [display, setDisplay] = useState(value);
  const [animate, setAnimate] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Extract numeric part
    const match = value.match(/([\d,.]+)/);
    if (!match) { setDisplay(value); return; }
    
    const target = parseFloat(match[1].replace(/,/g, ""));
    const prefix = value.slice(0, value.indexOf(match[1]));
    const suffix = value.slice(value.indexOf(match[1]) + match[1].length);
    const hasComma = match[1].includes(",");
    const decimals = match[1].includes(".") ? match[1].split(".")[1].length : 0;
    
    setAnimate(true);
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      
      let formatted = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();
      if (hasComma) {
        const parts = formatted.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        formatted = parts.join(".");
      }
      
      setDisplay(prefix + formatted + suffix);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplay(value);
        setAnimate(false);
      }
    };
    
    requestAnimationFrame(step);
  }, [value]);

  return (
    <div ref={ref} className={`text-xl font-bold text-white mb-0.5 transition-all ${animate ? "scale-105" : "scale-100"}`}>
      {display}
    </div>
  );
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
      <AnimatedValue value={value} />
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

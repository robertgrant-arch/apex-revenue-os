import { cn } from "@/lib/utils";

type BadgeColor =
  | "emerald" | "blue" | "amber" | "red"
  | "purple" | "slate" | "pink" | "cyan"
  | "orange" | "indigo";

const colorMap: Record<BadgeColor, string> = {
  emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  blue:    "bg-blue-500/15    text-blue-400    border-blue-500/30",
  amber:   "bg-amber-500/15   text-amber-400   border-amber-500/30",
  red:     "bg-red-500/15     text-red-400     border-red-500/30",
  purple:  "bg-purple-500/15  text-purple-400  border-purple-500/30",
  slate:   "bg-slate-700/50   text-slate-400   border-slate-600/30",
  pink:    "bg-pink-500/15    text-pink-400    border-pink-500/30",
  cyan:    "bg-cyan-500/15    text-cyan-400    border-cyan-500/30",
  orange:  "bg-orange-500/15  text-orange-400  border-orange-500/30",
  indigo:  "bg-indigo-500/15  text-indigo-400  border-indigo-500/30",
};

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

export function Badge({ children, color = "emerald", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        colorMap[color],
        className
      )}
    >
      {children}
    </span>
  );
}

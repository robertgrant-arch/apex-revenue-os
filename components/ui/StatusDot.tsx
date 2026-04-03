import { cn } from "@/lib/utils";

type Status =
  | "active" | "paused" | "processing" | "draft"
  | "error" | "warning" | "connected" | "disconnected";

const statusMap: Record<Status, string> = {
  active:       "bg-emerald-400",
  connected:    "bg-emerald-400",
  processing:   "bg-blue-400 animate-pulse",
  paused:       "bg-amber-400",
  warning:      "bg-amber-400",
  draft:        "bg-slate-500",
  disconnected: "bg-slate-500",
  error:        "bg-red-400",
};

interface StatusDotProps {
  status: Status;
  className?: string;
}

export default function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      className={cn("inline-block w-2 h-2 rounded-full", statusMap[status] ?? "bg-slate-500", className)}
    />
  );
}

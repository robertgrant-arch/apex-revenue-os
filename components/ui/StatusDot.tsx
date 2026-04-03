import { cn } from "@/lib/utils";

type Status = "active" | "idle" | "error" | "paused" | "processing" | "draft"
  | "warning" | "connected" | "disconnected";

const statusMap: Record<Status, string> = {
  active: "bg-emerald-400",
  connected: "bg-emerald-400",
  idle: "bg-blue-400 animate-pulse",
  paused: "bg-amber-400",
  processing: "bg-amber-400",
  draft: "bg-slate-500",
  warning: "bg-slate-500",
  error: "bg-red-400",
  disconnected: "bg-red-400",
};

interface StatusDotProps {
  status: string;
  className?: string;
}

export default function StatusDot({ status, className }: StatusDotProps) {
  const normalized = status?.toLowerCase() as Status;
  return (
    <span
      className={cn("inline-block w-2 h-2 rounded-full", statusMap[normalized] ?? "bg-slate-500", className)}
    />
  );
}
// app/(dashboard)/agents/page.tsx
"use client";

import { useState } from "react";
import {
  useAgents,
  useCreateAgent,
  type AgentParams,
  type CreateAgentInput,
} from "@/lib/hooks";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import StatusDot from "@/components/ui/StatusDot";
import TopBar from "@/components/layout/TopBar";
import ChartTooltip from "@/components/ui/ChartTooltip";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// ─── Static radar data ───────────────────────────────────────────────────────

const radarData = [
  { metric: "Accuracy", qualifier: 88, outreach: 74, scheduler: 81, compliance: 97, analytics: 92 },
  { metric: "Speed", qualifier: 95, outreach: 88, scheduler: 76, compliance: 91, analytics: 70 },
  { metric: "Coverage", qualifier: 79, outreach: 92, scheduler: 85, compliance: 88, analytics: 95 },
  { metric: "Reliability", qualifier: 91, outreach: 83, scheduler: 94, compliance: 99, analytics: 87 },
  { metric: "Efficiency", qualifier: 85, outreach: 78, scheduler: 88, compliance: 93, analytics: 82 },
  { metric: "Learning", qualifier: 72, outreach: 81, scheduler: 69, compliance: 75, analytics: 90 },
];

// ─── Constants ───────────────────────────────────────────────────────────────

const AGENT_TYPES = [
  "ALL",
  "QUALIFIER",
  "OUTREACH",
  "SCHEDULER",
  "COMPLIANCE",
  "ANALYTICS",
];

const AGENT_STATUSES = ["ALL", "ACTIVE", "IDLE", "PAUSED", "ERROR", "OFFLINE"];

const statusConfig: Record
  string,
  { badge: string; dot: string; label: string; ring: string }
> = {
  ACTIVE: {
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
    label: "Active",
    ring: "ring-emerald-500/30",
  },
  IDLE: {
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    dot: "bg-blue-400",
    label: "Idle",
    ring: "ring-blue-500/30",
  },
  PAUSED: {
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    dot: "bg-amber-400",
    label: "Paused",
    ring: "ring-amber-500/30",
  },
  ERROR: {
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
    dot: "bg-red-400",
    label: "Error",
    ring: "ring-red-500/30",
  },
  OFFLINE: {
    badge: "bg-slate-600/40 text-slate-400 border-slate-600/30",
    dot: "bg-slate-500",
    label: "Offline",
    ring: "ring-slate-600/30",
  },
};

const typeConfig: Record
  string,
  { color: string; bg: string; icon: React.ReactNode }
> = {
  QUALIFIER: {
    color: "text-violet-400",
    bg: "bg-violet-500/20",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  OUTREACH: {
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  SCHEDULER: {
    color: "text-amber-400",
    bg: "bg-amber-500/20",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  COMPLIANCE: {
    color: "text-rose-400",
    bg: "bg-rose-500/20",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  ANALYTICS: {
    color: "text-teal-400",
    bg: "bg-teal-500/20",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
};

const radarColors: Record<string, string> = {
  qualifier: "#7c3aed",
  outreach: "#3b82f6",
  scheduler: "#f59e0b",
  compliance: "#f43f5e",
  analytics: "#14b8a6",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

function formatPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function relativeTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Derive synthetic audit log entries from agents data
function deriveAuditLog(agents: any[]): any[] {
  const entries: any[] = [];
  agents.forEach((agent) => {
    const m = agent.metrics ?? {};
    if (m.totalProcessed) {
      entries.push({
        id: `${agent.id}-processed`,
        agentId: agent.id,
        agentName: agent.name,
        agentType: agent.type,
        action: "BATCH_PROCESSED",
        detail: `Processed ${formatNum(m.totalProcessed)} items`,
        timestamp: m.lastRunAt ?? agent.updatedAt ?? agent.createdAt,
        status: "SUCCESS",
      });
    }
    if (m.totalConversations) {
      entries.push({
        id: `${agent.id}-conversations`,
        agentId: agent.id,
        agentName: agent.name,
        agentType: agent.type,
        action: "CONVERSATIONS_COMPLETED",
        detail: `${formatNum(m.totalConversations)} conversations · ${formatPct(m.bookingRate ?? 0)} booking rate`,
        timestamp: agent.updatedAt ?? agent.createdAt,
        status: "SUCCESS",
      });
    }
    if (m.totalReviewed) {
      entries.push({
        id: `${agent.id}-reviewed`,
        agentId: agent.id,
        agentName: agent.name,
        agentType: agent.type,
        action: "COMPLIANCE_SCAN",
        detail: `Reviewed ${formatNum(m.totalReviewed)} items · ${m.criticalFlags ?? 0} critical flags`,
        timestamp: agent.updatedAt ?? agent.createdAt,
        status: (m.criticalFlags ?? 0) > 0 ? "WARNING" : "SUCCESS",
      });
    }
    if (m.forecastsGenerated) {
      entries.push({
        id: `${agent.id}-forecasts`,
        agentId: agent.id,
        agentName: agent.name,
        agentType: agent.type,
        action: "FORECAST_GENERATED",
        detail: `${m.forecastsGenerated} forecasts · ${formatPct(m.avgAccuracy ?? 0)} accuracy`,
        timestamp: m.lastRunAt ?? agent.updatedAt ?? agent.createdAt,
        status: "SUCCESS",
      });
    }
    if (m.sequencesCreated) {
      entries.push({
        id: `${agent.id}-sequences`,
        agentId: agent.id,
        agentName: agent.name,
        agentType: agent.type,
        action: "SEQUENCES_CREATED",
        detail: `${formatNum(m.sequencesCreated)} sequences · ${formatPct(m.avgOpenRate ?? 0)} avg open rate`,
        timestamp: agent.updatedAt ?? agent.createdAt,
        status: "SUCCESS",
      });
    }
    // Always add a config/init entry
    entries.push({
      id: `${agent.id}-init`,
      agentId: agent.id,
      agentName: agent.name,
      agentType: agent.type,
      action: "AGENT_INITIALIZED",
      detail: `Agent configured and deployed`,
      timestamp: agent.createdAt,
      status: "INFO",
    });
  });

  return entries
    .sort((a, b) => {
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 20);
}

// Derive sparkline-style activity data from agent metrics
function deriveActivityChart(agent: any): any[] {
  const m = agent.metrics ?? {};
  const base = m.totalProcessed ?? m.totalConversations ?? m.totalReviewed ?? 100;
  return Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    activity: Math.max(
      0,
      Math.floor((base / 7) * (0.6 + Math.random() * 0.8))
    ),
  }));
}

// ─── Skeleton components ─────────────────────────────────────────────────────

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-800 ${className}`} />
  );
}

function AgentCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-11 w-11 rounded-xl shrink-0" />
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-36" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
        </div>
        <SkeletonBlock className="h-6 w-16 rounded-full" />
      </div>
      <SkeletonBlock className="h-3.5 w-full" />
      <SkeletonBlock className="h-3.5 w-3/4" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-slate-800/60 p-3 space-y-1.5">
            <SkeletonBlock className="h-3 w-14" />
            <SkeletonBlock className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-1">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-7 w-20 rounded-lg" />
      </div>
    </div>
  );
}

function AuditRowSkeleton() {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-800/50">
      <SkeletonBlock className="h-7 w-7 rounded-lg shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1.5">
        <SkeletonBlock className="h-3.5 w-40" />
        <SkeletonBlock className="h-3 w-56" />
      </div>
      <SkeletonBlock className="h-3 w-14 shrink-0" />
    </div>
  );
}

function SummaryCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex items-center gap-4">
      <SkeletonBlock className="h-10 w-10 rounded-lg shrink-0" />
      <div className="space-y-2 flex-1">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-5 w-12" />
        <SkeletonBlock className="h-3 w-28" />
      </div>
    </div>
  );
}

// ─── AgentCard component ─────────────────────────────────────────────────────

interface AgentCardProps {
  agent: any;
  onSelect: (agent: any) => void;
}

function AgentCard({ agent, onSelect }: AgentCardProps) {
  const status = statusConfig[agent.status] ?? statusConfig["OFFLINE"];
  const type = typeConfig[agent.type] ?? {
    color: "text-slate-400",
    bg: "bg-slate-700/40",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
  };
  const m = agent.metrics ?? {};
  const cfg = agent.config ?? {};

  // Build primary metrics from whatever the agent type exposes
  const primaryMetrics: { label: string; value: string }[] = [];

  if (m.totalProcessed != null) {
    primaryMetrics.push({ label: "Processed", value: formatNum(m.totalProcessed) });
  }
  if (m.qualifiedRate != null) {
    primaryMetrics.push({ label: "Qual. Rate", value: formatPct(m.qualifiedRate) });
  }
  if (m.avgScore != null) {
    primaryMetrics.push({ label: "Avg Score", value: m.avgScore.toFixed(1) });
  }
  if (m.sequencesCreated != null) {
    primaryMetrics.push({ label: "Sequences", value: formatNum(m.sequencesCreated) });
  }
  if (m.avgOpenRate != null) {
    primaryMetrics.push({ label: "Open Rate", value: formatPct(m.avgOpenRate) });
  }
  if (m.avgReplyRate != null) {
    primaryMetrics.push({ label: "Reply Rate", value: formatPct(m.avgReplyRate) });
  }
  if (m.totalConversations != null) {
    primaryMetrics.push({ label: "Convos", value: formatNum(m.totalConversations) });
  }
  if (m.bookingRate != null) {
    primaryMetrics.push({ label: "Booking", value: formatPct(m.bookingRate) });
  }
  if (m.showRate != null) {
    primaryMetrics.push({ label: "Show Rate", value: formatPct(m.showRate) });
  }
  if (m.totalReviewed != null) {
    primaryMetrics.push({ label: "Reviewed", value: formatNum(m.totalReviewed) });
  }
  if (m.flagRate != null) {
    primaryMetrics.push({ label: "Flag Rate", value: formatPct(m.flagRate) });
  }
  if (m.criticalFlags != null) {
    primaryMetrics.push({ label: "Critical", value: String(m.criticalFlags) });
  }
  if (m.forecastsGenerated != null) {
    primaryMetrics.push({ label: "Forecasts", value: String(m.forecastsGenerated) });
  }
  if (m.avgAccuracy != null) {
    primaryMetrics.push({ label: "Accuracy", value: formatPct(m.avgAccuracy) });
  }

  const displayMetrics = primaryMetrics.slice(0, 3);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex flex-col gap-4 hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`h-11 w-11 rounded-xl ${type.bg} ${type.color} flex items-center justify-center shrink-0 ring-2 ${status.ring}`}
          >
            {type.icon}
          </div>
          <div>
            <h3 className="text-white font-semibold leading-tight">
              {agent.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {agent.type?.replace(/_/g, " ")}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${status.badge}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${status.dot} ${
              agent.status === "ACTIVE" ? "animate-pulse" : ""
            }`}
          />
          {status.label}
        </span>
      </div>

      {/* Description */}
      {agent.description && (
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
          {agent.description}
        </p>
      )}

      {/* Metrics grid */}
      {displayMetrics.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {displayMetrics.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg bg-slate-800/60 border border-slate-800 px-3 py-2.5"
            >
              <p className="text-xs text-slate-500 truncate">{label}</p>
              <p className="text-white text-sm font-semibold mt-0.5 font-mono">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Config tags */}
      {cfg.channels && Array.isArray(cfg.channels) && cfg.channels.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {cfg.channels.map((ch: string) => (
            <span
              key={ch}
              className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-400 border border-slate-700"
            >
              {ch}
            </span>
          ))}
        </div>
      )}

      {cfg.regulations && Array.isArray(cfg.regulations) && cfg.regulations.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {cfg.regulations.map((r: string) => (
            <span
              key={r}
              className="px-2 py-0.5 text-xs rounded bg-rose-500/10 text-rose-400 border border-rose-500/20"
            >
              {r}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <p className="text-xs text-slate-500">
          {m.lastRunAt
            ? `Last run ${relativeTime(m.lastRunAt)}`
            : agent.updatedAt
            ? `Updated ${relativeTime(agent.updatedAt)}`
            : "Never run"}
        </p>
        <button
          onClick={() => onSelect(agent)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Details
        </button>
      </div>
    </div>
  );
}

// ─── AgentDetail drawer ───────────────────────────────────────────────────────

interface AgentDetailProps {
  agent: any;
  onClose: () => void;
}

function AgentDetail({ agent, onClose }: AgentDetailProps) {
  const status = statusConfig[agent.status] ?? statusConfig["OFFLINE"];
  const type = typeConfig[agent.type] ?? {
    color: "text-slate-400",
    bg: "bg-slate-700/40",
    icon: null,
  };
  const m = agent.metrics ?? {};
  const cfg = agent.config ?? {};
  const activityChart = deriveActivityChart(agent);

  // Flatten all metrics for the detail view
  const allMetrics = Object.entries(m)
    .filter(([, v]) => v != null && typeof v !== "object")
    .map(([key, value]) => ({
      label: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase())
        .trim(),
      value:
        typeof value === "number"
          ? key.toLowerCase().includes("rate") ||
            key.toLowerCase().includes("accuracy")
            ? formatPct(value as number)
            : key.toLowerCase().includes("time") &&
              (value as number) < 100
            ? `${(value as number).toFixed(1)}s`
            : formatNum(value as number)
          : String(value),
    }));

  const allConfig = Object.entries(cfg)
    .filter(([, v]) => v != null && typeof v !== "object" && !Array.isArray(v))
    .map(([key, value]) => ({
      label: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase())
        .trim(),
      value: String(value),
    }));

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
        {/* Panel header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-lg ${type.bg} ${type.color} flex items-center justify-center shrink-0`}
            >
              {type.icon}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white leading-tight">
                {agent.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {agent.type?.replace(/_/g, " ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.badge}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${status.dot} ${
                  agent.status === "ACTIVE" ? "animate-pulse" : ""
                }`}
              />
              {status.label}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Description */}
          {agent.description && (
            <div className="px-5 py-4 border-b border-slate-800">
              <p className="text-slate-300 text-sm leading-relaxed">
                {agent.description}
              </p>
            </div>
          )}

          {/* Activity sparkline */}
          <div className="px-5 py-4 border-b border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                7-Day Activity
              </h3>
              <Badge variant="violet" size="sm">
                Estimated
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={activityChart}>
                <defs>
                  <linearGradient id={`grad-${agent.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="day"
                  stroke="#475569"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="activity"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  fill={`url(#grad-${agent.id})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Performance metrics */}
          {allMetrics.length > 0 && (
            <div className="px-5 py-4 border-b border-slate-800">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Performance Metrics
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {allMetrics.map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-lg bg-slate-800/60 border border-slate-800 px-3 py-2.5"
                  >
                    <p className="text-xs text-slate-500 truncate">{label}</p>
                    <p className="text-white text-sm font-semibold mt-0.5 font-mono">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System prompt */}
          {agent.systemPrompt && (
            <div className="px-5 py-4 border-b border-slate-800">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                System Prompt
              </h3>
              <div className="rounded-lg bg-slate-950 border border-slate-800 px-4 py-3">
                <p className="text-slate-300 text-xs leading-relaxed font-mono whitespace-pre-wrap line-clamp-6">
                  {agent.systemPrompt}
                </p>
              </div>
            </div>
          )}

          {/* Configuration */}
          {(allConfig.length > 0 ||
            (cfg.channels && cfg.channels.length > 0) ||
            (cfg.regulations && cfg.regulations.length > 0)) && (
            <div className="px-5 py-4 border-b border-slate-800">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Configuration
              </h3>
              <div className="space-y-2">
                {allConfig.map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className="text-xs text-white font-mono font-medium">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {cfg.channels && cfg.channels.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-1.5">Channels</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cfg.channels.map((ch: string) => (
                      <span
                        key={ch}
                        className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-400 border border-slate-700"
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {cfg.regulations && cfg.regulations.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-1.5">Regulations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cfg.regulations.map((r: string) => (
                      <span
                        key={r}
                        className="px-2 py-0.5 text-xs rounded bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {cfg.forecastHorizons && cfg.forecastHorizons.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-1.5">
                    Forecast Horizons
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cfg.forecastHorizons.map((h: number) => (
                      <span
                        key={h}
                        className="px-2 py-0.5 text-xs rounded bg-teal-500/10 text-teal-400 border border-teal-500/20"
                      >
                        {h}d
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="px-5 py-4">
            <div className="space-y-2">
              {[
                { label: "Created", value: agent.createdAt },
                { label: "Updated", value: agent.updatedAt },
                { label: "Last Run", value: agent.metrics?.lastRunAt },
              ].map(({ label, value }) =>
                value ? (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Agent Modal ───────────────────────────────────────────────────────

interface CreateAgentModalProps {
  onClose: () => void;
}

function CreateAgentModal({ onClose }: CreateAgentModalProps) {
  const createMutation = useCreateAgent();
  const [form, setForm] = useState<CreateAgentInput>({
    name: "",
    type: "QUALIFIER",
    description: "",
    status: "ACTIVE",
    systemPrompt: "",
    config: {},
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setField<K extends keyof CreateAgentInput>(
    key: K,
    value: CreateAgentInput[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Agent name is required";
    if (!form.type) next.type = "Agent type is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    createMutation.mutate(
      {
        ...form,
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        systemPrompt: form.systemPrompt?.trim() || undefined,
      },
      { onSuccess: onClose }
    );
  }

  const inputClass = (field: string) =>
    `w-full bg-slate-800 border ${
      errors[field]
        ? "border-red-500/60 focus:border-red-500"
        : "border-slate-700 focus:border-violet-500"
    } text-white placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">
            Deploy New Agent
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Agent Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. Solar Lead Qualifier v2"
              className={inputClass("name")}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Type <span className="text-red-400">*</span>
              </label>
              <select
                value={form.type}
                onChange={(e) => setField("type", e.target.value)}
                className={inputClass("type")}
              >
                {["QUALIFIER", "OUTREACH", "SCHEDULER", "COMPLIANCE", "ANALYTICS"].map(
                  (t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  )
                )}
              </select>
              {errors.type && (
                <p className="mt-1.5 text-xs text-red-400">{errors.type}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Initial Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
                className={inputClass("status")}
              >
                {["ACTIVE", "IDLE", "PAUSED"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="What does this agent do?"
              rows={2}
              className={`${inputClass("description")} resize-none`}
            />
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              System Prompt
            </label>
            <textarea
              value={form.systemPrompt}
              onChange={(e) => setField("systemPrompt", e.target.value)}
              placeholder="Define the agent's persona, goals, and instructions…"
              rows={4}
              className={`${inputClass("systemPrompt")} resize-none font-mono text-xs`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending && (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {createMutation.isPending ? "Deploying…" : "Deploy Agent"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Audit log entry ──────────────────────────────────────────────────────────

const auditActionConfig: Record
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  BATCH_PROCESSED: {
    label: "Batch Processed",
    color: "text-violet-400",
    bg: "bg-violet-500/20",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  CONVERSATIONS_COMPLETED: {
    label: "Conversations",
    color: "text-amber-400",
    bg: "bg-amber-500/20",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  COMPLIANCE_SCAN: {
    label: "Compliance Scan",
    color: "text-rose-400",
    bg: "bg-rose-500/20",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  FORECAST_GENERATED: {
    label: "Forecast",
    color: "text-teal-400",
    bg: "bg-teal-500/20",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  SEQUENCES_CREATED: {
    label: "Sequences",
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  AGENT_INITIALIZED: {
    label: "Initialized",
    color: "text-slate-400",
    bg: "bg-slate-700/60",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
};

const auditStatusDot: Record<string, string> = {
  SUCCESS: "bg-emerald-500",
  WARNING: "bg-amber-500",
  ERROR: "bg-red-500",
  INFO: "bg-slate-500",
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"agents" | "performance" | "audit">(
    "agents"
  );

  const params: AgentParams = {
    ...(typeFilter !== "ALL" && { type: typeFilter }),
    ...(statusFilter !== "ALL" && { status: statusFilter }),
  };

  const { data, isLoading, isError, error } = useAgents(params);

  const allAgents: any[] = data?.agents ?? data?.data ?? [];

  const agents = search.trim()
    ? allAgents.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.description?.toLowerCase().includes(search.toLowerCase()) ||
          a.type?.toLowerCase().includes(search.toLowerCase())
      )
    : allAgents;

  const auditLog = deriveAuditLog(allAgents);

  // ── Summary ─────────────────────────────────────────────────────────────────
  const summary = {
    total: allAgents.length,
    active: allAgents.filter((a) => a.status === "ACTIVE").length,
    idle: allAgents.filter((a) => a.status === "IDLE").length,
    errors: allAgents.filter((a) => a.status === "ERROR").length,
    totalProcessed: allAgents.reduce((acc, a) => {
      const m = a.metrics ?? {};
      return (
        acc +
        (m.totalProcessed ?? 0) +
        (m.totalConversations ?? 0) +
        (m.totalReviewed ?? 0)
      );
    }, 0),
    avgUptime: allAgents.length > 0
      ? allAgents.filter((a) => a.status === "ACTIVE").length / allAgents.length
      : 0,
  };

  const hasFilters = search.trim() || typeFilter !== "ALL" || statusFilter !== "ALL";

  function clearFilters() {
    setSearch("");
    setTypeFilter("ALL");
    setStatusFilter("ALL");
  }

  const summaryCards = [
    {
      label: "Total Agents",
      value: String(summary.total),
      sub: `${summary.active} active · ${summary.idle} idle`,
      color: "violet",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
        </svg>
      ),
    },
    {
      label: "System Uptime",
      value: `${(summary.avgUptime * 100).toFixed(0)}%`,
      sub: summary.errors > 0 ? `${summary.errors} agent${summary.errors > 1 ? "s" : ""} in error` : "All systems nominal",
      color: summary.errors > 0 ? "rose" : "emerald",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      label: "Total Operations",
      value: formatNum(summary.totalProcessed),
      sub: "Across all agents",
      color: "blue",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: "Audit Events",
      value: String(auditLog.length),
      sub: "Last 30 days",
      color: "amber",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
  ];

  const colorMap: Record<string, string> = {
    violet: "bg-violet-500/20 text-violet-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
    blue: "bg-blue-500/20 text-blue-400",
    amber: "bg-amber-500/20 text-amber-400",
    rose: "bg-rose-500/20 text-rose-400",
  };

  // Radar keys that map to agent types (lowercase)
  const radarAgentKeys = ["qualifier", "outreach", "scheduler", "compliance", "analytics"];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <TopBar title="AI Agents" />

      <main className="flex-1 p-6 space-y-6">

        {/* ── Summary Cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <SummaryCardSkeleton key={i} />
              ))
            : summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex items-center gap-4"
                >
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                      colorMap[card.color]
                    }`}
                  >
                    {card.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 truncate">{card.label}</p>
                    <p className="text-white font-semibold text-lg leading-tight">
                      {card.value}
                    </p>
                    <p
                      className={`text-xs mt-0.5 truncate ${
                        card.label === "System Uptime" && summary.errors > 0
                          ? "text-rose-400"
                          : "text-slate-500"
                      }`}
                    >
                      {card.sub}
                    </p>
                  </div>
                </div>
              ))}
        </div>

        {/* ── Tabs ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 border-b border-slate-800">
          {(["agents", "performance", "audit"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-violet-500 text-violet-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* AGENTS TAB                                                */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === "agents" && (
          <div className="space-y-5">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search agents…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-lg pl-9 pr-8 py-2 text-sm outline-none focus:border-violet-500 transition-colors"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500 transition-colors"
                >
                  {AGENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === "ALL" ? "All Types" : t}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500 transition-colors"
                >
                  {AGENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s === "ALL" ? "All Statuses" : s}
                    </option>
                  ))}
                </select>

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                )}

                {!isLoading && !isError && (
                  <span className="text-xs text-slate-500">
                    {agents.length} agent{agents.length !== 1 ? "s" : ""}
                  </span>
                )}

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Deploy Agent
                </button>
              </div>
            </div>

            {/* Error */}
            {isError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
                <svg
                  className="w-8 h-8 text-red-400 mx-auto mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 font-medium text-sm">
                  Failed to load agents
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  {(error as Error)?.message ?? "An unexpected error occurred"}
                </p>
              </div>
            )}

            {/* Agent grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <AgentCardSkeleton key={i} />
                ))}
              </div>
            ) : agents.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-16 text-center">
                <svg
                  className="w-12 h-12 text-slate-700 mx-auto mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
                <p className="text-slate-500 text-sm">No agents found</p>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Clear filters to see all agents
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {agents.map((agent: any) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onSelect={setSelectedAgent}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* PERFORMANCE TAB                                           */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === "performance" && (
          <div className="space-y-5">
            <Card>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Agent Performance Radar
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Comparative performance across key operational dimensions
                    </p>
                  </div>
                  <Badge variant="violet" size="sm">
                    Normalized
                  </Badge>
                </div>

                {isLoading ? (
                  <SkeletonBlock className="h-72 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis
                        dataKey="metric"
                        tick={{ fill: "#64748b", fontSize: 12 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: "#475569", fontSize: 10 }}
                        axisLine={false}
                        tickCount={4}
                      />
                      {radarAgentKeys.map((key) => (
                        <Radar
                          key={key}
                          name={key.charAt(0).toUpperCase() + key.slice(1)}
                          dataKey={key}
                          stroke={radarColors[key]}
                          fill={radarColors[key]}
                          fillOpacity={0.12}
                          strokeWidth={2}
                        />
                      ))}
                      <Tooltip content={<ChartTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                  {radarAgentKeys.map((key) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-sm inline-block"
                        style={{ backgroundColor: radarColors[key] }}
                      />
                      <span className="text-xs text-slate-500 capitalize">
                        {key}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Per-agent performance table */}
            <Card>
              <div className="p-5">
                <h2 className="text-sm font-semibold text-white mb-4">
                  Agent Performance Breakdown
                </h2>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <SkeletonBlock className="h-8 w-8 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <SkeletonBlock className="h-3.5 w-32" />
                          <SkeletonBlock className="h-1.5 w-full rounded-full" />
                        </div>
                        <SkeletonBlock className="h-3.5 w-10 shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : allAgents.length === 0 ? (
                  <p className="text-slate-500 text-sm">No agent data available</p>
                ) : (
                  <div className="space-y-4">
                    {allAgents.map((agent: any) => {
                      const m = agent.metrics ?? {};
                      const type = typeConfig[agent.type];
                      const perf =
                        m.qualifiedRate ??
                        m.avgOpenRate ??
                        m.bookingRate ??
                        (1 - (m.flagRate ?? 0)) ??
                        m.avgAccuracy ??
                        0;
                      const perfPct = Math.min(100, perf * 100);

                      return (
                        <div key={agent.id} className="flex items-center gap-4">
                          <div
                            className={`h-8 w-8 rounded-lg ${type?.bg ?? "bg-slate-700/40"} ${type?.color ?? "text-slate-400"} flex items-center justify-center shrink-0`}
                          >
                            <span className="scale-75 block">{type?.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-sm text-white font-medium truncate">
                                {agent.name}
                              </p>
                              <span className="text-xs text-slate-400 font-mono ml-2 shrink-0">
                                {perfPct.toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${perfPct}%`,
                                  backgroundColor:
                                    radarColors[
                                      agent.type?.toLowerCase() ?? "qualifier"
                                    ] ?? "#7c3aed",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* AUDIT TAB                                                 */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === "audit" && (
          <Card>
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Agent Audit Log
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Activity derived from agent metric snapshots
                  </p>
                </div>
                {!isLoading && (
                  <span className="text-xs text-slate-500">
                    {auditLog.length} event{auditLog.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {isLoading ? (
                <div>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <AuditRowSkeleton key={i} />
                  ))}
                </div>
              ) : isError ? (
                <div className="py-8 text-center">
                  <p className="text-red-400 text-sm">Failed to load audit log</p>
                </div>
              ) : auditLog.length === 0 ? (
                <div className="py-12 text-center">
                  <svg
                    className="w-10 h-10 text-slate-700 mx-auto mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-slate-500 text-sm">No audit events yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/50">
                  {auditLog.map((entry: any) => {
                    const actionCfg =
                      auditActionConfig[entry.action] ??
                      auditActionConfig["AGENT_INITIALIZED"];
                    const dotColor =
                      auditStatusDot[entry.status] ?? auditStatusDot["INFO"];

                    return (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 py-3 hover:bg-slate-800/20 transition-colors rounded-lg px-2 -mx-2"
                      >
                        {/* Icon */}
                        <div
                          className={`h-7 w-7 rounded-lg ${actionCfg.bg} ${actionCfg.color} flex items-center justify-center shrink-0 mt-0.5`}
                        >
                          {actionCfg.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm text-white font-medium">
                              {entry.agentName}
                            </p>
                            <span className="text-xs text-slate-600">·</span>
                            <p className="text-xs text-slate-500">
                              {actionCfg.label}
                            </p>
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${dotColor} shrink-0`}
                            />
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {entry.detail}
                          </p>
                        </div>

                        {/* Timestamp */}
                        <p className="text-xs text-slate-600 shrink-0 mt-0.5">
                          {relativeTime(entry.timestamp)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        )}
      </main>

      {/* ── Agent Detail Drawer ─────────────────────────────────── */}
      {selectedAgent && (
        <AgentDetail
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}

      {/* ── Create Agent Modal ──────────────────────────────────── */}
      {showCreateModal && (
        <CreateAgentModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

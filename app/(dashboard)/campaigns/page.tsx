// app/(dashboard)/campaigns/page.tsx
"use client";

import { useState } from "react";
import {
  useCampaigns,
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  type CampaignParams,
  type CreateCampaignInput,
} from "@/lib/hooks";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import StatusDot from "@/components/ui/StatusDot";
import TopBar from "@/components/layout/TopBar";
import ChartTooltip from "@/components/ui/ChartTooltip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts";

// ─── Static radar data for experiments section ──────────────────────────────
const radarData = [
  { metric: "Open Rate", variantA: 34, variantB: 28, variantC: 41 },
  { metric: "CTR", variantA: 6.2, variantB: 5.1, variantC: 7.8 },
  { metric: "Conv. Rate", variantA: 3.1, variantB: 2.4, variantC: 4.2 },
  { metric: "Engagement", variantA: 72, variantB: 61, variantC: 80 },
  { metric: "Retention", variantA: 58, variantB: 49, variantC: 63 },
  { metric: "Revenue/Lead", variantA: 48, variantB: 39, variantC: 55 },
];

const experiments = [
  {
    id: "exp-1",
    name: "Subject Line A/B/C Test",
    campaign: "Q1 Solar Homeowners",
    status: "RUNNING",
    variants: 3,
    sampleSize: 4200,
    winner: null,
    startedAt: "2024-02-01",
    metrics: { confidence: 74, pValue: 0.081 },
  },
  {
    id: "exp-2",
    name: "CTA Button Color Test",
    campaign: "Medicare Advantage Spring Push",
    status: "COMPLETED",
    variants: 2,
    sampleSize: 6800,
    winner: "Variant B",
    startedAt: "2024-01-10",
    metrics: { confidence: 97, pValue: 0.003 },
  },
  {
    id: "exp-3",
    name: "Landing Page Hero Copy",
    campaign: "Home Equity Refi Wave",
    status: "RUNNING",
    variants: 2,
    sampleSize: 3100,
    winner: null,
    startedAt: "2024-02-15",
    metrics: { confidence: 61, pValue: 0.21 },
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toLocaleString()}`;
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUSES = ["ALL", "ACTIVE", "PAUSED", "DRAFT", "COMPLETED", "ARCHIVED"];
const TYPES = ["ALL", "OUTBOUND", "INBOUND", "RETARGETING", "NURTURE"];
const VERTICALS = ["SOLAR", "INSURANCE", "MORTGAGE", "LEGAL", "AUTO", "HOME_SERVICES"];

const statusConfig: Record
  string,
  { badge: string; dot: string; label: string }
> = {
  ACTIVE: {
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
    label: "Active",
  },
  PAUSED: {
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    dot: "bg-amber-400",
    label: "Paused",
  },
  DRAFT: {
    badge: "bg-slate-600/40 text-slate-400 border-slate-600/30",
    dot: "bg-slate-400",
    label: "Draft",
  },
  COMPLETED: {
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    dot: "bg-blue-400",
    label: "Completed",
  },
  ARCHIVED: {
    badge: "bg-slate-700/40 text-slate-500 border-slate-700/30",
    dot: "bg-slate-600",
    label: "Archived",
  },
};

const typeColors: Record<string, string> = {
  OUTBOUND: "bg-violet-500/20 text-violet-300",
  INBOUND: "bg-blue-500/20 text-blue-300",
  RETARGETING: "bg-rose-500/20 text-rose-300",
  NURTURE: "bg-teal-500/20 text-teal-300",
};

const verticalColors: Record<string, string> = {
  SOLAR: "text-amber-400",
  INSURANCE: "text-blue-400",
  MORTGAGE: "text-emerald-400",
  LEGAL: "text-violet-400",
  AUTO: "text-rose-400",
  HOME_SERVICES: "text-teal-400",
};

const experimentStatusConfig: Record
  string,
  { badge: string; label: string }
> = {
  RUNNING: {
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    label: "Running",
  },
  COMPLETED: {
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    label: "Completed",
  },
  PAUSED: {
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    label: "Paused",
  },
};

// ─── Skeleton Components ─────────────────────────────────────────────────────

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-800 ${className}`} />
  );
}

function SummaryCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex items-center gap-4">
      <SkeletonBlock className="h-10 w-10 rounded-lg shrink-0" />
      <div className="space-y-2 flex-1">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-6 w-24" />
      </div>
    </div>
  );
}

function CampaignCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <SkeletonBlock className="h-5 w-52" />
          <SkeletonBlock className="h-3.5 w-72" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SkeletonBlock className="h-5 w-20 rounded" />
          <SkeletonBlock className="h-6 w-16 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1.5">
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-5 w-20" />
            <SkeletonBlock className="h-3 w-12" />
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-3 w-10" />
        </div>
        <SkeletonBlock className="h-1.5 w-full rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-3 w-40" />
        <div className="flex items-center gap-1">
          <SkeletonBlock className="h-7 w-7 rounded-md" />
          <SkeletonBlock className="h-7 w-7 rounded-md" />
          <SkeletonBlock className="h-7 w-7 rounded-md" />
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function MetricStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-white font-semibold">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Create Campaign Modal ───────────────────────────────────────────────────

interface CreateModalProps {
  onClose: () => void;
}

function CreateCampaignModal({ onClose }: CreateModalProps) {
  const createMutation = useCreateCampaign();
  const [form, setForm] = useState<CreateCampaignInput>({
    name: "",
    type: "OUTBOUND",
    status: "DRAFT",
    description: "",
    budget: 0,
    targetVertical: "",
    startDate: "",
    endDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setField<K extends keyof CreateCampaignInput>(
    key: K,
    value: CreateCampaignInput[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Campaign name is required";
    if (!form.type) next.type = "Campaign type is required";
    if (form.budget !== undefined && form.budget < 0)
      next.budget = "Budget must be 0 or greater";
    if (
      form.startDate &&
      form.endDate &&
      new Date(form.startDate) > new Date(form.endDate)
    ) {
      next.endDate = "End date must be after start date";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const payload: CreateCampaignInput = {
      ...form,
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      budget: form.budget ? Number(form.budget) : undefined,
      targetVertical: form.targetVertical || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };
    createMutation.mutate(payload, { onSuccess: onClose });
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
            Create Campaign
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Campaign Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. Q2 Solar Outreach"
              className={inputClass("name")}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Brief campaign description…"
              rows={2}
              className={`${inputClass("description")} resize-none`}
            />
          </div>

          {/* Type + Vertical */}
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
                {["OUTBOUND", "INBOUND", "RETARGETING", "NURTURE"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1.5 text-xs text-red-400">{errors.type}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Vertical
              </label>
              <select
                value={form.targetVertical}
                onChange={(e) => setField("targetVertical", e.target.value)}
                className={inputClass("targetVertical")}
              >
                <option value="">— None —</option>
                {VERTICALS.map((v) => (
                  <option key={v} value={v}>
                    {v.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Budget ($)
              </label>
              <input
                type="number"
                min={0}
                step={100}
                value={form.budget ?? ""}
                onChange={(e) =>
                  setField("budget", parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                className={inputClass("budget")}
              />
              {errors.budget && (
                <p className="mt-1.5 text-xs text-red-400">{errors.budget}</p>
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
                {["DRAFT", "ACTIVE", "PAUSED"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={form.startDate ?? ""}
                onChange={(e) => setField("startDate", e.target.value)}
                className={inputClass("startDate")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={form.endDate ?? ""}
                onChange={(e) => setField("endDate", e.target.value)}
                className={inputClass("endDate")}
              />
              {errors.endDate && (
                <p className="mt-1.5 text-xs text-red-400">{errors.endDate}</p>
              )}
            </div>
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
              <svg
                className="w-3.5 h-3.5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {createMutation.isPending ? "Creating…" : "Create Campaign"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"campaigns" | "experiments">(
    "campaigns"
  );

  const params: CampaignParams = {
    ...(statusFilter !== "ALL" && { status: statusFilter }),
    ...(typeFilter !== "ALL" && { type: typeFilter }),
  };

  const { data, isLoading, isError, error } = useCampaigns(params);
  const updateMutation = useUpdateCampaign();
  const deleteMutation = useDeleteCampaign();

  const allCampaigns: any[] = data?.campaigns ?? data?.data ?? [];

  const campaigns = search.trim()
    ? allCampaigns.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase()) ||
          c.targetVertical?.toLowerCase().includes(search.toLowerCase())
      )
    : allCampaigns;

  // ── Summary totals ──────────────────────────────────────────────────────────
  const summary = allCampaigns.reduce(
    (acc, c) => {
      const m = c.metrics ?? {};
      return {
        totalBudget: acc.totalBudget + (c.budget ?? 0),
        totalSpent: acc.totalSpent + (c.spent ?? 0),
        totalLeads: acc.totalLeads + (m.leads ?? 0),
        totalConversions: acc.totalConversions + (m.conversions ?? 0),
        totalImpressions: acc.totalImpressions + (m.impressions ?? 0),
        totalClicks: acc.totalClicks + (m.clicks ?? 0),
      };
    },
    {
      totalBudget: 0,
      totalSpent: 0,
      totalLeads: 0,
      totalConversions: 0,
      totalImpressions: 0,
      totalClicks: 0,
    }
  );

  // ── Chart data ──────────────────────────────────────────────────────────────
  const barChartData = campaigns
    .filter((c) => (c.metrics?.leads ?? 0) > 0 || (c.metrics?.conversions ?? 0) > 0)
    .map((c) => ({
      name: c.name.length > 18 ? c.name.slice(0, 16) + "…" : c.name,
      leads: c.metrics?.leads ?? 0,
      conversions: c.metrics?.conversions ?? 0,
    }));

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const hasFilters =
    search.trim() || statusFilter !== "ALL" || typeFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
  };

  const summaryCards = [
    {
      label: "Total Budget",
      value: formatCurrency(summary.totalBudget),
      sub:
        summary.totalBudget > 0
          ? `${((summary.totalSpent / summary.totalBudget) * 100).toFixed(0)}% utilized`
          : "No budget set",
      color: "violet",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Total Spent",
      value: formatCurrency(summary.totalSpent),
      sub: `${formatCurrency(summary.totalBudget - summary.totalSpent)} remaining`,
      color: "amber",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      label: "Total Leads",
      value: formatNum(summary.totalLeads),
      sub:
        summary.totalLeads > 0 && summary.totalSpent > 0
          ? `$${(summary.totalSpent / summary.totalLeads).toFixed(2)} CPL avg`
          : "No leads yet",
      color: "blue",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Conversions",
      value: formatNum(summary.totalConversions),
      sub:
        summary.totalLeads > 0
          ? `${((summary.totalConversions / summary.totalLeads) * 100).toFixed(1)}% conv. rate`
          : "No data",
      color: "emerald",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const colorMap: Record<string, string> = {
    violet: "bg-violet-500/20 text-violet-400",
    amber: "bg-amber-500/20 text-amber-400",
    blue: "bg-blue-500/20 text-blue-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <TopBar title="Campaigns" />

      <main className="flex-1 p-6 space-y-6">

        {/* ── Summary Cards ─────────────────────────────────────── */}
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
                    <p className="text-xs text-slate-500 truncate">
                      {card.label}
                    </p>
                    <p className="text-white font-semibold text-lg leading-tight">
                      {card.value}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {card.sub}
                    </p>
                  </div>
                </div>
              ))}
        </div>

        {/* ── Tabs ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 border-b border-slate-800">
          {(["campaigns", "experiments"] as const).map((tab) => (
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

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  CAMPAIGNS TAB                                         */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === "campaigns" && (
          <div className="space-y-5">
            {/* ── Toolbar ─────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search campaigns…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-lg pl-9 pr-8 py-2 text-sm outline-none focus:border-violet-500 transition-colors"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500 transition-colors"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s === "ALL" ? "All Statuses" : s}
                    </option>
                  ))}
                </select>

                {/* Type filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500 transition-colors"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === "ALL" ? "All Types" : t}
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
                    {campaigns.length} campaign
                    {campaigns.length !== 1 ? "s" : ""}
                  </span>
                )}

                {/* Create button */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Campaign
                </button>
              </div>
            </div>

            {/* ── Error ───────────────────────────────────────── */}
            {isError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
                <svg
                  className="w-8 h-8 text-red-400 mx-auto mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-400 font-medium text-sm">
                  Failed to load campaigns
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  {(error as Error)?.message ?? "An unexpected error occurred"}
                </p>
              </div>
            )}

            {/* ── Bar Chart ───────────────────────────────────── */}
            {!isLoading && !isError && barChartData.length > 0 && (
              <Card>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-white">
                      Leads vs Conversions by Campaign
                    </h2>
                    <Badge variant="violet" size="sm">
                      All time
                    </Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={barChartData} barGap={4} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="name"
                        stroke="#475569"
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#475569"
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar
                        dataKey="leads"
                        name="Leads"
                        fill="#7c3aed"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="conversions"
                        name="Conversions"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-5 mt-2 justify-end">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-violet-500 inline-block" />
                      <span className="text-xs text-slate-500">Leads</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 inline-block" />
                      <span className="text-xs text-slate-500">Conversions</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* ── Campaign Cards ──────────────────────────────── */}
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <CampaignCardSkeleton key={i} />
                ))
              ) : campaigns.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-16 text-center">
                  <svg
                    className="w-12 h-12 text-slate-700 mx-auto mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                    />
                  </svg>
                  <p className="text-slate-500 text-sm">No campaigns found</p>
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Clear filters to see all campaigns
                    </button>
                  )}
                </div>
              ) : (
                campaigns.map((campaign: any) => {
                  const isExpanded = expandedId === campaign.id;
                  const m = campaign.metrics ?? {};
                  const budget = campaign.budget ?? 0;
                  const spent = campaign.spent ?? 0;
                  const spentPct =
                    budget > 0
                      ? Math.min(100, (spent / budget) * 100)
                      : 0;
                  const style =
                    statusConfig[campaign.status] ?? statusConfig["DRAFT"];

                  return (
                    <div
                      key={campaign.id}
                      className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden"
                    >
                      {/* ── Card body ──────────────────────────── */}
                      <div className="p-5">
                        {/* Title row */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h3 className="text-white font-semibold text-base truncate">
                                {campaign.name}
                              </h3>
                              {campaign.targetVertical && (
                                <span
                                  className={`text-xs font-medium ${
                                    verticalColors[
                                      campaign.targetVertical
                                    ] ?? "text-slate-400"
                                  }`}
                                >
                                  {campaign.targetVertical.replace(/_/g, " ")}
                                </span>
                              )}
                            </div>
                            {campaign.description && (
                              <p className="text-slate-500 text-sm mt-1 line-clamp-1">
                                {campaign.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {campaign.type && (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  typeColors[campaign.type] ??
                                  "bg-slate-700 text-slate-300"
                                }`}
                              >
                                {campaign.type}
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.badge}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                              />
                              {style.label}
                            </span>
                          </div>
                        </div>

                        {/* Metrics grid */}
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <MetricStat
                            label="Budget"
                            value={formatCurrency(budget)}
                            sub={`${formatCurrency(spent)} spent`}
                          />
                          <MetricStat
                            label="Leads"
                            value={formatNum(m.leads ?? 0)}
                            sub={
                              m.cpl
                                ? `$${Number(m.cpl).toFixed(2)} CPL`
                                : undefined
                            }
                          />
                          <MetricStat
                            label="Conversions"
                            value={formatNum(m.conversions ?? 0)}
                            sub={
                              m.leads && m.conversions
                                ? `${(
                                    (m.conversions / m.leads) *
                                    100
                                  ).toFixed(1)}% rate`
                                : undefined
                            }
                          />
                          <MetricStat
                            label="Impressions"
                            value={formatNum(m.impressions ?? 0)}
                            sub={
                              m.clicks
                                ? `${formatNum(m.clicks)} clicks`
                                : undefined
                            }
                          />
                        </div>

                        {/* Budget progress */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-slate-500">
                              Budget utilization
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {spentPct.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                spentPct >= 90
                                  ? "bg-red-500"
                                  : spentPct >= 70
                                  ? "bg-amber-500"
                                  : "bg-violet-500"
                              }`}
                              style={{ width: `${spentPct}%` }}
                            />
                          </div>
                        </div>

                        {/* Footer row */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            {(campaign.startDate || campaign.endDate) && (
                              <span>
                                {formatDate(campaign.startDate)}
                                {campaign.endDate && (
                                  <> → {formatDate(campaign.endDate)}</>
                                )}
                              </span>
                            )}
                            {m.cpa != null && (
                              <span>
                                CPA:{" "}
                                <span className="text-white font-medium">
                                  ${Number(m.cpa).toFixed(2)}
                                </span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Pause / Resume */}
                            {(campaign.status === "ACTIVE" ||
                              campaign.status === "PAUSED") && (
                              <button
                                onClick={() =>
                                  updateMutation.mutate({
                                    id: campaign.id,
                                    status:
                                      campaign.status === "ACTIVE"
                                        ? "PAUSED"
                                        : "ACTIVE",
                                  })
                                }
                                disabled={updateMutation.isPending}
                                title={
                                  campaign.status === "ACTIVE"
                                    ? "Pause campaign"
                                    : "Resume campaign"
                                }
                                className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors disabled:opacity-40"
                              >
                                {campaign.status === "ACTIVE" ? (
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Delete "${campaign.name}"? This cannot be undone.`
                                  )
                                ) {
                                  deleteMutation.mutate(campaign.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              title="Delete campaign"
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-40"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>

                            {/* Expand */}
                            <button
                              onClick={() => toggleExpand(campaign.id)}
                              title={
                                isExpanded ? "Collapse" : "Expand details"
                              }
                              className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md transition-colors ml-1"
                            >
                              <svg
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* ── Expanded panel ─────────────────────── */}
                      {isExpanded && (
                        <div className="border-t border-slate-800 bg-slate-950/60 p-5">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {/* Performance breakdown */}
                            <div>
                              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                Performance
                              </h4>
                              <div className="space-y-2.5">
                                {[
                                  {
                                    label: "Clicks",
                                    value: formatNum(m.clicks ?? 0),
                                  },
                                  {
                                    label: "CTR",
                                    value:
                                      m.impressions && m.clicks
                                        ? `${(
                                            (m.clicks / m.impressions) *
                                            100
                                          ).toFixed(2)}%`
                                        : "—",
                                  },
                                  {
                                    label: "Cost per Lead",
                                    value: m.cpl
                                      ? `$${Number(m.cpl).toFixed(2)}`
                                      : "—",
                                  },
                                  {
                                    label: "Cost per Acquisition",
                                    value: m.cpa
                                      ? `$${Number(m.cpa).toFixed(2)}`
                                      : "—",
                                  },
                                ].map(({ label, value }) => (
                                  <div
                                    key={label}
                                    className="flex items-center justify-between"
                                  >
                                    <span className="text-xs text-slate-500">
                                      {label}
                                    </span>
                                    <span className="text-xs text-white font-medium font-mono">
                                      {value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Budget breakdown */}
                            <div>
                              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                Budget
                              </h4>
                              <div className="space-y-2.5">
                                {[
                                  {
                                    label: "Allocated",
                                    value: formatCurrency(budget),
                                  },
                                  {
                                    label: "Spent",
                                    value: formatCurrency(spent),
                                  },
                                  {
                                    label: "Remaining",
                                    value: formatCurrency(
                                      Math.max(0, budget - spent)
                                    ),
                                  },
                                  {
                                    label: "Utilization",
                                    value: `${spentPct.toFixed(1)}%`,
                                  },
                                ].map(({ label, value }) => (
                                  <div
                                    key={label}
                                    className="flex items-center justify-between"
                                  >
                                    <span className="text-xs text-slate-500">
                                      {label}
                                    </span>
                                    <span className="text-xs text-white font-medium font-mono">
                                      {value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Status controls */}
                            <div>
                              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                Change Status
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {(
                                  [
                                    "ACTIVE",
                                    "PAUSED",
                                    "COMPLETED",
                                    "ARCHIVED",
                                  ] as const
                                ).map((s) => {
                                  const isCurrent = campaign.status === s;
                                  return (
                                    <button
                                      key={s}
                                      onClick={() =>
                                        !isCurrent &&
                                        updateMutation.mutate({
                                          id: campaign.id,
                                          status: s,
                                        })
                                      }
                                      disabled={
                                        updateMutation.isPending || isCurrent
                                      }
                                      className={`px-3 py-2 text-xs rounded-lg border transition-colors disabled:cursor-not-allowed ${
                                        isCurrent
                                          ? "bg-violet-600 border-violet-500 text-white"
                                          : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white disabled:opacity-40"
                                      }`}
                                    >
                                      {s}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  EXPERIMENTS TAB                                       */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === "experiments" && (
          <div className="space-y-5">
            {/* Radar chart */}
            <Card>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Variant Performance Radar
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Comparing A/B/C variants across key performance dimensions
                    </p>
                  </div>
                  <Badge variant="blue" size="sm">
                    Live
                  </Badge>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: "#64748b", fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      tick={{ fill: "#475569", fontSize: 10 }}
                      axisLine={false}
                    />
                    <Radar
                      name="Variant A"
                      dataKey="variantA"
                      stroke="#7c3aed"
                      fill="#7c3aed"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Variant B"
                      dataKey="variantB"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Variant C"
                      dataKey="variantC"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
                    />
                    <Tooltip content={<ChartTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Experiment cards */}
            <div className="space-y-3">
              {experiments.map((exp) => {
                const expStatus =
                  experimentStatusConfig[exp.status] ??
                  experimentStatusConfig["PAUSED"];
                const confidenceColor =
                  exp.metrics.confidence >= 95
                    ? "text-emerald-400"
                    : exp.metrics.confidence >= 80
                    ? "text-amber-400"
                    : "text-slate-400";

                return (
                  <div
                    key={exp.id}
                    className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-white font-semibold">
                            {exp.name}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${expStatus.badge}`}
                          >
                            {expStatus.label}
                          </span>
                        </div>
                        <p className="text-slate-500 text-sm mt-1">
                          {exp.campaign}
                        </p>
                      </div>

                      {exp.winner && (
                        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <svg
                            className="w-3.5 h-3.5 text-emerald-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-xs text-emerald-400 font-medium">
                            {exp.winner}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                          Variants
                        </p>
                        <p className="text-white font-semibold">
                          {exp.variants}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                          Sample Size
                        </p>
                        <p className="text-white font-semibold">
                          {exp.sampleSize.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                          Confidence
                        </p>
                        <p className={`font-semibold ${confidenceColor}`}>
                          {exp.metrics.confidence}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                          P-Value
                        </p>
                        <p className="text-white font-semibold font-mono">
                          {exp.metrics.pValue.toFixed(3)}
                        </p>
                      </div>
                    </div>

                    {/* Confidence bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-500">
                          Statistical confidence
                        </span>
                        <span className="text-xs text-slate-500">
                          95% threshold
                        </span>
                      </div>
                      <div className="relative h-1.5 w-full rounded-full bg-slate-800 overflow-visible">
                        {/* Threshold marker */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-3 w-0.5 bg-slate-500 rounded-full z-10"
                          style={{ left: "95%" }}
                        />
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            exp.metrics.confidence >= 95
                              ? "bg-emerald-500"
                              : exp.metrics.confidence >= 80
                              ? "bg-amber-500"
                              : "bg-slate-600"
                          }`}
                          style={{
                            width: `${exp.metrics.confidence}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        Started {formatDate(exp.startedAt)}
                      </p>
                      {exp.status === "RUNNING" && (
                        <span className="flex items-center gap-1.5 text-xs text-blue-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                          Collecting data
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ── Create Campaign Modal ──────────────────────────────── */}
      {showCreateModal && (
        <CreateCampaignModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

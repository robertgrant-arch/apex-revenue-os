"use client";

import { useState, useMemo } from "react";
import Card from "@/components/ui/Card";
import { ChartTooltip } from "@/components/ui/ChartTooltip";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

type AdType = "image" | "email" | "video";
type Status = "active" | "paused" | "draft";
type Vertical = "Medicare" | "Auto" | "Life" | "Home";

interface Creative {
  id: string;
  vertical: Vertical;
  type: AdType;
  headline: string;
  body: string;
  cta: string;
  imageDescription: string;
  predictedCTR: number;
  actualCTR: number | null;
  impressions: number;
  clicks: number;
  status: Status;
  createdAt: string;
  generated?: boolean;
}

const MOCK_CREATIVES: Creative[] = [
  {
    id: "c-001", vertical: "Medicare", type: "image",
    headline: "Your Medicare Benefits May Have Changed",
    body: "Millions of seniors are missing out on extra benefits. Compare plans in your area and see what you qualify for.",
    cta: "Check My Benefits", imageDescription: "Smiling senior couple reviewing documents",
    predictedCTR: 4.2, actualCTR: 3.9, impressions: 142000, clicks: 5538, status: "active", createdAt: "2025-03-01T10:00:00Z",
  },
  {
    id: "c-002", vertical: "Auto", type: "email",
    headline: "Cut Your Car Insurance Bill in Half",
    body: "Drivers who compare rates save an average of $847/year. It takes less than 2 minutes.",
    cta: "Get My Quote", imageDescription: "Bright red car on open highway at sunset",
    predictedCTR: 3.8, actualCTR: 4.1, impressions: 98000, clicks: 4018, status: "active", createdAt: "2025-03-05T12:00:00Z",
  },
  {
    id: "c-003", vertical: "Life", type: "video",
    headline: "Protect Your Family for Less Than $1/Day",
    body: "Term life insurance is more affordable than you think. Lock in your rate today.",
    cta: "See My Rate", imageDescription: "Young family playing in backyard, golden hour",
    predictedCTR: 5.1, actualCTR: 4.7, impressions: 220000, clicks: 10340, status: "active", createdAt: "2025-02-20T09:00:00Z",
  },
  {
    id: "c-004", vertical: "Home", type: "image",
    headline: "Is Your Home Underinsured?",
    body: "Most homeowners are paying too much for too little coverage. Compare top-rated insurers in 60 seconds.",
    cta: "Compare Now", imageDescription: "Suburban home with manicured lawn",
    predictedCTR: 3.5, actualCTR: 3.2, impressions: 76000, clicks: 2432, status: "paused", createdAt: "2025-02-28T14:00:00Z",
  },
  {
    id: "c-005", vertical: "Medicare", type: "video",
    headline: "New Medicare Plans for 2025 Are Here",
    body: "Enrollment is open. See if you qualify for $0 premium plans with dental, vision, and hearing.",
    cta: "View 2025 Plans", imageDescription: "Friendly agent talking with senior couple",
    predictedCTR: 4.8, actualCTR: null, impressions: 0, clicks: 0, status: "draft", createdAt: "2025-03-10T08:00:00Z",
  },
  {
    id: "c-006", vertical: "Auto", type: "image",
    headline: "Your Zip Code Qualifies for Lower Rates",
    body: "Recent data shows drivers in your area are overpaying for auto insurance. Compare 40+ carriers.",
    cta: "Find Lower Rates", imageDescription: "Car keys on wooden desk next to smartphone",
    predictedCTR: 3.9, actualCTR: 4.3, impressions: 54000, clicks: 2322, status: "active", createdAt: "2025-03-08T11:00:00Z",
  },
];

const VERTICALS: Vertical[] = ["Medicare", "Auto", "Life", "Home"];
const AD_TYPES: AdType[] = ["image", "email", "video"];
const STATUSES: Status[] = ["active", "paused", "draft"];

const TYPE_COLORS: Record<AdType, string> = {
  image: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  email: "bg-violet-500/20 text-violet-400 border border-violet-500/30",
  video: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
};

const STATUS_COLORS: Record<Status, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  paused: "bg-amber-500/20 text-amber-400",
  draft: "bg-slate-500/20 text-slate-400",
};

const VERTICAL_COLORS: Record<Vertical, string> = {
  Medicare: "text-blue-400",
  Auto: "text-emerald-400",
  Life: "text-violet-400",
  Home: "text-amber-400",
};

function fmt(n: number): string {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);
}

function GenerateModal({ onClose, onGenerated }: { onClose: () => void; onGenerated: (c: Creative) => void }) {
  const [vertical, setVertical] = useState<Vertical>("Medicare");
  const [type, setType] = useState<AdType>("image");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vertical, type, prompt: prompt || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      onGenerated(data as Creative);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Generate Creative</h3>
            <p className="text-sm text-slate-400 mt-0.5">AI-powered ad copy for insurance verticals</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">Vertical</label>
          <select value={vertical} onChange={e => setVertical(e.target.value as Vertical)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
            {VERTICALS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">Ad Type</label>
          <div className="grid grid-cols-3 gap-2">
            {AD_TYPES.map(t => (
              <button key={t} onClick={() => setType(t)} className={cn("py-2.5 rounded-lg text-sm font-medium capitalize flex items-center justify-center gap-1.5 transition-all border", type === t ? "bg-emerald-600 border-emerald-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white")}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Additional Context <span className="text-slate-500 font-normal">(optional)</span></label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="E.g. Focus on seniors aged 65-75, emphasize dental benefits..." rows={3} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none" />
        </div>

        {error && <div className="mb-4 px-3 py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-sm font-medium transition-colors">Cancel</button>
          <button onClick={handleGenerate} disabled={loading} className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreativeCard({ creative }: { creative: Creative }) {
  const ctrDelta = creative.actualCTR !== null ? creative.actualCTR - creative.predictedCTR : null;
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex flex-col gap-4 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={cn("text-xs font-medium", VERTICAL_COLORS[creative.vertical])}>{creative.vertical}</span>
            <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium", TYPE_COLORS[creative.type])}>{creative.type}</span>
            {creative.generated && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 font-medium">AI</span>}
          </div>
          <p className="text-sm font-semibold text-white leading-snug line-clamp-2">{creative.headline}</p>
        </div>
        <span className={cn("shrink-0 text-xs px-2 py-1 rounded-md font-medium capitalize", STATUS_COLORS[creative.status])}>{creative.status}</span>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{creative.body}</p>
      <div className="inline-flex items-center gap-1.5">
        <span className="text-xs text-slate-500">CTA:</span>
        <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">{creative.cta}</span>
      </div>
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-700/50">
        <div><div className="text-xs text-slate-500 mb-0.5">Impressions</div><div className="text-sm font-semibold text-white">{fmt(creative.impressions)}</div></div>
        <div><div className="text-xs text-slate-500 mb-0.5">Predicted CTR</div><div className="text-sm font-semibold text-violet-400">{creative.predictedCTR.toFixed(1)}%</div></div>
        <div><div className="text-xs text-slate-500 mb-0.5">Actual CTR</div>
          {creative.actualCTR !== null ? (
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-emerald-400">{creative.actualCTR.toFixed(1)}%</span>
              {ctrDelta !== null && <span className={cn("text-xs", ctrDelta >= 0 ? "text-emerald-500" : "text-red-400")}>{ctrDelta >= 0 ? "+" : ""}{ctrDelta.toFixed(1)}</span>}
            </div>
          ) : <span className="text-sm text-slate-600">&mdash;</span>}
        </div>
      </div>
    </div>
  );
}

export default function CreativePage() {
  const [creatives, setCreatives] = useState<Creative[]>(MOCK_CREATIVES);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AdType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [verticalFilter, setVerticalFilter] = useState<Vertical | "all">("all");
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    return creatives.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.headline.toLowerCase().includes(q) || c.body.toLowerCase().includes(q) || c.vertical.toLowerCase().includes(q);
      const matchType = typeFilter === "all" || c.type === typeFilter;
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const matchVertical = verticalFilter === "all" || c.vertical === verticalFilter;
      return matchSearch && matchType && matchStatus && matchVertical;
    });
  }, [creatives, search, typeFilter, statusFilter, verticalFilter]);

  const chartData = useMemo(() => {
    return filtered.filter(c => c.actualCTR !== null).slice(0, 8).map(c => ({
      name: c.headline.length > 20 ? c.headline.slice(0, 20) + "..." : c.headline,
      predicted: c.predictedCTR,
      actual: c.actualCTR,
    }));
  }, [filtered]);

  const stats = useMemo(() => {
    const active = creatives.filter(c => c.status === "active");
    const totalImpressions = active.reduce((s, c) => s + c.impressions, 0);
    const totalClicks = active.reduce((s, c) => s + c.clicks, 0);
    const avgPredicted = creatives.reduce((s, c) => s + c.predictedCTR, 0) / creatives.length;
    const withActual = creatives.filter(c => c.actualCTR !== null);
    const avgActual = withActual.reduce((s, c) => s + (c.actualCTR ?? 0), 0) / (withActual.length || 1);
    return { totalImpressions, totalClicks, avgPredicted, avgActual };
  }, [creatives]);

  function handleGenerated(c: Creative) {
    setCreatives(prev => [c, ...prev]);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">Creative Studio</h1>
            <p className="text-slate-400 text-sm mt-1">Manage and generate AI-powered ad creatives across insurance verticals</p>
          </div>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-emerald-900/30">
            Generate Creative
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Impressions", value: fmt(stats.totalImpressions), color: "text-blue-400" },
            { label: "Total Clicks", value: fmt(stats.totalClicks), color: "text-emerald-400" },
            { label: "Avg Predicted CTR", value: `${stats.avgPredicted.toFixed(2)}%`, color: "text-violet-400" },
            { label: "Avg Actual CTR", value: `${stats.avgActual.toFixed(2)}%`, color: "text-amber-400" },
          ].map(s => (
            <Card key={s.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-3">{s.label}</div>
              <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
            </Card>
          ))}
        </div>

        {/* CTR Chart */}
        {chartData.length > 0 && (
          <Card className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Predicted vs Actual CTR</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 4, right: 16, left: -8, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8", paddingTop: 12 }} />
                <Bar dataKey="predicted" name="Predicted CTR" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual CTR" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Search creatives..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          <select value={verticalFilter} onChange={e => setVerticalFilter(e.target.value as Vertical | "all")} className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm">
            <option value="all">All Verticals</option>
            {VERTICALS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as AdType | "all")} className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm">
            <option value="all">All Types</option>
            {AD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as Status | "all")} className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm">
            <option value="all">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Creative Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => <CreativeCard key={c.id} creative={c} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm">No creatives match your filters.</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <GenerateModal onClose={() => setShowModal(false)} onGenerated={handleGenerated} />
        )}
      </div>
    </div>
  );
}
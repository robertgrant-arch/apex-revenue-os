"use client";

import { useState } from "react";
import {
  Sparkles,
  Download,
  Layers,
  Activity,
  TrendingUp,
  Shield,
  Brush,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Play,
  Image,
  Film,
  Mail,
  LayoutGrid,
  Search as SearchIcon,
  MoreHorizontal,
  GitBranch,
  BarChart2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TopBar } from "@/components/layout/TopBar";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ChartTooltip } from "@/components/ui/ChartTooltip";
import { creatives } from "@/lib/data";
import type { ComplianceStatus, CreativeStatus } from "@/lib/data";

const complianceBadge: Record<ComplianceStatus, "emerald" | "amber" | "red"> = {
  approved: "emerald",
  pending:  "amber",
  flagged:  "red",
  rejected: "red",
};

const statusBadge: Record<CreativeStatus, "emerald" | "blue" | "amber" | "red" | "slate"> = {
  live:    "emerald",
  testing: "blue",
  review:  "amber",
  blocked: "red",
  draft:   "slate",
};

const typeIconMap: Record<string, React.ElementType> = {
  "Facebook Static": Image,
  "Carousel Ad":     LayoutGrid,
  "Video Ad":        Film,
  "Email":           Mail,
  "Search Ad":       SearchIcon,
  "Display Ad":      Image,
};

const ctrData = creatives
  .filter((c) => c.actual_ctr !== null)
  .map((c) => ({
    name: c.name.split(" ").slice(0, 3).join(" "),
    predicted: c.predicted_ctr,
    actual:    c.actual_ctr ?? 0,
  }));

export default function CreativePage() {
  const [filter, setFilter]       = useState<string>("All");
  const [vertical, setVertical]   = useState<string>("All");
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<number | null>(null);

  const filterTabs  = ["All", "live", "testing", "review", "blocked", "draft"];
  const verticals   = ["All", ...Array.from(new Set(creatives.map((c) => c.vertical)))];

  const filtered = creatives.filter((c) => {
    const matchFilter   = filter === "All"   || c.status   === filter;
    const matchVertical = vertical === "All" || c.vertical === vertical;
    const matchSearch   = search === ""      ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchVertical && matchSearch;
  });

  const selectedCreative = selected !== null
    ? creatives.find((c) => c.id === selected)
    : null;

  return (
    <>
      <TopBar
        title="Creative Studio"
        subtitle={`${creatives.filter((c) => c.status === "live").length} live · ${creatives.filter((c) => c.compliance === "flagged").length} flagged`}
      />
      <div className="p-6 space-y-6">

        {/* ── Actions ── */}
        <div className="flex flex-wrap items-center gap-2">
          <button className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors">
            <Sparkles size={14} />
            Generate Creative
          </button>
          <button className="border border-slate-700 text-slate-300 text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 hover:border-slate-500 transition-colors">
            <Download size={14} />
            Export to Figma
          </button>
          <button className="border border-slate-700 text-slate-300 text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 hover:border-slate-500 transition-colors">
            <GitBranch size={14} />
            New A/B Pair
          </button>
        </div>

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Assets"
            value="248"
            icon={Layers}
            color="#ec4899"
          />
          <MetricCard
            label="Live Variants"
            value="34"
            sub="12 in A/B test"
            icon={Activity}
            color="#10b981"
          />
          <MetricCard
            label="Avg Predicted CTR"
            value="3.9%"
            sub="+0.4% vs baseline"
            trend="up"
            icon={TrendingUp}
            color="#6366f1"
          />
          <MetricCard
            label="Compliance Rate"
            value="91%"
            sub="2 assets flagged"
            icon={Shield}
            color="#f59e0b"
          />
        </div>

        {/* ── CTR comparison chart ── */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Predicted vs Actual CTR (Live Assets)
            </h3>
            <div className="flex gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                Predicted
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Actual
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={ctrData}
              barGap={3}
              margin={{ top: 4, right: 4, bottom: 0, left: -10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="predicted"
                name="Predicted CTR"
                fill="#8b5cf6"
                radius={[3, 3, 0, 0]}
                barSize={16}
              />
              <Bar
                dataKey="actual"
                name="Actual CTR"
                fill="#10b981"
                radius={[3, 3, 0, 0]}
                barSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Filter row ── */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1.5 flex-wrap">
            {filterTabs.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
                  filter === f
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
                }`}
              >
                {f}{" "}
                <span className="opacity-60">
                  ({f === "All" ? creatives.length : creatives.filter((c) => c.status === f).length})
                </span>
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <SearchIcon size={12} className="absolute left-2.5 top-2.5 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg pl-7 pr-3 py-2 w-36 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <select
              value={vertical}
              onChange={(e) => setVertical(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
            >
              {verticals.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Creative Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((c) => {
            const TypeIcon = typeIconMap[c.type] ?? Brush;
            const isSelected = selected === c.id;
            return (
              <Card
                key={c.id}
                className={`p-4 transition-all ${
                  isSelected ? "ring-2 ring-emerald-500/50 border-emerald-500/40" : "hover:border-slate-600"
                }`}
                hoverable
                onClick={() => setSelected(isSelected ? null : c.id)}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-slate-900 rounded-lg mb-3 flex flex-col items-center justify-center border border-slate-800 relative overflow-hidden">
                  {/* Decorative background for visual interest */}
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${
                        c.vertical === "Medicare"      ? "#3b82f6" :
                        c.vertical === "Legal"         ? "#8b5cf6" :
                        c.vertical === "Auto"          ? "#f59e0b" :
                        c.vertical === "Home Services" ? "#10b981" : "#6366f1"
                      }, transparent 60%)`,
                    }}
                  />
                  <TypeIcon size={24} className="text-slate-600 mb-1.5 relative z-10" />
                  <div className="text-xs text-slate-600 relative z-10">{c.type}</div>
                  {c.actual_ctr !== null && (
                    <div className="absolute bottom-2 right-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-medium">
                      CTR {c.actual_ctr}% live
                    </div>
                  )}
                  {c.impressions > 0 && (
                    <div className="absolute bottom-2 left-2 text-[10px] text-slate-600">
                      {(c.impressions / 1000).toFixed(0)}k imp.
                    </div>
                  )}
                  {c.status === "live" && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse inline-block" />
                      Live
                    </div>
                  )}
                </div>

                {/* Name + compliance */}
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="text-sm font-medium text-white leading-tight line-clamp-2">
                    {c.name}
                  </div>
                  <Badge color={complianceBadge[c.compliance]}>
                    {c.compliance}
                  </Badge>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge color={statusBadge[c.status]}>{c.status}</Badge>
                  <Badge color="slate">{c.vertical}</Badge>
                  {c.variant_of !== null && (
                    <Badge color="purple">
                      <GitBranch size={9} className="mr-0.5" />
                      Variant
                    </Badge>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-slate-900 rounded-lg p-2 text-center">
                    <div className="text-xs text-slate-500">Pred. CTR</div>
                    <div className="text-sm font-bold text-white">
                      {c.predicted_ctr}%
                    </div>
                    {c.actual_ctr !== null && (
                      <div
                        className={`text-[10px] ${
                          c.actual_ctr >= c.predicted_ctr
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        Act. {c.actual_ctr}%
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-900 rounded-lg p-2 text-center">
                    <div className="text-xs text-slate-500">Pred. CPA</div>
                    <div className="text-sm font-bold text-white">
                      ${c.predicted_cpa}
                    </div>
                  </div>
                </div>

                {/* Created */}
                <div className="text-[10px] text-slate-600 mb-2 text-center">
                  Created {c.created}
                  {c.impressions > 0 &&
                    ` · ${c.impressions.toLocaleString()} impressions`}
                </div>

                {/* Status note */}
                <div className="mb-3">
                  {c.compliance === "flagged" && (
                    <div className="flex items-start gap-1 text-xs text-red-400">
                      <AlertTriangle size={10} className="mt-0.5 shrink-0" />
                      Compliance flags block launch
                    </div>
                  )}
                  {c.compliance === "pending" && (
                    <div className="flex items-start gap-1 text-xs text-amber-400">
                      <Clock size={10} className="mt-0.5 shrink-0" />
                      Awaiting compliance review
                    </div>
                  )}
                  {c.compliance === "approved" && c.status === "live" && (
                    <div className="flex items-start gap-1 text-xs text-emerald-400">
                      <CheckCircle2 size={10} className="mt-0.5 shrink-0" />
                      Approved and serving
                    </div>
                  )}
                  {c.compliance === "approved" && c.status === "testing" && (
                    <div className="flex items-start gap-1 text-xs text-blue-400">
                      <BarChart2 size={10} className="mt-0.5 shrink-0" />
                      In A/B test — collecting data
                    </div>
                  )}
                  {c.status === "blocked" && (
                    <div className="flex items-start gap-1 text-xs text-red-400">
                      <XCircle size={10} className="mt-0.5 shrink-0" />
                      Blocked until flags resolved
                    </div>
                  )}
                </div>

                {/* Action button */}
                <button
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                    c.status === "blocked" || c.compliance === "flagged"
                      ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                      : c.status === "review" || c.compliance === "pending"
                      ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                      : c.status === "testing"
                      ? "border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                      : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
                  }`}
                >
                  {c.status === "blocked" || c.compliance === "flagged" ? (
                    <><AlertTriangle size={11} />Fix Compliance</>
                  ) : c.status === "review" ? (
                    <><Play size={11} />Review Creative</>
                  ) : c.status === "testing" ? (
                    <><BarChart2 size={11} />View Test Results</>
                  ) : (
                    <><MoreHorizontal size={11} />View Details</>
                  )}
                </button>

                {/* Expanded detail panel */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Asset Details
                    </div>
                    {[
                      ["Type",           c.type],
                      ["Vertical",       c.vertical],
                      ["Created",        c.created],
                      ["Compliance",     c.compliance],
                      ["Impressions",    c.impressions > 0 ? c.impressions.toLocaleString() : "Not yet live"],
                      ["A/B Pair",       c.variant_of !== null ? `Variant of asset #${c.variant_of}` : "Control / standalone"],
                    ].map(([k, v]) => (
                      <div key={String(k)} className="flex justify-between text-xs">
                        <span className="text-slate-500">{k}</span>
                        <span className="text-white font-medium capitalize">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full text-center text-slate-500 text-sm py-16">
              No creative assets match your filters.
            </div>
          )}
        </div>

      </div>
    </>
  );
}

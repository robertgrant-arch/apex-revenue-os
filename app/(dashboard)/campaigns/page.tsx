"use client";

import { useState } from "react";
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
import {
  Plus,
  Filter,
  Play,
  Pause,
  MoreHorizontal,
  FlaskConical,
  Megaphone,
  DollarSign,
  TrendingUp,
  BarChart2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusDot } from "@/components/ui/StatusDot";
import { ChartTooltip } from "@/components/ui/ChartTooltip";
import { campaigns, experiments } from "@/lib/data";

const spendData = campaigns
  .filter((c) => c.spend > 0)
  .map((c) => ({
    name: c.name.split(" ").slice(0, 2).join(" "),
    spend: Math.round(c.spend / 1000),
    pipeline: Math.round(c.pipeline / 1000),
    roas: c.roas,
  }));

const ROAS_COLORS: Record<string, string> = {
  "Medicare Advantage": "#6366f1",
  "Auto Insurance":     "#f59e0b",
  "Personal Injury":    "#8b5cf6",
  "HVAC Summer":        "#10b981",
};

export default function CampaignsPage() {
  const [expandedCampaign, setExpandedCampaign] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const statuses = ["all", "active", "paused", "draft"];
  const filtered =
    statusFilter === "all"
      ? campaigns
      : campaigns.filter((c) => c.status === statusFilter);

  return (
    <>
      <TopBar
        title="Campaigns & Experiments"
        subtitle={`${campaigns.filter((c) => c.status === "active").length} active · ${experiments.filter((e) => e.status === "running").length} experiments running`}
      />
      <div className="p-6 space-y-6">

        {/* ── Actions ── */}
        <div className="flex flex-wrap items-center gap-2">
          <button className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors">
            <Plus size={14} />
            New Campaign
          </button>
          <button className="border border-slate-700 text-slate-300 text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 hover:border-slate-500 transition-colors">
            <FlaskConical size={14} />
            New Experiment
          </button>
          <button className="border border-slate-700 text-slate-300 text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 hover:border-slate-500 transition-colors">
            <Filter size={14} />
            Filter
          </button>
        </div>

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            label="Active Campaigns"
            value="4"
            icon={Megaphone}
            color="#10b981"
          />
          <MetricCard
            label="Experiments Running"
            value="12"
            sub="3 near significance"
            icon={FlaskConical}
            color="#8b5cf6"
          />
          <MetricCard
            label="Total Ad Spend"
            value="$120.6K"
            sub="+18% MoM"
            trend="up"
            icon={DollarSign}
            color="#f59e0b"
          />
          <MetricCard
            label="Total Pipeline"
            value="$986K"
            sub="+31% MoM"
            trend="up"
            icon={TrendingUp}
            color="#3b82f6"
          />
          <MetricCard
            label="Blended ROAS"
            value="6.9x"
            sub="+0.8x MoM"
            trend="up"
            icon={BarChart2}
            color="#ec4899"
          />
        </div>

        {/* ── Spend vs Pipeline Chart ── */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Spend vs Pipeline by Campaign ($k)
            </h3>
            <div className="flex gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                Spend ($k)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Pipeline ($k)
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={spendData}
              barGap={4}
              margin={{ top: 4, right: 4, bottom: 0, left: -10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="spend"
                name="Spend ($k)"
                fill="#6366f1"
                radius={[3, 3, 0, 0]}
                barSize={22}
              />
              <Bar
                dataKey="pipeline"
                name="Pipeline ($k)"
                fill="#10b981"
                radius={[3, 3, 0, 0]}
                barSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Campaign List ── */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">All Campaigns</h3>
            <div className="flex gap-1.5">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium capitalize transition-colors ${
                    statusFilter === s
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((c) => {
              const isExpanded = expandedCampaign === c.id;
              return (
                <div
                  key={c.id}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors"
                >
                  {/* Header row */}
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer"
                    onClick={() =>
                      setExpandedCampaign(isExpanded ? null : c.id)
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white truncate">
                          {c.name}
                        </span>
                        <Badge
                          color={
                            c.vertical === "Medicare"
                              ? "blue"
                              : c.vertical === "Legal"
                              ? "purple"
                              : c.vertical === "Home Services"
                              ? "slate"
                              : "amber"
                          }
                        >
                          {c.vertical}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs">
                          <StatusDot status={c.status} />
                          <span className="text-slate-400 capitalize">
                            {c.status}
                          </span>
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {c.experiments} experiments ·{" "}
                        {c.status !== "draft"
                          ? `${c.leads} leads · ${c.appts} appointments`
                          : "Not yet launched"}
                      </div>
                    </div>

                    {c.status !== "draft" && (
                      <div className="hidden sm:flex items-center gap-4 text-xs shrink-0">
                        <div className="text-right">
                          <div className="text-slate-500">Spend</div>
                          <div className="text-white font-medium">
                            ${c.spend.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-500">Pipeline</div>
                          <div className="text-emerald-400 font-semibold">
                            ${c.pipeline.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-500">ROAS</div>
                          <div className="text-white font-bold">{c.roas}x</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                      >
                        <Play size={13} />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                      >
                        <Pause size={13} />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                      >
                        <MoreHorizontal size={13} />
                      </button>
                      {isExpanded ? (
                        <ChevronUp size={14} className="text-slate-500" />
                      ) : (
                        <ChevronDown size={14} className="text-slate-500" />
                      )}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && c.status !== "draft" && (
                    <div className="px-4 pb-4 border-t border-slate-800">
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
                        {[
                          ["Total Spend",    `$${c.spend.toLocaleString()}`,    "#6366f1"],
                          ["Pipeline",       `$${c.pipeline.toLocaleString()}`, "#10b981"],
                          ["ROAS",           `${c.roas}x`,                      "#f59e0b"],
                          ["Leads",          String(c.leads),                   "#3b82f6"],
                          ["Appointments",   String(c.appts),                   "#ec4899"],
                          ["CPL",            `$${c.cpl}`,                       "#06b6d4"],
                        ].map(([label, value, color]) => (
                          <div
                            key={label}
                            className="bg-slate-950 rounded-lg p-3 text-center border border-slate-800"
                          >
                            <div className="text-xs text-slate-500 mb-1">
                              {label}
                            </div>
                            <div
                              className="text-base font-bold"
                              style={{ color }}
                            >
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition-colors">
                          View Experiments ({c.experiments})
                        </button>
                        <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors">
                          Edit Campaign
                        </button>
                        <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors">
                          View Leads
                        </button>
                        <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors">
                          Export Report
                        </button>
                      </div>
                    </div>
                  )}
                  {isExpanded && c.status === "draft" && (
                    <div className="px-4 pb-4 border-t border-slate-800 pt-3">
                      <p className="text-xs text-slate-500 italic mb-3">
                        This campaign hasn&apos;t launched yet. Configure the
                        settings below to activate it.
                      </p>
                      <button className="text-xs bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Configure & Launch →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── Experiments ── */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Experiment Cards
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {experiments.filter((e) => e.status === "running").length}{" "}
                running ·{" "}
                {experiments.filter((e) => e.status === "completed").length}{" "}
                completed
              </span>
              <button className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors border border-emerald-500/30">
                <Plus size={12} />
                New
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experiments.map((e) => (
              <div
                key={e.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors"
              >
                {/* Meta */}
                <div className="flex items-start justify-between mb-2">
                  <div className="text-xs text-slate-500">{e.campaign}</div>
                  <div className="flex items-center gap-2">
                    <Badge
                      color={
                        e.status === "completed"
                          ? "emerald"
                          : e.status === "running"
                          ? "blue"
                          : "amber"
                      }
                    >
                      {e.status === "running" && (
                        <span className="mr-1 inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      )}
                      {e.status}
                    </Badge>
                  </div>
                </div>

                {/* Hypothesis */}
                <div className="text-sm font-medium text-white mb-1 leading-snug">
                  H: {e.hypothesis}
                </div>
                <div className="text-xs text-slate-400 mb-3">
                  Variable:{" "}
                  <span className="text-slate-300">{e.variable}</span>
                </div>

                {/* Lift comparison */}
                <div className="flex gap-3 mb-3">
                  {(["Control", "Variant"] as const).map((v, i) => {
                    const isWinner =
                      e.winner === (i === 0 ? "Variant A" : "Variant B");
                    return (
                      <div
                        key={v}
                        className={`flex-1 p-2.5 rounded-lg text-center border transition-colors ${
                          isWinner
                            ? "border-emerald-500/40 bg-emerald-500/10"
                            : "border-slate-700 bg-slate-800/50"
                        }`}
                      >
                        <div className="text-xs text-slate-400 mb-0.5">{v}</div>
                        <div className="text-base font-bold text-white">
                          {e.lifts[i].toFixed(2)}x
                        </div>
                        {isWinner && (
                          <div className="text-xs text-emerald-400 font-semibold mt-0.5 flex items-center justify-center gap-1">
                            <CheckCircle2 size={10} />
                            Winner
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Significance bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Statistical significance</span>
                    <span
                      className={`font-semibold ${
                        e.significance >= 95
                          ? "text-emerald-400"
                          : e.significance >= 80
                          ? "text-amber-400"
                          : "text-slate-400"
                      }`}
                    >
                      {e.significance}%
                      {e.significance >= 95
                        ? " ✓ Significant"
                        : e.significance >= 80
                        ? " — Near"
                        : " — Collecting data"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${e.significance}%`,
                        background:
                          e.significance >= 95
                            ? "#10b981"
                            : e.significance >= 80
                            ? "#f59e0b"
                            : "#6366f1",
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>0%</span>
                    <span className="text-slate-500">95% threshold</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Status note */}
                <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                  {e.status === "completed" && e.winner ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={10} />
                      {e.winner} selected — rolling out
                    </span>
                  ) : e.status === "running" ? (
                    <span className="text-blue-400 flex items-center gap-1">
                      <Clock size={10} />
                      Collecting data — est. 3–5 days to significance
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <XCircle size={10} />
                      Paused — insufficient traffic
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </>
  );
}

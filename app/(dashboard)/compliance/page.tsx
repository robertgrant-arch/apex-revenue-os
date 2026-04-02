"use client";

import { useState } from "react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Shield,
  Lock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Heart,
  Scale,
  Home,
  Car,
  DollarSign,
  Globe,
  ChevronDown,
  Plus,
  Download,
  Activity,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ChartTooltip } from "@/components/ui/ChartTooltip";
import { complianceRules, approvalQueue } from "@/lib/data";

const VERTICAL_SCORES = [
  { v: "Medicare",      score: 97, color: "#3b82f6",  Icon: Heart,      fill: "#3b82f6" },
  { v: "Insurance",     score: 94, color: "#f59e0b",  Icon: Shield,     fill: "#f59e0b" },
  { v: "Legal",         score: 99, color: "#8b5cf6",  Icon: Scale,      fill: "#8b5cf6" },
  { v: "Home Services", score: 91, color: "#10b981",  Icon: Home,       fill: "#10b981" },
  { v: "Auto",          score: 73, color: "#ef4444",  Icon: Car,        fill: "#ef4444" },
];

const TIER_INFO = [
  {
    tier: 1,
    label: "Critical",
    color: "#ef4444",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    textColor: "text-red-400",
    desc: "Federal regulations (TCPA, HIPAA, FTC). Violations carry fines up to $1,500 per incident. Human review required before any launch. Zero-tolerance policy.",
  },
  {
    tier: 2,
    label: "Important",
    color: "#f59e0b",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    textColor: "text-amber-400",
    desc: "State regulations and platform policies. Auto-review with human override capability. 24-hour SLA for approval. Escalated to Tier 1 if unresolved.",
  },
  {
    tier: 3,
    label: "Standard",
    color: "#10b981",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    textColor: "text-emerald-400",
    desc: "Brand guidelines and internal policies. Automated review only. Instant approval for compliant assets. Flagged for human review only on repeated failures.",
  },
];

const radialData = VERTICAL_SCORES.map((v) => ({
  name: v.v,
  value: v.score,
  fill: v.fill,
}));

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<"rules" | "queue" | "tiers">(
    "rules"
  );
  const [expandedRule, setExpandedRule] = useState<number | null>(null);
  const [queueFilter, setQueueFilter] = useState<string>("all");

  const queueStatuses = ["all", "pending", "approved", "flagged", "rejected"];
  const filteredQueue =
    queueFilter === "all"
      ? approvalQueue
      : approvalQueue.filter((i) => i.status === queueFilter);

  const overallScore = Math.round(
    VERTICAL_SCORES.reduce((a, b) => a + b.score, 0) / VERTICAL_SCORES.length
  );

  return (
    <>
      <TopBar
        title="Compliance Engine"
        subtitle="TCPA · HIPAA · FTC · CAN-SPAM · State regulations"
      />
      <div className="p-6 space-y-6">

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Overall Score"
            value={`${overallScore}/100`}
            sub="+2 pts this week"
            trend="up"
            icon={Shield}
            color="#10b981"
          />
          <MetricCard
            label="Active Rules"
            value="42"
            sub="Across 5 verticals"
            icon={Lock}
            color="#6366f1"
          />
          <MetricCard
            label="Pending Approvals"
            value={String(approvalQueue.filter((i) => i.status === "pending").length)}
            sub={`${approvalQueue.filter((i) => i.status === "flagged").length} flagged`}
            trend="down"
            icon={Clock}
            color="#f59e0b"
          />
          <MetricCard
            label="Assets Reviewed"
            value="602"
            sub="This month"
            icon={CheckCircle2}
            color="#3b82f6"
          />
        </div>

        {/* ── Scores overview ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Radial chart */}
          <Card className="p-4 flex flex-col items-center">
            <h3 className="text-sm font-semibold text-white mb-2 self-start">
              Overall Compliance
            </h3>
            <div className="relative w-full">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="30%"
                  outerRadius="90%"
                  data={radialData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    background={{ fill: "#1e293b" }}
                    dataKey="value"
                    cornerRadius={4}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs">
                          <div className="font-medium text-white">{d.name}</div>
                          <div style={{ color: d.fill }}>{d.value}%</div>
                        </div>
                      );
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center mt-8">
                  <div className="text-3xl font-bold text-white">{overallScore}%</div>
                  <div className="text-xs text-slate-500">Avg score</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full mt-1">
              {VERTICAL_SCORES.map(({ v, score, color }) => (
                <div key={v} className="text-center">
                  <div className="text-xs font-bold" style={{ color }}>
                    {score}%
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{v}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Per-vertical score bars */}
          <Card className="lg:col-span-2 p-4">
            <h3 className="text-sm font-semibold text-white mb-4">
              Score by Vertical
            </h3>
            <div className="space-y-4">
              {VERTICAL_SCORES.map(({ v, score, color, Icon }) => (
                <div key={v}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: color + "20" }}
                      >
                        <Icon size={13} style={{ color }} />
                      </div>
                      <span className="text-sm text-white font-medium">{v}</span>
                      {score < 80 && (
                        <Badge color="red">Needs attention</Badge>
                      )}
                      {score >= 99 && (
                        <Badge color="emerald">Perfect</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-base font-bold"
                        style={{ color }}
                      >
                        {score}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${score}%`, background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Tab navigation ── */}
        <div className="flex gap-1.5">
          {(["rules", "queue", "tiers"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`text-xs px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                activeTab === t
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
              }`}
            >
              {t === "rules"  ? `Compliance Rules (${complianceRules.length})` :
               t === "queue"  ? `Approval Queue (${approvalQueue.length})` :
               "Tier Guide"}
            </button>
          ))}
        </div>

        {/* ── Rules tab ── */}
        {activeTab === "rules" && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">
                Active Compliance Rules
              </h3>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 text-xs border border-slate-700 text-slate-400 px-3 py-1.5 rounded-lg hover:border-slate-500 transition-colors">
                  <Download size={12} />Export
                </button>
                <button className="flex items-center gap-1.5 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors">
                  <Plus size={12} />Add Rule
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {complianceRules.map((r) => {
                const isExpanded = expandedRule === r.id;
                return (
                  <div
                    key={r.id}
                    className="border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 p-3.5 cursor-pointer"
                      onClick={() => setExpandedRule(isExpanded ? null : r.id)}
                    >
                      {/* Vertical icon */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          r.vertical === "Medicare"         ? "bg-blue-500/20"   :
                          r.vertical === "Insurance"        ? "bg-amber-500/20"  :
                          r.vertical === "Legal"            ? "bg-purple-500/20" :
                          r.vertical === "Home Services"    ? "bg-emerald-500/20":
                          r.vertical === "Auto"             ? "bg-amber-500/20"  : "bg-slate-700"
                        }`}
                      >
                        {r.vertical === "Medicare"      ? <Heart  size={14} className="text-blue-400"    /> :
                         r.vertical === "Legal"         ? <Scale  size={14} className="text-purple-400"  /> :
                         r.vertical === "Home Services" ? <Home   size={14} className="text-emerald-400" /> :
                         r.vertical === "Auto"          ? <Car    size={14} className="text-amber-400"   /> :
                         r.vertical === "Insurance"     ? <Shield size={14} className="text-amber-400"   /> :
                         <Globe size={14} className="text-slate-400" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {r.name}
                          </span>
                          <Badge
                            color={
                              r.vertical === "Medicare"   ? "blue"   :
                              r.vertical === "Legal"      ? "purple" :
                              r.vertical === "All"        ? "slate"  : "amber"
                            }
                          >
                            {r.vertical}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            Tier {r.tier} · {r.assets} assets
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div
                            className={`text-sm font-bold ${
                              r.score >= 95 ? "text-emerald-400" :
                              r.score >= 85 ? "text-amber-400"   : "text-red-400"
                            }`}
                          >
                            {r.score}%
                          </div>
                          <div
                            className={`flex items-center gap-1 text-xs ${
                              r.status === "active" ? "text-emerald-400" : "text-amber-400"
                            }`}
                          >
                            {r.status === "active"
                              ? <CheckCircle2 size={10} />
                              : <AlertTriangle size={10} />}
                            {r.status}
                          </div>
                        </div>
                        {isExpanded
                          ? <ChevronDown size={14} className="text-slate-500 rotate-180" />
                          : <ChevronDown size={14} className="text-slate-500" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-slate-800 bg-slate-900/30">
                        <p className="text-xs text-slate-400 leading-relaxed mt-3 mb-3">
                          {r.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button className="text-xs border border-slate-700 text-slate-400 px-3 py-1.5 rounded-lg hover:border-slate-500 transition-colors">
                            View {r.assets} Assets
                          </button>
                          <button className="text-xs border border-slate-700 text-slate-400 px-3 py-1.5 rounded-lg hover:border-slate-500 transition-colors">
                            Edit Rule
                          </button>
                          {r.status === "warning" && (
                            <button className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-colors">
                              Resolve Warning →
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* ── Queue tab ── */}
        {activeTab === "queue" && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">
                Approval Queue
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Activity size={11} className="text-emerald-400 animate-pulse" />
                  Live
                </div>
                <div className="flex gap-1">
                  {queueStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQueueFilter(s)}
                      className={`text-xs px-2.5 py-1 rounded-lg capitalize transition-colors ${
                        queueFilter === s
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredQueue.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    item.status === "flagged"
                      ? "bg-red-500/5 border-red-500/20"
                      : item.status === "approved"
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {item.asset}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.type} · Tier {item.tier} · Submitted {item.submitted}{" "}
                        by <span className="text-slate-400">{item.submittedBy}</span>
                      </div>
                    </div>
                    <Badge
                      color={
                        item.status === "approved"  ? "emerald" :
                        item.status === "flagged"   ? "red"     :
                        item.status === "rejected"  ? "red"     : "amber"
                      }
                    >
                      {item.status === "pending" && (
                        <span className="mr-1 inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      )}
                      {item.status}
                    </Badge>
                  </div>

                  {item.flags.length > 0 && (
                    <div className="space-y-1 mb-3 p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                      <div className="text-xs font-medium text-amber-400 mb-1">
                        Compliance Flags ({item.flags.length})
                      </div>
                      {item.flags.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-1.5 text-xs text-amber-300"
                        >
                          <AlertCircle size={10} className="mt-0.5 shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                  )}

                  {item.status === "approved" && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 mb-2">
                      <CheckCircle2 size={11} />
                      Cleared for launch — all compliance checks passed
                    </div>
                  )}

                  {item.status === "flagged" && (
                    <div className="flex items-center gap-1.5 text-xs text-red-400 mb-2">
                      <XCircle size={11} />
                      Blocked — revisions required before re-submission
                    </div>
                  )}

                  {item.status === "pending" && (
                    <div className="flex gap-2 mt-1">
                      <button className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5">
                        <CheckCircle2 size={12} />Approve
                      </button>
                      <button className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5">
                        <XCircle size={12} />Reject
                      </button>
                      <button className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded-lg font-medium transition-colors">
                        Review
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {filteredQueue.length === 0 && (
                <div className="text-center text-slate-500 text-sm py-8">
                  No items match this filter.
                </div>
              )}
            </div>
          </Card>
        )}

        {/* ── Tier guide tab ── */}
        {activeTab === "tiers" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TIER_INFO.map((t) => (
              <Card key={t.tier} className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold border ${t.bg} ${t.border} ${t.textColor}`}
                  >
                    {t.tier}
                  </div>
                  <div>
                    <div className="font-semibold text-white">Tier {t.tier}</div>
                    <div className={`text-xs font-medium ${t.textColor}`}>
                      {t.label}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {t.desc}
                </p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Review method</span>
                    <span className="text-white font-medium">
                      {t.tier === 1 ? "Human required" : t.tier === 2 ? "Auto + human override" : "Automated only"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Approval SLA</span>
                    <span className="text-white font-medium">
                      {t.tier === 1 ? "24–48 hours" : t.tier === 2 ? "24 hours" : "Instant"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Violation risk</span>
                    <span className={`font-medium ${t.textColor}`}>
                      {t.tier === 1 ? "Federal fine ($1,500+/incident)" : t.tier === 2 ? "Platform ban / state fine" : "Brand / internal policy"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Examples</span>
                    <span className="text-slate-300 text-right max-w-[140px]">
                      {t.tier === 1 ? "TCPA, HIPAA, FTC" : t.tier === 2 ? "State regs, Meta policy" : "Brand guidelines"}
                    </span>
                  </div>
                </div>
                <div className={`mt-4 p-2.5 rounded-lg border ${t.bg} ${t.border}`}>
                  <div className="text-xs text-center font-medium" style={{ color: t.color }}>
                    {complianceRules.filter((r) => r.tier === t.tier).length} active rules in this tier
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </>
  );
}

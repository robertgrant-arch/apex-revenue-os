"use client";

import { useState } from "react";
import {
  Bot,
  Activity,
  Zap,
  RefreshCw,
  ChevronLeft,
  Info,
  BarChart2,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { TopBar } from "@/components/layout/TopBar";
import { AgentCard } from "@/components/agents/AgentCard";
import { AgentDetail } from "@/components/agents/AgentDetail";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusDot } from "@/components/ui/StatusDot";
import { ChartTooltip } from "@/components/ui/ChartTooltip";
import { AGENTS, auditLog } from "@/lib/data";

const radarData = [
  { metric: "Accuracy",    ORACLE: 94, CREATOR: 88, SIGNAL: 96 },
  { metric: "Speed",       ORACLE: 82, CREATOR: 91, SIGNAL: 97 },
  { metric: "Compliance",  ORACLE: 99, CREATOR: 85, SIGNAL: 93 },
  { metric: "Coverage",    ORACLE: 90, CREATOR: 78, SIGNAL: 88 },
  { metric: "Autonomy",    ORACLE: 76, CREATOR: 94, SIGNAL: 91 },
];

export default function AgentsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const agent = selected ? AGENTS.find((a) => a.id === selected) ?? null : null;

  if (agent) {
    return (
      <>
        <TopBar
          title={`Agent: ${agent.name}`}
          subtitle={`${agent.role} · ${agent.confidence}% confidence`}
        />
        <AgentDetail agent={agent} onBack={() => setSelected(null)} />
      </>
    );
  }

  const sortedByActions = [...AGENTS].sort((a, b) => b.actions - a.actions);
  const maxActions = sortedByActions[0].actions;

  return (
    <>
      <TopBar title="AI Agents" subtitle="7 agents · 6 active · 1 processing" />
      <div className="p-6 space-y-6">

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Active Agents"
            value="6 / 7"
            icon={Bot}
            color="#10b981"
          />
          <MetricCard
            label="Total Actions (All Time)"
            value="77,516"
            sub="+1,204 today"
            trend="up"
            icon={Zap}
            color="#6366f1"
          />
          <MetricCard
            label="Avg Confidence"
            value="92.6%"
            sub="+1.4% this week"
            trend="up"
            icon={Activity}
            color="#f59e0b"
          />
          <MetricCard
            label="Model Updates Today"
            value="23"
            sub="LOOP agent"
            icon={RefreshCw}
            color="#06b6d4"
          />
        </div>

        {/* ── Quick-status bar ── */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Quick Status
            </h3>
            <span className="text-xs text-slate-500">Click an agent to inspect</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {AGENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelected(a.id)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-lg px-3 py-2 transition-all"
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                  style={{ background: a.color + "20" }}
                >
                  <a.icon size={11} style={{ color: a.color }} />
                </div>
                <span className="text-xs font-semibold text-white">{a.name}</span>
                <StatusDot status={a.status} />
                <span className="text-xs text-slate-500">{a.confidence}%</span>
              </button>
            ))}
          </div>
        </Card>

        {/* ── Agent Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {AGENTS.map((a) => (
            <AgentCard key={a.id} agent={a} onClick={() => setSelected(a.id)} />
          ))}
        </div>

        {/* ── Bottom row: leaderboard + radar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Actions leaderboard */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">
                Actions Leaderboard (All Time)
              </h3>
              <BarChart2 size={14} className="text-slate-500" />
            </div>
            <div className="space-y-3">
              {sortedByActions.map((a, i) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 group cursor-pointer hover:bg-slate-900/50 rounded-lg px-1 py-0.5 transition-colors"
                  onClick={() => setSelected(a.id)}
                >
                  <span className="text-xs text-slate-600 w-4 text-right shrink-0">
                    {i + 1}
                  </span>
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                    style={{ background: a.color + "20" }}
                  >
                    <a.icon size={11} style={{ color: a.color }} />
                  </div>
                  <span className="text-xs font-semibold text-white w-20 shrink-0">
                    {a.name}
                  </span>
                  <div className="flex-1 bg-slate-700 rounded-full h-1.5 min-w-0">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${(a.actions / maxActions) * 100}%`,
                        background: a.color,
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-300 w-16 text-right shrink-0">
                    {a.actions.toLocaleString()}
                  </span>
                  <Badge
                    color={
                      a.status === "active"
                        ? "emerald"
                        : a.status === "processing"
                        ? "blue"
                        : "amber"
                    }
                  >
                    {a.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Radar chart */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-white mb-1">
              Top-3 Agent Performance Radar
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              ORACLE · CREATOR · SIGNAL — across 5 dimensions
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <Radar
                  name="ORACLE"
                  dataKey="ORACLE"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Radar
                  name="CREATOR"
                  dataKey="CREATOR"
                  stroke="#ec4899"
                  fill="#ec4899"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Radar
                  name="SIGNAL"
                  dataKey="SIGNAL"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Tooltip content={<ChartTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs mt-1">
              {[["ORACLE","#6366f1"],["CREATOR","#ec4899"],["SIGNAL","#f59e0b"]].map(([name, color]) => (
                <span key={name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-slate-400">{name}</span>
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Recent decisions across all agents ── */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">
              Recent Decisions — All Agents
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Activity size={11} className="text-emerald-400 animate-pulse" />
              Live feed
            </div>
          </div>
          <div className="space-y-2">
            {auditLog.map((l) => {
              const ag = AGENTS.find((a) => a.name === l.agent);
              return (
                <div
                  key={l.id}
                  className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                  onClick={() => ag && setSelected(ag.id)}
                >
                  {ag && (
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: ag.color + "20" }}
                    >
                      <ag.icon size={12} style={{ color: ag.color }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-white">{l.agent}</span>
                      <span className="text-xs text-slate-500">{l.time}</span>
                      <Badge color="emerald">{l.confidence}% conf.</Badge>
                    </div>
                    <div className="text-xs text-slate-300">{l.decision}</div>
                    <div className="text-xs text-emerald-400/80 mt-0.5">
                      Impact: {l.impact}
                    </div>
                  </div>
                  <button className="text-slate-600 hover:text-slate-400 transition-colors shrink-0">
                    <Info size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>

      </div>
    </>
  );
}

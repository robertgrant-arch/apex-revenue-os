"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Activity,
  Target,
  BarChart2,
  CheckCircle2,
  Info,
  Zap,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusDot } from "@/components/ui/StatusDot";
import { ChartTooltip } from "@/components/ui/ChartTooltip";
import {
  AGENTS,
  revenueData,
  appointmentData,
  leadScoreData,
  campaigns,
  auditLog,
} from "@/lib/data";

export default function DashboardPage() {
  return (
    <>
      <TopBar title="Revenue Dashboard" subtitle="April 2, 2025 · All systems live" />
      <div className="p-6 space-y-6">

        {/* ── KPI Row 1 ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Pipeline Value"
            value="$1.28M"
            sub="+18% vs last month"
            trend="up"
            icon={TrendingUp}
            color="#10b981"
          />
          <MetricCard
            label="Appointments Set"
            value="89"
            sub="+12 this week"
            trend="up"
            icon={Calendar}
            color="#6366f1"
          />
          <MetricCard
            label="Closed Revenue"
            value="$540K"
            sub="+31% vs last month"
            trend="up"
            icon={DollarSign}
            color="#f59e0b"
          />
          <MetricCard
            label="RAE Score™"
            value="94 / 100"
            sub="+2 pts this week"
            trend="up"
            icon={Activity}
            color="#ec4899"
          />
        </div>

        {/* ── KPI Row 2 ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Avg CPL"
            value="$38"
            sub="-$6 vs last month"
            trend="up"
            icon={Target}
            color="#10b981"
          />
          <MetricCard
            label="Avg CPA"
            value="$412"
            sub="-$89 vs last month"
            trend="up"
            icon={Target}
            color="#3b82f6"
          />
          <MetricCard
            label="ROAS"
            value="6.2x"
            sub="+0.8x vs last month"
            trend="up"
            icon={BarChart2}
            color="#8b5cf6"
          />
          <MetricCard
            label="Show Rate"
            value="78%"
            sub="+4% vs last month"
            trend="up"
            icon={CheckCircle2}
            color="#06b6d4"
          />
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Revenue Area Chart */}
          <Card className="lg:col-span-2 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">
                Revenue Trend — Last 7 Months
              </h3>
              <div className="flex gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Pipeline ($k)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                  Closed ($k)
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gPipeline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gClosed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}k`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="pipeline"
                  name="Pipeline ($k)"
                  stroke="#10b981"
                  fill="url(#gPipeline)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#10b981" }}
                />
                <Area
                  type="monotone"
                  dataKey="closed"
                  name="Closed ($k)"
                  stroke="#8b5cf6"
                  fill="url(#gClosed)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#8b5cf6" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Lead Score Bar Chart */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-white mb-4">
              Lead Score Distribution
            </h3>
            <ResponsiveContainer width="100%" height={185}>
              <BarChart
                data={leadScoreData}
                barSize={26}
                margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
              >
                <XAxis
                  dataKey="score"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Leads" radius={[4, 4, 0, 0]}>
                  {leadScoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 text-xs text-slate-500 text-center">
              1,444 total scored leads
            </div>
          </Card>
        </div>

        {/* ── Appointments Line Chart ── */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Appointments This Week — Booked vs Showed vs Closed
            </h3>
            <div className="flex gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Booked</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Showed</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Closed</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={appointmentData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="booked" name="Booked" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: "#3b82f6" }} />
              <Line type="monotone" dataKey="showed" name="Showed" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} />
              <Line type="monotone" dataKey="closed" name="Closed" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Agent Status Panel ── */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Agent Status Panel</h3>
            <div className="flex items-center gap-2">
              <Badge color="emerald">6 / 7 Active</Badge>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Activity size={11} className="text-emerald-400 animate-pulse" />
                Live
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
            {AGENTS.map((a) => (
              <div
                key={a.id}
                className="bg-slate-900 rounded-lg p-3 text-center hover:bg-slate-800 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
                  style={{ background: a.color + "20" }}
                >
                  <a.icon size={14} style={{ color: a.color }} />
                </div>
                <div className="text-[10px] font-bold text-white mb-1 truncate">{a.name}</div>
                <div className="flex justify-center mb-1">
                  <StatusDot status={a.status} />
                </div>
                <div className="text-[10px] text-slate-500">{a.confidence}%</div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Campaigns Table ── */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Active Campaigns</h3>
            <a
              href="/campaigns"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View all →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800">
                  {[
                    "Campaign",
                    "Vertical",
                    "Status",
                    "Spend",
                    "Pipeline",
                    "ROAS",
                    "Leads",
                    "Appts",
                    "CPL",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-2 pr-4 font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns
                  .filter((c) => c.status !== "draft")
                  .map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="py-2.5 pr-4 text-white font-medium whitespace-nowrap max-w-[160px] truncate">
                        {c.name}
                      </td>
                      <td className="pr-4">
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
                      </td>
                      <td className="pr-4">
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                          <StatusDot status={c.status} />
                          <span className="text-slate-400 capitalize">{c.status}</span>
                        </span>
                      </td>
                      <td className="pr-4 text-slate-300">
                        ${c.spend.toLocaleString()}
                      </td>
                      <td className="pr-4 text-emerald-400 font-medium">
                        ${c.pipeline.toLocaleString()}
                      </td>
                      <td className="pr-4 text-white font-semibold">{c.roas}x</td>
                      <td className="pr-4 text-slate-300">{c.leads}</td>
                      <td className="pr-4 text-slate-300">{c.appts}</td>
                      <td className="pr-4 text-slate-300">${c.cpl}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── Decision Audit Log ── */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">
              Decision Audit Log
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Zap size={11} className="text-emerald-400" />
              <Activity size={11} className="text-emerald-400 animate-pulse" />
              Live — auto-updating
            </div>
          </div>
          <div className="space-y-2">
            {auditLog.map((l) => {
              const ag = AGENTS.find((a) => a.name === l.agent);
              return (
                <div
                  key={l.id}
                  className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors group"
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
                      <span className="text-xs font-bold text-white">
                        {l.agent}
                      </span>
                      <span className="text-xs text-slate-500">{l.time}</span>
                      <Badge color="emerald">{l.confidence}% conf.</Badge>
                      <Badge
                        color={
                          l.category === "suppression"
                            ? "amber"
                            : l.category === "creative"
                            ? "pink"
                            : l.category === "intelligence"
                            ? "blue"
                            : l.category === "budget"
                            ? "red"
                            : "slate"
                        }
                      >
                        {l.category}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-300">{l.decision}</div>
                    <div className="text-xs text-emerald-400/80 mt-0.5">
                      Impact: {l.impact}
                    </div>
                  </div>
                  <button className="text-slate-600 hover:text-slate-400 transition-colors shrink-0 mt-0.5 opacity-0 group-hover:opacity-100">
                    <Info size={12} />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing last 8 decisions
            </span>
            <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              View full audit log →
            </button>
          </div>
        </Card>

      </div>
    </>
  );
}

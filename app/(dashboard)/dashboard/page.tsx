"use client";
import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,// app/(dashboard)/dashboard/page.tsx
"use client";

import { useDashboardStats } from "@/lib/hooks";
import MetricCard from "@/components/ui/MetricCard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import StatusDot from "@/components/ui/StatusDot";
import TopBar from "@/components/layout/TopBar";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import ChartTooltip from "@/components/ui/ChartTooltip";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-800 ${className}`} />
  );
}

function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="h-8 w-8 rounded-lg" />
      </div>
      <SkeletonBlock className="h-8 w-32" />
      <SkeletonBlock className="h-3 w-20" />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonBlock className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboardStats();

  if (isError) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950">
        <TopBar title="Dashboard" />
        <div className="flex flex-1 items-center justify-center">
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-8 text-center max-w-md">
            <svg
              className="w-10 h-10 text-red-400 mx-auto mb-3"
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
            <p className="text-red-400 font-medium">Failed to load dashboard</p>
            <p className="text-slate-500 text-sm mt-1">
              {(error as Error)?.message ?? "An unexpected error occurred"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stats = data?.stats ?? {};
  const recentLeads: any[] = data?.recentLeads ?? [];
  const revenueChart: any[] = data?.revenueChart ?? [];
  const conversionChart: any[] = data?.conversionChart ?? [];
  const topCampaigns: any[] = data?.topCampaigns ?? [];
  const agentActivity: any[] = data?.agentActivity ?? [];

  const metricCards = [
    {
      label: "Total Leads",
      value: isLoading ? "—" : (stats.totalLeads ?? 0).toLocaleString(),
      change: stats.leadsChange ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "violet",
    },
    {
      label: "Active Campaigns",
      value: isLoading ? "—" : (stats.activeCampaigns ?? 0).toLocaleString(),
      change: stats.campaignsChange ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      color: "blue",
    },
    {
      label: "Revenue (MTD)",
      value: isLoading
        ? "—"
        : `$${((stats.revenueMtd ?? 0) / 1000).toFixed(1)}k`,
      change: stats.revenueChange ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "emerald",
    },
    {
      label: "Conversion Rate",
      value: isLoading
        ? "—"
        : `${((stats.conversionRate ?? 0) * 100).toFixed(1)}%`,
      change: stats.conversionChange ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "amber",
    },
    {
      label: "Appointments Set",
      value: isLoading ? "—" : (stats.appointmentsSet ?? 0).toLocaleString(),
      change: stats.appointmentsChange ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "indigo",
    },
    {
      label: "AI Agents Active",
      value: isLoading ? "—" : (stats.activeAgents ?? 0).toLocaleString(),
      change: stats.agentsChange ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
        </svg>
      ),
      color: "rose",
    },
  ];

  const statusColors: Record<string, string> = {
    NEW: "bg-slate-500/20 text-slate-300",
    CONTACTED: "bg-blue-500/20 text-blue-300",
    QUALIFIED: "bg-violet-500/20 text-violet-300",
    APPOINTMENT_SET: "bg-amber-500/20 text-amber-300",
    PROPOSAL_SENT: "bg-indigo-500/20 text-indigo-300",
    WON: "bg-emerald-500/20 text-emerald-300",
    LOST: "bg-red-500/20 text-red-300",
    DISQUALIFIED: "bg-slate-600/20 text-slate-400",
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <TopBar title="Dashboard" />

      <main className="flex-1 p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <MetricCardSkeleton key={i} />
              ))
            : metricCards.map((card) => (
                <MetricCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  change={card.change}
                  icon={card.icon}
                  color={card.color}
                />
              ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Revenue Area Chart */}
          <div className="xl:col-span-2">
            <Card>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  {isLoading ? (
                    <>
                      <SkeletonBlock className="h-5 w-32" />
                      <SkeletonBlock className="h-6 w-20 rounded-full" />
                    </>
                  ) : (
                    <>
                      <h2 className="text-sm font-semibold text-white">
                        Revenue Over Time
                      </h2>
                      <Badge variant="emerald" size="sm">
                        MTD
                      </Badge>
                    </>
                  )}
                </div>

                {isLoading ? (
                  <SkeletonBlock className="h-52 w-full" />
                ) : revenueChart.length === 0 ? (
                  <div className="h-52 flex items-center justify-center text-slate-500 text-sm">
                    No revenue data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={208}>
                    <AreaChart data={revenueChart}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="date"
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
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#7c3aed"
                        strokeWidth={2}
                        fill="url(#revenueGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>

          {/* Conversion Bar Chart */}
          <div>
            <Card>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  {isLoading ? (
                    <>
                      <SkeletonBlock className="h-5 w-28" />
                      <SkeletonBlock className="h-6 w-16 rounded-full" />
                    </>
                  ) : (
                    <>
                      <h2 className="text-sm font-semibold text-white">
                        Conversions by Vertical
                      </h2>
                      <Badge variant="blue" size="sm">
                        30d
                      </Badge>
                    </>
                  )}
                </div>

                {isLoading ? (
                  <SkeletonBlock className="h-52 w-full" />
                ) : conversionChart.length === 0 ? (
                  <div className="h-52 flex items-center justify-center text-slate-500 text-sm">
                    No conversion data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={208}>
                    <BarChart data={conversionChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="vertical"
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
                        dataKey="conversions"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Recent Leads */}
          <div className="xl:col-span-2">
            <Card>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  {isLoading ? (
                    <>
                      <SkeletonBlock className="h-5 w-28" />
                      <SkeletonBlock className="h-8 w-20 rounded-lg" />
                    </>
                  ) : (
                    <>
                      <h2 className="text-sm font-semibold text-white">
                        Recent Leads
                      </h2>
                      
                        href="/leads"
                        className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        View all →
                      </a>
                    </>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {["Name", "Vertical", "Status", "Score", "Created"].map(
                          (h) => (
                            <th
                              key={h}
                              className="text-left px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider"
                            >
                              {isLoading ? (
                                <SkeletonBlock className="h-3 w-12" />
                              ) : (
                                h
                              )}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {isLoading
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <TableRowSkeleton key={i} />
                          ))
                        : recentLeads.length === 0
                        ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">
                              No recent leads
                            </td>
                          </tr>
                        )
                        : recentLeads.map((lead: any) => (
                            <tr
                              key={lead.id}
                              className="hover:bg-slate-800/30 transition-colors"
                            >
                              <td className="px-4 py-3 text-white font-medium">
                                {lead.firstName} {lead.lastName}
                              </td>
                              <td className="px-4 py-3 text-slate-400">
                                {lead.vertical}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                                    statusColors[lead.status] ??
                                    "bg-slate-700 text-slate-300"
                                  }`}
                                >
                                  <StatusDot status={lead.status} />
                                  {lead.status.replace(/_/g, " ")}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-16 rounded-full bg-slate-800 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        (lead.score ?? 0) >= 80
                                          ? "bg-emerald-500"
                                          : (lead.score ?? 0) >= 60
                                          ? "bg-amber-500"
                                          : "bg-red-500"
                                      }`}
                                      style={{ width: `${lead.score ?? 0}%` }}
                                    />
                                  </div>
                                  <span className="text-slate-400 text-xs">
                                    {lead.score ?? 0}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-500 text-xs">
                                {lead.createdAt
                                  ? new Date(lead.createdAt).toLocaleDateString(
                                      "en-US",
                                      { month: "short", day: "numeric" }
                                    )
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Top Campaigns */}
            <Card>
              <div className="p-5">
                <h2 className="text-sm font-semibold text-white mb-4">
                  {isLoading ? (
                    <SkeletonBlock className="h-4 w-28" />
                  ) : (
                    "Top Campaigns"
                  )}
                </h2>
                <div className="space-y-3">
                  {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between">
                            <SkeletonBlock className="h-3 w-24" />
                            <SkeletonBlock className="h-3 w-12" />
                          </div>
                          <SkeletonBlock className="h-1.5 w-full rounded-full" />
                        </div>
                      ))
                    : topCampaigns.length === 0
                    ? (
                      <p className="text-slate-500 text-sm">No campaigns yet</p>
                    )
                    : topCampaigns.map((c: any) => {
                        const pct = c.budget > 0 ? Math.min(100, ((c.spent ?? 0) / c.budget) * 100) : 0;
                        return (
                          <div key={c.id}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-slate-300 truncate max-w-[140px]">
                                {c.name}
                              </span>
                              <span className="text-xs text-slate-500">
                                {pct.toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-violet-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                </div>
              </div>
            </Card>

            {/* Agent Activity */}
            <Card>
              <div className="p-5">
                <h2 className="text-sm font-semibold text-white mb-4">
                  {isLoading ? (
                    <SkeletonBlock className="h-4 w-24" />
                  ) : (
                    "Agent Activity"
                  )}
                </h2>
                <div className="space-y-3">
                  {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <SkeletonBlock className="h-8 w-8 rounded-lg shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <SkeletonBlock className="h-3 w-20" />
                            <SkeletonBlock className="h-2.5 w-28" />
                          </div>
                          <SkeletonBlock className="h-5 w-12 rounded-full" />
                        </div>
                      ))
                    : agentActivity.length === 0
                    ? (
                      <p className="text-slate-500 text-sm">No agent activity</p>
                    )
                    : agentActivity.map((agent: any) => (
                        <div key={agent.id} className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                            <svg
                              className="w-4 h-4 text-violet-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">
                              {agent.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {agent.type}
                            </p>
                          </div>
                          <StatusDot status={agent.status} />
                        </div>
                      ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
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
  const [liveLog, setLiveLog] = useState(auditLog.slice(0, 6));

  useEffect(() => {
    const interval = setInterval(() => {
      const re = auditLog[Math.floor(Math.random() * auditLog.length)];
      setLiveLog((p) => [{ ...re, id: `live-${Date.now()}`, time: "1s ago" }, ...p].slice(0, 10));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

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
            color="#ef4444"
          />
        </div>

        {/* ── KPI Row 2 ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Active Agents"
            value="5 / 5"
            sub="All online"
            trend="up"
            icon={Zap}
            color="#8b5cf6"
          />
          <MetricCard
            label="Lead Score Avg"
            value="73"
            sub="+4 vs last week"
            trend="up"
            icon={Target}
            color="#06b6d4"
          />
          <MetricCard
            label="Compliance"
            value="100%"
            sub="All calls approved"
            trend="up"
            icon={CheckCircle2}
            color="#10b981"
          />
          <MetricCard
            label="Campaigns"
            value="12"
            sub="3 launched today"
            trend="up"
            icon={BarChart2}
            color="#f97316"
          />
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100">Revenue Trend</h3>
              <Badge variant="green">+31%</Badge>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 12 }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Appointments */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100">Appointments by Week</h3>
              <Badge variant="blue">89 total</Badge>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={appointmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="week" tick={{ fill: "#71717a", fontSize: 12 }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="booked" radius={[4, 4, 0, 0]}>
                  {appointmentData.map((_, i) => (
                    <Cell key={i} fill={i === appointmentData.length - 1 ? "#6366f1" : "#3f3f46"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ── Lead Score + Agent Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lead Score Distribution */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100">Lead Score Distribution</h3>
              <Badge variant="cyan">Avg 73</Badge>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={leadScoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="range" tick={{ fill: "#71717a", fontSize: 12 }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Agent Status Grid */}
          <Card>
            <h3 className="text-sm font-semibold text-zinc-100 mb-4">Agent Status</h3>
            <div className="space-y-3">
              {AGENTS.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <div className="flex items-center gap-3">
                    <StatusDot status={a.status} />
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{a.name}</p>
                      <p className="text-xs text-zinc-500">{a.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-100">{a.metric}</p>
                    <p className="text-xs text-zinc-500">{a.metricLabel}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Campaigns Table ── */}
        <Card>
          <h3 className="text-sm font-semibold text-zinc-100 mb-4">Active Campaigns</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800">
                  <th className="text-left py-2 font-medium">Campaign</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-right py-2 font-medium">Spend</th>
                  <th className="text-right py-2 font-medium">ROAS</th>
                  <th className="text-right py-2 font-medium">Leads</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 text-zinc-100">{c.name}</td>
                    <td className="py-3">
                      <Badge variant={c.status === "active" ? "green" : c.status === "paused" ? "yellow" : "zinc"}>{c.status}</Badge>
                    </td>
                    <td className="py-3 text-right text-zinc-300">{c.spend}</td>
                    <td className="py-3 text-right text-zinc-300">{c.roas}</td>
                    <td className="py-3 text-right text-zinc-300">{c.leads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── Live Audit Log ── */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-100">Live Audit Feed</h3>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs text-zinc-500">Live</span>
            </div>
          </div>
          <div className="space-y-2">
            {liveLog.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-2 rounded-md bg-zinc-800/30 border border-zinc-700/30">
                <div className="flex items-center gap-3">
                  <StatusDot status={entry.level === "success" ? "online" : entry.level === "warning" ? "warning" : "info"} />
                  <div>
                    <p className="text-sm text-zinc-200">{entry.message}</p>
                    <p className="text-xs text-zinc-500">{entry.agent}</p>
                  </div>
                </div>
                <span className="text-xs text-zinc-600 whitespace-nowrap">{entry.time}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </>
  );
}

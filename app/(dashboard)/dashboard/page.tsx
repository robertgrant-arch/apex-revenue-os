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

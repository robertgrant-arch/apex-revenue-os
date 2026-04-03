"use client";
import { useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, Users, TrendingUp, Zap, Target, Activity } from "lucide-react";
import MetricCard from "@/components/ui/MetricCard";
import Card from "@/components/ui/Card";
import { ChartTooltip } from "@/components/ui/ChartTooltip";
import { cn } from "@/lib/utils";

const revenueData = [
  { month: "Oct", pipeline: 1200000, closed: 820000 },
  { month: "Nov", pipeline: 1450000, closed: 940000 },
  { month: "Dec", pipeline: 1100000, closed: 780000 },
  { month: "Jan", pipeline: 1680000, closed: 1100000 },
  { month: "Feb", pipeline: 1920000, closed: 1380000 },
  { month: "Mar", pipeline: 2100000, closed: 1620000 },
];

const conversionData = [
  { stage: "Leads", value: 4820 },
  { stage: "Qualified", value: 2310 },
  { stage: "Proposal", value: 980 },
  { stage: "Negotiation", value: 420 },
  { stage: "Closed", value: 187 },
];

const recentLeads = [
  { id: 1, name: "Margaret Chen", vertical: "Medicare", score: 94, status: "hot", value: "$3,200", agent: "ORACLE" },
  { id: 2, name: "Robert Williams", vertical: "Auto", score: 82, status: "warm", value: "$1,800", agent: "SIGNAL" },
  { id: 3, name: "Patricia Davis", vertical: "Medicare", score: 91, status: "hot", value: "$4,100", agent: "ORACLE" },
  { id: 4, name: "James Thompson", vertical: "Home", score: 67, status: "warm", value: "$2,400", agent: "CONVERT" },
  { id: 5, name: "Linda Garcia", vertical: "Life", score: 45, status: "cold", value: "$1,200", agent: "REACH" },
  { id: 6, name: "Michael Brown", vertical: "Medicare", score: 88, status: "hot", value: "$3,900", agent: "ORACLE" },
];

const topCampaigns = [
  { name: "Medicare AEP Q1", progress: 84, spend: "$24,200", pipeline: "$312,000", color: "bg-emerald-500" },
  { name: "Auto Cross-sell", progress: 61, spend: "$12,800", pipeline: "$98,400", color: "bg-violet-500" },
  { name: "Life Insurance Push", progress: 47, spend: "$8,400", pipeline: "$67,200", color: "bg-amber-500" },
  { name: "Home Bundle Q2", progress: 29, spend: "$5,100", pipeline: "$38,800", color: "bg-blue-500" },
];

const agentActivity = [
  { agent: "ORACLE", action: "Scored 14 new Medicare leads", time: "2m ago", status: "running" },
  { agent: "ARCHITECT", action: "Rebuilt campaign targeting model", time: "8m ago", status: "running" },
  { agent: "CREATOR", action: "Generated 6 ad variants for AEP", time: "15m ago", status: "running" },
  { agent: "SIGNAL", action: "Detected intent signal: retirement search", time: "22m ago", status: "running" },
  { agent: "REACH", action: "Launched email sequence to 2,400 contacts", time: "31m ago", status: "idle" },
  { agent: "CONVERT", action: "Personalized 3 proposal PDFs", time: "44m ago", status: "idle" },
  { agent: "LOOP", action: "Attribution report updated", time: "1h ago", status: "idle" },
];

const statusColors: Record<string, string> = {
  hot: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
  warm: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  cold: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
};

export default function DashboardPage() {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Revenue Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Real-time pipeline powered by 7 AI agents</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-800/50 border border-slate-700/50 rounded-lg p-1">
          {(["7d", "30d", "90d"] as const).map(r => (
            <button key={r} onClick={() => setRange(r)} className={cn("px-3 py-1.5 text-sm rounded-md font-medium transition-all", range === r ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white")}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard title="Total Pipeline" value="$2.1M" change={18.4} changeLabel="vs last month" icon={<DollarSign className="w-4 h-4" />} accent="emerald" />
        <MetricCard title="Closed Revenue" value="$1.62M" change={12.7} changeLabel="vs last month" icon={<TrendingUp className="w-4 h-4" />} accent="emerald" />
        <MetricCard title="Active Leads" value="4,820" change={-3.2} changeLabel="vs last month" icon={<Users className="w-4 h-4" />} accent="violet" />
        <MetricCard title="Conversion Rate" value="3.9%" change={0.8} changeLabel="vs last month" icon={<Target className="w-4 h-4" />} accent="amber" />
        <MetricCard title="Agent Actions" value="12,840" change={24.1} changeLabel="vs last month" icon={<Zap className="w-4 h-4" />} accent="blue" />
        <MetricCard title="Cost per Lead" value="$14.20" change={-8.3} changeLabel="vs last month" icon={<Activity className="w-4 h-4" />} accent="rose" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="pipeline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="closed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000000).toFixed(1)}M`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="pipeline" stroke="#8b5cf6" strokeWidth={2} fill="url(#pipeline)" name="Pipeline" />
              <Area type="monotone" dataKey="closed" stroke="#10b981" strokeWidth={2} fill="url(#closed)" name="Closed" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={conversionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="stage" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Leads</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {["Name", "Vertical", "Score", "Status", "Value", "Agent"].map(h => (
                    <th key={h} className="text-left pb-2 text-xs font-medium text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {recentLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="py-2.5 text-sm text-white font-medium">{lead.name}</td>
                    <td className="py-2.5 text-sm text-slate-400">{lead.vertical}</td>
                    <td className="py-2.5">
                      <span className={cn("text-sm font-bold", lead.score >= 85 ? "text-emerald-400" : lead.score >= 65 ? "text-amber-400" : "text-slate-400")}>
                        {lead.score}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", statusColors[lead.status])}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-sm text-white">{lead.value}</td>
                    <td className="py-2.5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 font-medium">
                        {lead.agent}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Top Campaigns</h3>
            <div className="space-y-4">
              {topCampaigns.map(c => (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white font-medium">{c.name}</span>
                    <span className="text-xs text-slate-400">{c.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", c.color)} style={{ width: `${c.progress}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-slate-500">Spend: {c.spend}</span>
                    <span className="text-xs text-emerald-400">{c.pipeline}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Agent Activity</h3>
            <div className="space-y-2.5">
              {agentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={cn("mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0", a.status === "running" ? "bg-emerald-400" : "bg-slate-600")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-medium truncate">
                      <span className="text-violet-400">{a.agent}</span> — {a.action}
                    </p>
                    <p className="text-xs text-slate-500">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
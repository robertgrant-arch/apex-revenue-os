"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { getAll } from "@/lib/store";
import { listWorkflows } from "@/lib/workflowEngine";
import { listSequences } from "@/lib/outreachEngine";

// ─── Types (mirrors existing store shapes — extend as needed) ─────────────────

interface Campaign {
  id: string;
  name: string;
  status: string;
  vertical?: string;
  channel?: string;
  leads?: number;
  conversions?: number;
  spend?: number;
  revenue?: number;
  createdAt?: string;
}

interface Lead {
  id: string;
  status: string;
  vertical?: string;
  source?: string;
  value?: number;
  createdAt?: string;
}

interface ComplianceRecord {
  id: string;
  timestamp: string;
  score: number;
  disposition: "approve" | "escalate" | "block";
  channel?: string;
  vertical?: string;
}

interface WorkflowSummary {
  workflowId: string;
  workflowName: string;
  status: string;
  updatedAt: string;
  currentNodeId: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadComplianceHistory(): ComplianceRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("apex_compliance_history") ?? "[]");
  } catch { return []; }
}

function pct(n: number, d: number) {
  if (!d) return "0%";
  return `${Math.round((n / d) * 100)}%`;
}

function fmtCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, trend, color = "text-white"
}: {
  label: string; value: string; sub?: string;
  trend?: { value: number; label: string }; color?: string;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">{label}</p>
      <p className={cn("text-3xl font-semibold", color)}>{value}</p>
      {trend && (
        <div className={cn("flex items-center gap-1 mt-1 text-xs font-medium", trend.value >= 0 ? "text-emerald-400" : "text-red-400")}>
          <span>{trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
          <span className="text-slate-500 font-normal">{trend.label}</span>
        </div>
      )}
      {sub && !trend && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-white font-semibold text-base">{title}</h2>
      {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Workflow Status Badge ────────────────────────────────────────────────────

function WfBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
    running: "bg-blue-500/15 text-blue-300 border border-blue-500/25",
    paused: "bg-amber-500/15 text-amber-300 border border-amber-500/25",
    failed: "bg-red-500/15 text-red-300 border border-red-500/25",
    pending: "bg-slate-600/50 text-slate-400 border border-slate-600",
  };
  const dots: Record<string, string> = {
    running: "animate-pulse bg-blue-400",
    completed: "bg-emerald-400",
    paused: "bg-amber-400",
    failed: "bg-red-400",
    pending: "bg-slate-500",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium", map[status] ?? map.pending)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dots[status] ?? dots.pending)} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center mb-3 text-xl">{icon}</div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <p className="text-slate-600 text-xs mt-1">{sub}</p>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [compliance, setCompliance] = useState<ComplianceRecord[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [sequences, setSequences] = useState<ReturnType<typeof listSequences>>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCampaigns(getAll<Campaign>("campaigns") ?? []);
    setLeads(getAll<Lead>("leads") ?? []);
    setCompliance(loadComplianceHistory());
    setWorkflows(
      listWorkflows().slice(0, 10).map(w => ({
        workflowId: w.workflowId,
        workflowName: w.workflowName,
        status: w.status,
        updatedAt: w.updatedAt,
        currentNodeId: w.currentNodeId,
      }))
    );
    setSequences(listSequences().slice(0, 20));
    setLoaded(true);
  }, []);

  // ─── Computed Metrics ───────────────────────────────────────────────────────

  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const totalLeads = leads.length;
  const convertedLeads = leads.filter(l => l.status === "converted").length;
  const totalPipelineValue = campaigns.reduce((s, c) => s + (c.revenue ?? 0), 0);
  const totalSpend = campaigns.reduce((s, c) => s + (c.spend ?? 0), 0);

  const avgComplianceScore = compliance.length
    ? Math.round(compliance.reduce((s, r) => s + r.score, 0) / compliance.length)
    : null;

  const activeSequences = sequences.filter(s => s.status === "active").length;

  // ─── Chart Data ─────────────────────────────────────────────────────────────

  // Leads by vertical
  const verticalCounts: Record<string, number> = {};
  for (const lead of leads) {
    const v = lead.vertical ?? "Unknown";
    verticalCounts[v] = (verticalCounts[v] ?? 0) + 1;
  }
  const leadsByVertical = Object.entries(verticalCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Campaign performance (top 8 by leads)
  const campaignPerf = campaigns
    .filter(c => (c.leads ?? 0) > 0 || (c.conversions ?? 0) > 0)
    .sort((a, b) => (b.leads ?? 0) - (a.leads ?? 0))
    .slice(0, 8)
    .map(c => ({
      name: c.name.length > 14 ? c.name.slice(0, 13) + "…" : c.name,
      leads: c.leads ?? 0,
      conversions: c.conversions ?? 0,
    }));

  // Compliance trend (last 15)
  const complianceTrend = [...compliance]
    .slice(0, 15)
    .reverse()
    .map((r, i) => ({ i: i + 1, score: r.score }));

  // Pie colors
  const PIE_COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (!loaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin" />
          Loading dashboard…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">APEX AI Revenue Operating System</p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5">
          {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Revenue Pipeline"
          value={totalPipelineValue > 0 ? fmtCurrency(totalPipelineValue) : "—"}
          sub={totalSpend > 0 ? `${fmtCurrency(totalSpend)} spend` : "No campaigns with revenue"}
          color="text-emerald-400"
        />
        <StatCard
          label="Active Campaigns"
          value={activeCampaigns.toString()}
          sub={`${campaigns.length} total campaigns`}
          color={activeCampaigns > 0 ? "text-indigo-400" : "text-slate-400"}
        />
        <StatCard
          label="Total Leads"
          value={totalLeads.toString()}
          sub={totalLeads > 0 ? `${pct(convertedLeads, totalLeads)} conversion rate` : "No leads yet"}
          color={totalLeads > 0 ? "text-blue-400" : "text-slate-400"}
        />
        <StatCard
          label="Compliance Health"
          value={avgComplianceScore !== null ? `${avgComplianceScore}/100` : "—"}
          sub={
            avgComplianceScore === null
              ? "No checks run"
              : avgComplianceScore >= 80 ? "Healthy" : avgComplianceScore >= 50 ? "Needs Attention" : "Critical"
          }
          color={
            avgComplianceScore === null
              ? "text-slate-500"
              : avgComplianceScore >= 80 ? "text-emerald-400" : avgComplianceScore >= 50 ? "text-amber-400" : "text-red-400"
          }
        />
      </div>

      {/* Secondary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Converted Leads"
          value={convertedLeads.toString()}
          sub={totalLeads > 0 ? `${pct(convertedLeads, totalLeads)} of total` : "—"}
        />
        <StatCard
          label="Active Outreach"
          value={activeSequences.toString()}
          sub={`${sequences.length} total sequences`}
          color={activeSequences > 0 ? "text-cyan-400" : "text-slate-400"}
        />
        <StatCard
          label="Workflow Runs"
          value={workflows.length.toString()}
          sub={`${workflows.filter(w => w.status === "completed").length} completed`}
          color="text-purple-400"
        />
        <StatCard
          label="Compliance Checks"
          value={compliance.length.toString()}
          sub={`${compliance.filter(r => r.disposition === "block").length} blocked`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Leads by Vertical */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
          <SectionHeader title="Leads by Vertical" sub="Distribution across verticals" />
          {leadsByVertical.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={leadsByVertical}
                  cx="50%" cy="45%" outerRadius={72} innerRadius={36}
                  dataKey="value" paddingAngle={3}
                >
                  {leadsByVertical.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  formatter={(v) => <span className="text-slate-400 text-xs">{v}</span>}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon="📊" title="No lead data" sub="Add leads with vertical tags to see distribution" />
          )}
        </div>

        {/* Campaign Performance */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
          <SectionHeader title="Campaign Performance" sub="Leads & conversions by campaign" />
          {campaignPerf.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={campaignPerf} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="leads" name="Leads" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={28} />
                <Bar dataKey="conversions" name="Conversions" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon="📈" title="No campaign performance data" sub="Campaigns need leads and conversion fields to appear here" />
          )}
        </div>
      </div>

      {/* Compliance Trend */}
      {complianceTrend.length >= 2 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
          <SectionHeader title="Compliance Score Trend" sub="Last 15 checks" />
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={complianceTrend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="i" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [v, "Score"]}
              />
              <Line
                type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2}
                dot={(p) => {
                  const color = p.value >= 80 ? "#10b981" : p.value >= 50 ? "#f59e0b" : "#ef4444";
                  return <circle key={p.index} cx={p.cx} cy={p.cy} r={3} fill={color} />;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bottom Row: Workflows + Sequences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Workflow Runs */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl">
          <div className="px-5 py-4 border-b border-slate-700/50">
            <SectionHeader title="Recent Workflow Runs" sub="Last 10 workflow executions" />
          </div>
          {workflows.length === 0 ? (
            <EmptyState icon="⚙️" title="No workflows yet" sub="Trigger a workflow from the Agents page" />
          ) : (
            <div className="divide-y divide-slate-700/40">
              {workflows.map(wf => (
                <div key={wf.workflowId} className="flex items-center justify-between px-5 py-3 hover:bg-slate-700/20 transition-colors">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-white text-sm font-medium truncate">{wf.workflowName}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {wf.currentNodeId
                        ? `Current: ${wf.currentNodeId.replace(/_/g, " ")}`
                        : new Date(wf.updatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                      }
                    </p>
                  </div>
                  <WfBadge status={wf.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Outreach Sequences */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl">
          <div className="px-5 py-4 border-b border-slate-700/50">
            <SectionHeader title="Outreach Sequences" sub="Active contact sequences" />
          </div>
          {sequences.length === 0 ? (
            <EmptyState icon="📨" title="No outreach sequences" sub="Create sequences via the outreach engine" />
          ) : (
            <div className="divide-y divide-slate-700/40">
              {sequences.slice(0, 8).map(seq => {
                const sent = seq.totalSent;
                const blocked = seq.totalBlocked;
                const total = seq.steps.length;
                return (
                  <div key={seq.sequenceId} className="flex items-center justify-between px-5 py-3 hover:bg-slate-700/20 transition-colors">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-white text-sm font-medium truncate">{seq.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-slate-500 text-xs">{sent}/{total} sent</span>
                        {blocked > 0 && <span className="text-red-400 text-xs">{blocked} blocked</span>}
                        <span className="text-slate-600 text-xs">{seq.vertical}</span>
                      </div>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full border",
                      seq.status === "active" ? "text-emerald-300 bg-emerald-500/15 border-emerald-500/25" :
                      seq.status === "completed" ? "text-slate-400 bg-slate-700/50 border-slate-600" :
                      "text-amber-300 bg-amber-500/15 border-amber-500/25"
                    )}>
                      {seq.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Campaign Table */}
      {campaigns.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl">
          <div className="px-5 py-4 border-b border-slate-700/50">
            <SectionHeader title="Campaign Overview" sub={`${campaigns.length} total campaigns`} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {["Campaign", "Status", "Vertical", "Channel", "Leads", "Conversions", "Rate", "Revenue"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {campaigns.slice(0, 10).map(c => (
                  <tr key={c.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-3 text-white font-medium max-w-[160px] truncate">{c.name}</td>
                    <td className="px-5 py-3">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full border",
                        c.status === "active"
                          ? "text-emerald-300 bg-emerald-500/15 border-emerald-500/25"
                          : "text-slate-400 bg-slate-700/50 border-slate-600"
                      )}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{c.vertical ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs capitalize">{c.channel?.replace("_", " ") ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-300">{c.leads ?? 0}</td>
                    <td className="px-5 py-3 text-slate-300">{c.conversions ?? 0}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{pct(c.conversions ?? 0, c.leads ?? 0)}</td>
                    <td className="px-5 py-3 text-emerald-400 text-xs font-medium">
                      {c.revenue ? fmtCurrency(c.revenue) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
"use client";
import MetricCard from "@/components/ui/MetricCard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import StatusDot from "@/components/ui/StatusDot";
import TopBar from "@/components/layout/TopBar";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import ChartTooltip from "@/components/ui/ChartTooltip";

// ── Mock Data ────────────────────────────────────────────────────────────────
const stats = {
  totalLeads: 2130, leadsChange: 12.4,
  activeCampaigns: 3, campaignsChange: 0,
  revenueMtd: 64700, revenueChange: 18.2,
  conversionRate: 0.047, conversionChange: 3.1,
  appointmentsSet: 187, appointmentsChange: 8.6,
  activeAgents: 4, agentsChange: 0,
};

const recentLeads = [
  { id: "l1", firstName: "Margaret", lastName: "Thompson", vertical: "Medicare", status: "NEW", score: 94, createdAt: "2025-07-14T09:30:00Z" },
  { id: "l2", firstName: "Robert", lastName: "Kincaid", vertical: "Medicare", status: "CONTACTED", score: 88, createdAt: "2025-07-14T08:15:00Z" },
  { id: "l3", firstName: "Sandra", lastName: "Williams", vertical: "ACA", status: "QUALIFIED", score: 61, createdAt: "2025-07-13T14:20:00Z" },
  { id: "l4", firstName: "James", lastName: "Okonkwo", vertical: "Life Insurance", status: "CONTACTED", score: 79, createdAt: "2025-07-13T11:00:00Z" },
  { id: "l5", firstName: "Patricia", lastName: "Nguyen", vertical: "Final Expense", status: "QUALIFIED", score: 72, createdAt: "2025-07-12T16:45:00Z" },
];

const revenueChart = [
  { date: "Jan", revenue: 28000 }, { date: "Feb", revenue: 32000 },
  { date: "Mar", revenue: 38000 }, { date: "Apr", revenue: 35000 },
  { date: "May", revenue: 42000 }, { date: "Jun", revenue: 52000 },
  { date: "Jul", revenue: 64700 },
];

const conversionChart = [
  { vertical: "Medicare", conversions: 420 },
  { vertical: "ACA", conversions: 310 },
  { vertical: "Life", conversions: 185 },
  { vertical: "Final Exp", conversions: 145 },
  { vertical: "Dental", conversions: 90 },
];

const topCampaigns = [
  { id: "c1", name: "Q3 Medicare Advantage Push", budget: 50000, spent: 32400 },
  { id: "c2", name: "Final Expense Spring Drive", budget: 25000, spent: 24100 },
  { id: "c3", name: "ACA Open Enrollment 2025", budget: 75000, spent: 8200 },
];

const agentActivity = [
  { id: "a1", name: "LeadScorer", type: "Lead Intelligence", status: "active" as const },
  { id: "a2", name: "CampaignOptimizer", type: "Media & Spend", status: "active" as const },
  { id: "a3", name: "ComplianceGuardian", type: "Regulatory & Legal", status: "active" as const },
  { id: "a4", name: "AnalyticsEngine", type: "Insights & Reporting", status: "active" as const },
];

const metricCards = [
  { label: "Total Leads", value: stats.totalLeads.toLocaleString(), change: stats.leadsChange, color: "violet" },
  { label: "Active Campaigns", value: stats.activeCampaigns.toLocaleString(), change: stats.campaignsChange, color: "blue" },
  { label: "Revenue (MTD)", value: `$${(stats.revenueMtd / 1000).toFixed(1)}k`, change: stats.revenueChange, color: "emerald" },
  { label: "Conversion Rate", value: `${(stats.conversionRate * 100).toFixed(1)}%`, change: stats.conversionChange, color: "amber" },
  { label: "Appointments Set", value: stats.appointmentsSet.toLocaleString(), change: stats.appointmentsChange, color: "indigo" },
  { label: "AI Agents Active", value: stats.activeAgents.toLocaleString(), change: stats.agentsChange, color: "rose" },
];

const statusColors: Record<string, string> = {
  NEW: "bg-slate-500/20 text-slate-300",
  CONTACTED: "bg-blue-500/20 text-blue-300",
  QUALIFIED: "bg-violet-500/20 text-violet-300",
  APPOINTMENT_SET: "bg-amber-500/20 text-amber-300",
  WON: "bg-emerald-500/20 text-emerald-300",
  LOST: "bg-red-500/20 text-red-300",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <TopBar title="Dashboard" />
      <main className="flex-1 p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {metricCards.map((card) => (
            <MetricCard key={card.label} label={card.label} value={card.value} change={card.change} color={card.color} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Revenue Over Time</h2>
                <Badge className="bg-emerald-500/20 text-emerald-300">MTD</Badge>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b98120" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Conversions by Vertical</h2>
                <Badge className="bg-violet-500/20 text-violet-300">30d</Badge>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conversionChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="vertical" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="conversions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Recent Leads */}
          <Card className="xl:col-span-2">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Recent Leads</h2>
                <a href="/leads" className="text-xs text-emerald-400 hover:text-emerald-300">View all \u2192</a>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs uppercase">
                    {["Name", "Vertical", "Status", "Score", "Created"].map((h) => (
                      <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} className="border-t border-slate-800/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3 text-white">{lead.firstName} {lead.lastName}</td>
                      <td className="px-4 py-3 text-slate-400">{lead.vertical}</td>
                      <td className="px-4 py-3">
                        <Badge className={statusColors[lead.status] ?? "bg-slate-500/20 text-slate-300"}>
                          {lead.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${lead.score >= 80 ? "bg-emerald-500" : lead.score >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${lead.score}%` }}
                            />
                          </div>
                          <span className="text-slate-300 text-xs">{lead.score}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Top Campaigns */}
            <Card>
              <div className="p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Top Campaigns</h2>
                <div className="space-y-3">
                  {topCampaigns.map((c) => {
                    const pct = c.budget > 0 ? Math.min(100, (c.spent / c.budget) * 100) : 0;
                    return (
                      <div key={c.id} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300 truncate">{c.name}</span>
                          <span className="text-slate-500">{pct.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
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
                <h2 className="text-sm font-semibold text-white mb-4">Agent Activity</h2>
                <div className="space-y-3">
                  {agentActivity.map((agent) => (
                    <div key={agent.id} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                        <span className="text-violet-400 text-xs font-bold">{agent.name[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{agent.name}</p>
                        <p className="text-xs text-slate-500">{agent.type}</p>
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
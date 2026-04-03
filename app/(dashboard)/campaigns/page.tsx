"use client";
import { useState } from "react";
import { Search, Plus, Filter, BarChart2, DollarSign, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { ChartTooltip } from "@/components/ui/ChartTooltip";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

const CAMPAIGNS = [
  { id: 1, name: "Medicare AEP Q1 2025", vertical: "Medicare", status: "active", spend: 24200, pipeline: 312000, leads: 842, cpl: 28.74, roas: 12.9, agent: "ORACLE", start: "Jan 1", end: "Mar 31" },
  { id: 2, name: "Auto Cross-sell Spring", vertical: "Auto", status: "active", spend: 12800, pipeline: 98400, leads: 520, cpl: 24.62, roas: 7.7, agent: "SIGNAL", start: "Feb 1", end: "Apr 30" },
  { id: 3, name: "Life Insurance Push", vertical: "Life", status: "active", spend: 8400, pipeline: 67200, leads: 310, cpl: 27.10, roas: 8.0, agent: "REACH", start: "Feb 15", end: "May 15" },
  { id: 4, name: "Home Bundle Q2", vertical: "Home", status: "draft", spend: 0, pipeline: 0, leads: 0, cpl: 0, roas: 0, agent: "ARCHITECT", start: "Apr 1", end: "Jun 30" },
  { id: 5, name: "Medicare Supplement Retargeting", vertical: "Medicare", status: "paused", spend: 6200, pipeline: 48000, leads: 188, cpl: 32.98, roas: 7.7, agent: "ORACLE", start: "Jan 15", end: "Mar 15" },
  { id: 6, name: "Term Life Winback", vertical: "Life", status: "completed", spend: 4100, pipeline: 38800, leads: 142, cpl: 28.87, roas: 9.5, agent: "CONVERT", start: "Nov 1", end: "Jan 31" },
];

const spendPipelineData = [
  { name: "Medicare AEP", spend: 24200, pipeline: 312000 },
  { name: "Auto Cross-sell", spend: 12800, pipeline: 98400 },
  { name: "Life Push", spend: 8400, pipeline: 67200 },
  { name: "Med Supp Retarg", spend: 6200, pipeline: 48000 },
  { name: "Term Life Winback", spend: 4100, pipeline: 38800 },
];

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  paused: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  draft: "bg-slate-700 text-slate-400 border-slate-600",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const verticals = ["All", "Medicare", "Auto", "Life", "Home"];
const statuses = ["All", "active", "paused", "draft", "completed"];

export default function CampaignsPage() {
  const [search, setSearch] = useState("");
  const [vertical, setVertical] = useState("All");
  const [status, setStatus] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", vertical: "Medicare", budget: "", goal: "leads" });

  const filtered = CAMPAIGNS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchVertical = vertical === "All" || c.vertical === vertical;
    const matchStatus = status === "All" || c.status === status;
    return matchSearch && matchVertical && matchStatus;
  });

  const handleCreate = () => {
    if (!form.name || !form.budget) { toast.error("Please fill in all required fields"); return; }
    setModalOpen(false);
    toast.success(`Campaign "${form.name}" created`);
    setForm({ name: "", vertical: "Medicare", budget: "", goal: "leads" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaigns</h1>
          <p className="text-slate-400 text-sm mt-0.5">{CAMPAIGNS.filter(c => c.status === "active").length} active campaigns</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-400/10 rounded-lg"><DollarSign className="w-5 h-5 text-emerald-400" /></div>
          <div><p className="text-xs text-slate-400">Total Spend</p><p className="text-lg font-bold text-white">$55,700</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 bg-violet-400/10 rounded-lg"><TrendingUp className="w-5 h-5 text-violet-400" /></div>
          <div><p className="text-xs text-slate-400">Total Pipeline</p><p className="text-lg font-bold text-white">$564,400</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-400/10 rounded-lg"><BarChart2 className="w-5 h-5 text-amber-400" /></div>
          <div><p className="text-xs text-slate-400">Blended ROAS</p><p className="text-lg font-bold text-white">10.1x</p></div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Spend vs Pipeline by Campaign</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={spendPipelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="spend" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Spend" />
            <Bar dataKey="pipeline" fill="#10b981" radius={[4, 4, 0, 0]} name="Pipeline" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search campaigns..." className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-slate-500" />
          {verticals.map(v => (
            <button key={v} onClick={() => setVertical(v)} className={cn("px-2.5 py-1.5 text-xs rounded-md font-medium transition-all", vertical === v ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white")}>
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatus(s)} className={cn("px-2.5 py-1.5 text-xs rounded-md font-medium capitalize transition-all", status === s ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white")}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                {["Campaign", "Vertical", "Status", "Spend", "Pipeline", "Leads", "CPL", "ROAS", "Agent", "Dates"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3 text-sm text-white font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{c.vertical}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize border", statusColors[c.status])}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{c.spend > 0 ? `$${c.spend.toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3 text-sm text-emerald-400">{c.pipeline > 0 ? `$${c.pipeline.toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3 text-sm text-white">{c.leads > 0 ? c.leads.toLocaleString() : "—"}</td>
                  <td className="px-4 py-3 text-sm text-white">{c.cpl > 0 ? `$${c.cpl}` : "—"}</td>
                  <td className="px-4 py-3 text-sm text-amber-400">{c.roas > 0 ? `${c.roas}x` : "—"}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">{c.agent}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{c.start} → {c.end}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create New Campaign" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Campaign Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Medicare AEP Q2 2025" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Vertical *</label>
            <select value={form.vertical} onChange={e => setForm(f => ({ ...f, vertical: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50">
              {["Medicare", "Auto", "Life", "Home"].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Budget (USD) *</label>
            <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} placeholder="10000" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Primary Goal</label>
            <div className="flex gap-2">
              {["leads", "revenue", "awareness"].map(g => (
                <button key={g} onClick={() => setForm(f => ({ ...f, goal: g }))} className={cn("flex-1 py-2 text-sm rounded-lg font-medium capitalize border transition-all", form.goal === g ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white")}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 py-2 text-sm rounded-lg font-medium text-slate-400 border border-slate-700 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleCreate} className="flex-1 py-2 text-sm rounded-lg font-medium bg-emerald-500 hover:bg-emerald-400 text-white transition-colors">Create Campaign</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
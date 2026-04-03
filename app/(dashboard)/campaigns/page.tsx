"use client";
import { useState } from "react";
import {
  Plus, ChevronDown, ChevronRight, Edit2, FlaskConical,
  Users, Download, TrendingUp, DollarSign, Target, Activity
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Toast, useToast } from "@/components/ui/Toast";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Campaign {
  id: string;
  name: string;
  vertical: string;
  budget: number;
  spent: number;
  startDate: string;
  status: "active" | "paused" | "draft" | "completed";
  leads: number;
  cpl: number;
  experiments: Experiment[];
}

interface Experiment {
  id: string;
  hypothesis: string;
  variable: string;
  control: string;
  variant: string;
  status: "running" | "completed" | "planned";
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: "camp1", name: "Q3 Medicare Advantage Push", vertical: "Medicare",
    budget: 50000, spent: 32400, startDate: "2025-07-01", status: "active",
    leads: 1240, cpl: 26.13,
    experiments: [
      { id: "e1", hypothesis: "Urgency-based CTAs increase conversion", variable: "CTA copy", control: "Learn More", variant: "Enroll Today — Limited Spots", status: "running" },
      { id: "e2", hypothesis: "Short-form video outperforms static images", variable: "Ad format", control: "Static banner", variant: "15-second video", status: "completed" },
    ]
  },
  {
    id: "camp2", name: "ACA Open Enrollment 2025", vertical: "ACA",
    budget: 75000, spent: 8200, startDate: "2025-11-01", status: "draft",
    leads: 0, cpl: 0, experiments: []
  },
  {
    id: "camp3", name: "Final Expense Spring Drive", vertical: "Final Expense",
    budget: 25000, spent: 24100, startDate: "2025-04-01", status: "completed",
    leads: 890, cpl: 27.08, experiments: [
      { id: "e3", hypothesis: "Phone number in ad copy lifts call rate", variable: "Ad copy element", control: "No phone", variant: "Phone in headline", status: "completed" }
    ]
  },
];

const VERTICALS = ["Medicare", "ACA", "Life Insurance", "Final Expense", "Auto", "Home"];
const STATUSES = ["active", "paused", "draft", "completed"];

// ── Helpers ────────────────────────────────────────────────────────────────────
const statusColor = (s: Campaign["status"]) => {
  const m = { active: "emerald", paused: "amber", draft: "slate", completed: "blue" };
  return m[s] || "slate";
};

const expStatusColor = (s: Experiment["status"]) => {
  if (s === "running") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (s === "completed") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  return "bg-slate-500/10 text-slate-400 border-slate-500/20";
};

function exportLeadsCSV(campaign: Campaign) {
  const rows = [
    ["Lead ID", "Campaign", "Vertical", "Status", "CPL", "Date"],
    ...Array.from({ length: Math.min(campaign.leads, 10) }, (_, i) => [
      `L${campaign.id}-${String(i + 1).padStart(4, "0")}`,
      campaign.name,
      campaign.vertical,
      "Contacted",
      `$${campaign.cpl.toFixed(2)}`,
      campaign.startDate,
    ]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${campaign.name.replace(/\s+/g, "_")}_leads.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function CampaignsPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Modals
  const [newCampOpen, setNewCampOpen] = useState(false);
  const [editCampOpen, setEditCampOpen] = useState(false);
  const [newExpOpen, setNewExpOpen] = useState(false);
  const [viewExpsOpen, setViewExpsOpen] = useState(false);
  const [viewLeadsOpen, setViewLeadsOpen] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);

  // Campaign form
  const emptyForm = { name: "", vertical: "Medicare", budget: "", startDate: "", status: "active" };
  const [campForm, setCampForm] = useState(emptyForm);

  // Experiment form
  const emptyExp = { hypothesis: "", variable: "", control: "", variant: "" };
  const [expForm, setExpForm] = useState(emptyExp);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const openEdit = (camp: Campaign) => {
    setActiveCampaign(camp);
    setCampForm({ name: camp.name, vertical: camp.vertical, budget: String(camp.budget), startDate: camp.startDate, status: camp.status });
    setEditCampOpen(true);
  };

  const handleNewCampaign = () => {
    if (!campForm.name.trim()) { addToast("Campaign name is required", "error"); return; }
    if (!campForm.budget || isNaN(Number(campForm.budget))) { addToast("Valid budget is required", "error"); return; }
    if (!campForm.startDate) { addToast("Start date is required", "error"); return; }
    const nc: Campaign = {
      id: `camp${Date.now()}`, name: campForm.name, vertical: campForm.vertical,
      budget: Number(campForm.budget), spent: 0, startDate: campForm.startDate,
      status: campForm.status as Campaign["status"], leads: 0, cpl: 0, experiments: [],
    };
    setCampaigns((p) => [nc, ...p]);
    setNewCampOpen(false);
    setCampForm(emptyForm);
    addToast(`Campaign "${nc.name}" created`, "success");
  };

  const handleEditCampaign = () => {
    if (!campForm.name.trim()) { addToast("Name is required", "error"); return; }
    if (!activeCampaign) return;
    setCampaigns((p) =>
      p.map((c) =>
        c.id === activeCampaign.id
          ? { ...c, name: campForm.name, vertical: campForm.vertical, budget: Number(campForm.budget), startDate: campForm.startDate, status: campForm.status as Campaign["status"] }
          : c
      )
    );
    setEditCampOpen(false);
    addToast("Campaign updated", "success");
  };

  const handleNewExperiment = () => {
    if (!expForm.hypothesis.trim()) { addToast("Hypothesis is required", "error"); return; }
    if (!expForm.variable.trim()) { addToast("Variable is required", "error"); return; }
    if (!activeCampaign) return;
    const newExp: Experiment = {
      id: `exp${Date.now()}`, ...expForm, status: "planned",
    };
    setCampaigns((p) =>
      p.map((c) =>
        c.id === activeCampaign.id ? { ...c, experiments: [...c.experiments, newExp] } : c
      )
    );
    setNewExpOpen(false);
    setExpForm(emptyExp);
    addToast("Experiment added", "success");
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const totalBudget = campaigns.reduce((a, c) => a + c.budget, 0);
  const totalSpent = campaigns.reduce((a, c) => a + c.spent, 0);
  const totalLeads = campaigns.reduce((a, c) => a + c.leads, 0);
  const avgCpl = totalLeads > 0 ? totalSpent / totalLeads : 0;

  return (
    <div className="p-6 space-y-6">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaigns</h1>
          <p className="text-slate-400 text-sm mt-1">Manage campaigns and run experiments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setActiveCampaign(null); setExpForm(emptyExp); setNewExpOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-sm"
          >
            <FlaskConical size={16} />
            New Experiment
          </button>
          <button
            onClick={() => { setCampForm(emptyForm); setNewCampOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-all text-sm font-medium"
          >
            <Plus size={16} />
            New Campaign
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Budget", value: `$${totalBudget.toLocaleString()}`, icon: <DollarSign size={18} />, color: "violet" },
          { label: "Total Spent", value: `$${totalSpent.toLocaleString()}`, icon: <TrendingUp size={18} />, color: "amber" },
          { label: "Total Leads", value: totalLeads.toLocaleString(), icon: <Users size={18} />, color: "blue" },
          { label: "Avg CPL", value: `$${avgCpl.toFixed(2)}`, icon: <Target size={18} />, color: "emerald" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg bg-${s.color}-500/10 flex items-center justify-center text-${s.color}-400 mb-3`}>
              {s.icon}
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Campaign Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-sm font-semibold text-white">All Campaigns</h2>
        </div>
        <div className="divide-y divide-slate-700/30">
          {campaigns.map((camp) => {
            const isExpanded = expanded === camp.id;
            const pctSpent = Math.min((camp.spent / camp.budget) * 100, 100);
            const sc = statusColor(camp.status);
            return (
              <div key={camp.id}>
                {/* Row */}
                <div
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-700/20 cursor-pointer transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : camp.id)}
                >
                  <div className="text-slate-500">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{camp.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{camp.vertical} · Started {camp.startDate}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs border bg-${sc}-500/10 text-${sc}-400 border-${sc}-500/20 capitalize`}>
                    {camp.status}
                  </span>
                  <div className="text-right hidden md:block">
                    <div className="text-sm text-white">${camp.spent.toLocaleString()} / ${camp.budget.toLocaleString()}</div>
                    <div className="w-24 h-1.5 bg-slate-700 rounded-full mt-1.5">
                      <div className={`h-full bg-${sc}-500 rounded-full`} style={{ width: `${pctSpent}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">{camp.leads.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">leads</div>
                  </div>
                </div>

                {/* Expanded Row */}
                {isExpanded && (
                  <div className="px-6 pb-5 bg-slate-900/30 border-t border-slate-700/30">
                    <div className="flex flex-wrap gap-2 pt-4">
                      <button
                        onClick={() => openEdit(camp)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700 text-xs transition-all"
                      >
                        <Edit2 size={13} /> Edit Campaign
                      </button>
                      <button
                        onClick={() => { setActiveCampaign(camp); setViewExpsOpen(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700 text-xs transition-all"
                      >
                        <FlaskConical size={13} /> View Experiments ({camp.experiments.length})
                      </button>
                      <button
                        onClick={() => { setActiveCampaign(camp); setViewLeadsOpen(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700 text-xs transition-all"
                      >
                        <Users size={13} /> View Leads ({camp.leads.toLocaleString()})
                      </button>
                      <button
                        onClick={() => { exportLeadsCSV(camp); addToast(`Exporting ${camp.name} report…`, "info"); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700 text-xs transition-all"
                      >
                        <Download size={13} /> Export Report
                      </button>
                      <button
                        onClick={() => { setActiveCampaign(camp); setExpForm(emptyExp); setNewExpOpen(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 border border-violet-500/20 text-xs transition-all"
                      >
                        <FlaskConical size={13} /> New Experiment
                      </button>
                    </div>

                    {/* Experiment chips */}
                    {camp.experiments.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {camp.experiments.map((exp) => (
                          <div key={exp.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${expStatusColor(exp.status)}`}>
                            <Activity size={11} />
                            {exp.hypothesis.slice(0, 40)}{exp.hypothesis.length > 40 ? "…" : ""}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── New / Edit Campaign Modal ─────────────────────────────────────── */}
      {[
        { open: newCampOpen, setOpen: setNewCampOpen, title: "New Campaign", onSave: handleNewCampaign },
        { open: editCampOpen, setOpen: setEditCampOpen, title: "Edit Campaign", onSave: handleEditCampaign },
      ].map(({ open, setOpen, title, onSave }) => (
        <Modal key={title} open={open} onClose={() => setOpen(false)} title={title} width="max-w-xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Campaign Name <span className="text-red-400">*</span></label>
              <input
                value={campForm.name}
                onChange={(e) => setCampForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Q4 Medicare Advantage"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Vertical</label>
                <select
                  value={campForm.vertical}
                  onChange={(e) => setCampForm((p) => ({ ...p, vertical: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                >
                  {VERTICALS.map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Status</label>
                <select
                  value={campForm.status}
                  onChange={(e) => setCampForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Budget ($) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  value={campForm.budget}
                  onChange={(e) => setCampForm((p) => ({ ...p, budget: e.target.value }))}
                  placeholder="50000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Start Date <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  value={campForm.startDate}
                  onChange={(e) => setCampForm((p) => ({ ...p, startDate: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">Cancel</button>
              <button onClick={onSave} className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all">
                {title === "New Campaign" ? "Create Campaign" : "Save Changes"}
              </button>
            </div>
          </div>
        </Modal>
      ))}

      {/* ── New Experiment Modal ──────────────────────────────────────────── */}
      <Modal open={newExpOpen} onClose={() => setNewExpOpen(false)} title="New Experiment" width="max-w-xl">
        <div className="space-y-4">
          {activeCampaign && (
            <div className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700/50 text-xs text-slate-400">
              Campaign: <span className="text-white">{activeCampaign.name}</span>
            </div>
          )}
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Hypothesis <span className="text-red-400">*</span></label>
            <textarea
              value={expForm.hypothesis}
              onChange={(e) => setExpForm((p) => ({ ...p, hypothesis: e.target.value }))}
              rows={2}
              placeholder="e.g. Urgency-based CTAs will increase enrollment conversion by 15%"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Variable Being Tested <span className="text-red-400">*</span></label>
            <input
              value={expForm.variable}
              onChange={(e) => setExpForm((p) => ({ ...p, variable: e.target.value }))}
              placeholder="e.g. CTA copy, Ad format, Landing page headline"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Control (A)</label>
              <input
                value={expForm.control}
                onChange={(e) => setExpForm((p) => ({ ...p, control: e.target.value }))}
                placeholder="e.g. Learn More"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Variant (B)</label>
              <input
                value={expForm.variant}
                onChange={(e) => setExpForm((p) => ({ ...p, variant: e.target.value }))}
                placeholder="e.g. Enroll Today"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setNewExpOpen(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">Cancel</button>
            <button onClick={handleNewExperiment} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all">
              <FlaskConical size={15} /> Add Experiment
            </button>
          </div>
        </div>
      </Modal>

      {/* ── View Experiments Modal ────────────────────────────────────────── */}
      <Modal open={viewExpsOpen} onClose={() => setViewExpsOpen(false)} title={`Experiments — ${activeCampaign?.name ?? ""}`} width="max-w-2xl">
        <div className="space-y-3">
          {activeCampaign?.experiments.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-8">No experiments yet for this campaign.</p>
          )}
          {activeCampaign?.experiments.map((exp) => (
            <div key={exp.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{exp.hypothesis}</p>
                  <p className="text-xs text-slate-500 mt-1">Variable: {exp.variable}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs border ${expStatusColor(exp.status)} capitalize shrink-0`}>{exp.status}</span>
              </div>
              {(exp.control || exp.variant) && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {exp.control && (
                    <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="text-xs text-blue-400 mb-0.5">Control (A)</div>
                      <div className="text-xs text-white">{exp.control}</div>
                    </div>
                  )}
                  {exp.variant && (
                    <div className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <div className="text-xs text-purple-400 mb-0.5">Variant (B)</div>
                      <div className="text-xs text-white">{exp.variant}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>

      {/* ── View Leads Modal ──────────────────────────────────────────────── */}
      <Modal open={viewLeadsOpen} onClose={() => setViewLeadsOpen(false)} title={`Leads — ${activeCampaign?.name ?? ""}`} width="max-w-2xl">
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">{activeCampaign?.leads.toLocaleString()} total leads</span>
            <button
              onClick={() => { if (activeCampaign) { exportLeadsCSV(activeCampaign); addToast("CSV export started", "success"); }}}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 hover:text-white text-xs transition-all"
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-700/50">
                  <th className="pb-2 font-medium">Lead ID</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">CPL</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {Array.from({ length: Math.min(activeCampaign?.leads ?? 0, 8) }, (_, i) => (
                  <tr key={i} className="text-slate-300">
                    <td className="py-2 font-mono text-xs">{`L${activeCampaign?.id}-${String(i + 1).padStart(4, "0")}`}</td>
                    <td className="py-2"><span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs">Contacted</span></td>
                    <td className="py-2">${activeCampaign?.cpl.toFixed(2)}</td>
                    <td className="py-2 text-slate-500">{activeCampaign?.startDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}
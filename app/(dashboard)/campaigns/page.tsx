"use client";

import { useState, useEffect, useCallback } from "react";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import * as store from "@/lib/store";

interface Campaign {
  id: string; name: string; vertical: string; budget: number; spent: number;
  goal: string; status: string; startDate: string; endDate: string;
  leads: number; revenue: number; createdAt: string;
}

const KEY = "campaigns";
const VERTICALS = ["Medicare", "Auto", "Life", "Home"];
const STATUSES = ["active", "paused", "draft", "completed"];
const GOALS = ["leads", "revenue", "awareness"];
const STATUS_COLORS: Record<string, string> = { active: "bg-emerald-500/20 text-emerald-400", paused: "bg-amber-500/20 text-amber-400", draft: "bg-slate-500/20 text-slate-400", completed: "bg-blue-500/20 text-blue-400" };

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [sFilter, setSFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", vertical: "Medicare", budget: "", goal: "leads", startDate: "", endDate: "" });

  const load = useCallback(() => setCampaigns(store.getAll<Campaign>(KEY)), []);
  useEffect(() => { load(); }, [load]);

  const filtered = campaigns.filter(c => {
    const q = search.toLowerCase();
    return (!q || c.name.toLowerCase().includes(q)) && (sFilter === "All" || c.status === sFilter);
  });

  function handleCreate() {
    if (!form.name || !form.budget) return;
    store.create<Campaign>(KEY, { id: `camp-${Date.now()}`, name: form.name, vertical: form.vertical, budget: Number(form.budget), spent: 0, goal: form.goal, status: "draft", startDate: form.startDate, endDate: form.endDate, leads: 0, revenue: 0, createdAt: new Date().toISOString() });
    setForm({ name: "", vertical: "Medicare", budget: "", goal: "leads", startDate: "", endDate: "" });
    setShowModal(false); load();
  }

  function handleStatus(id: string, status: string) { store.update<Campaign>(KEY, id, { status }); load(); }
  function handleDelete(id: string) { store.remove(KEY, id); load(); }

  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div><h1 className="text-2xl font-bold">Campaigns</h1><p className="text-slate-400 text-sm mt-1">Manage your marketing campaigns</p></div>
          <button onClick={() => setShowModal(true)} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold">Create Campaign</button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[{ l: "Total Campaigns", v: campaigns.length }, { l: "Active", v: activeCampaigns }, { l: "Total Budget", v: `$${totalBudget.toLocaleString()}` }, { l: "Total Spent", v: `$${totalSpent.toLocaleString()}` }].map(s => (
            <Card key={s.l} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <div className="text-xs text-slate-500 uppercase mb-2">{s.l}</div>
              <div className="text-2xl font-bold text-emerald-400">{s.v}</div>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-slate-500" />
          <select value={sFilter} onChange={e => setSFilter(e.target.value)} className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm">
            <option>All</option>{STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16"><div className="text-4xl mb-4">&#x1f4e2;</div><h3 className="text-lg font-semibold text-white mb-2">No campaigns yet</h3><p className="text-slate-400 text-sm">Create your first campaign to get started.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(c => {
              const pct = c.budget > 0 ? Math.min((c.spent / c.budget) * 100, 100) : 0;
              return (
                <div key={c.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div><p className="text-sm font-semibold text-white">{c.name}</p><p className="text-xs text-slate-500">{c.vertical} &middot; {c.goal}</p></div>
                    <select value={c.status} onChange={e => handleStatus(c.id, e.target.value)} className="text-xs bg-slate-700 text-slate-300 rounded px-1 py-0.5">
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div><div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Budget</span><span className="text-white">{pct.toFixed(0)}%</span></div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className={cn("h-full rounded-full", pct > 90 ? "bg-red-500" : "bg-emerald-500")} style={{width: `${pct}%`}} /></div>
                    <div className="flex justify-between text-xs mt-1"><span className="text-slate-500">${c.spent.toLocaleString()} spent</span><span className="text-slate-500">${c.budget.toLocaleString()} budget</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50 text-xs">
                    <div><span className="text-slate-500">Leads: </span><span className="text-white font-semibold">{c.leads}</span></div>
                    <div><span className="text-slate-500">Revenue: </span><span className="text-emerald-400 font-semibold">${c.revenue.toLocaleString()}</span></div>
                  </div>
                  <button onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:text-red-300 self-end">Delete</button>
                </div>
              );
            })}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
            <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Create Campaign</h3>
              <div className="space-y-3">
                <input placeholder="Campaign name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm" />
                <select value={form.vertical} onChange={e => setForm({...form, vertical: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm">
                  {VERTICALS.map(v => <option key={v}>{v}</option>)}
                </select>
                <input type="number" placeholder="Budget ($)" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm" />
                <select value={form.goal} onChange={e => setForm({...form, goal: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm">
                  {GOALS.map(g => <option key={g}>{g}</option>)}
                </select>
                <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm" />
                <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm">Cancel</button>
                <button onClick={handleCreate} className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-sm">Create</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
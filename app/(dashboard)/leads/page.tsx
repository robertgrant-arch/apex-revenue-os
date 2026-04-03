"use client";

import { useState, useEffect, useCallback } from "react";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import * as store from "@/lib/store";

interface Lead {
  id: string; name: string; email: string; phone: string;
  vertical: string; source: string; value: number; score: number;
  status: string; createdAt: string;
}

const KEY = "leads";
const VERTICALS = ["Medicare", "Auto", "Life", "Home"];
const STATUSES = ["new", "contacted", "qualified", "converted", "lost"];
const STATUS_COLORS: Record<string, string> = { new: "bg-blue-500/20 text-blue-400", contacted: "bg-amber-500/20 text-amber-400", qualified: "bg-emerald-500/20 text-emerald-400", converted: "bg-violet-500/20 text-violet-400", lost: "bg-red-500/20 text-red-400" };

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [vFilter, setVFilter] = useState("All");
  const [sFilter, setSFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", vertical: "Medicare", source: "", value: "", score: "0" });

  const load = useCallback(() => setLeads(store.getAll<Lead>(KEY)), []);
  useEffect(() => { load(); }, [load]);

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    return (!q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)) &&
      (vFilter === "All" || l.vertical === vFilter) && (sFilter === "All" || l.status === sFilter);
  });

  function handleCreate() {
    if (!form.name) return;
    store.create<Lead>(KEY, { id: `lead-${Date.now()}`, name: form.name, email: form.email, phone: form.phone, vertical: form.vertical, source: form.source, value: Number(form.value) || 0, score: Number(form.score) || 0, status: "new", createdAt: new Date().toISOString() });
    setForm({ name: "", email: "", phone: "", vertical: "Medicare", source: "", value: "", score: "0" });
    setShowModal(false); load();
  }

  function handleStatus(id: string, status: string) { store.update<Lead>(KEY, id, { status }); load(); }
  function handleDelete(id: string) { store.remove(KEY, id); load(); }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div><h1 className="text-2xl font-bold">Leads</h1><p className="text-slate-400 text-sm mt-1">Manage your lead pipeline</p></div>
          <button onClick={() => setShowModal(true)} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold">Add Lead</button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[{ l: "Total Leads", v: leads.length }, { l: "Qualified", v: leads.filter(l => l.status === "qualified").length }, { l: "Converted", v: leads.filter(l => l.status === "converted").length }, { l: "Pipeline Value", v: `$${leads.reduce((s, l) => s + l.value, 0).toLocaleString()}` }].map(s => (
            <Card key={s.l} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <div className="text-xs text-slate-500 uppercase mb-2">{s.l}</div>
              <div className="text-2xl font-bold text-emerald-400">{s.v}</div>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-slate-500" />
          <select value={vFilter} onChange={e => setVFilter(e.target.value)} className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm">
            <option>All</option>{VERTICALS.map(v => <option key={v}>{v}</option>)}
          </select>
          <select value={sFilter} onChange={e => setSFilter(e.target.value)} className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm">
            <option>All</option>{STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16"><div className="text-4xl mb-4">&#x1f465;</div><h3 className="text-lg font-semibold text-white mb-2">No leads yet</h3><p className="text-slate-400 text-sm">Add your first lead to get started.</p></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-slate-700">
              {["Name", "Email", "Vertical", "Score", "Value", "Status", ""].map(h => <th key={h} className="text-left text-slate-500 py-3 px-3 text-xs uppercase">{h}</th>)}
            </tr></thead>
            <tbody>{filtered.map(l => (
              <tr key={l.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="py-3 px-3 text-white font-medium">{l.name}</td>
                <td className="py-3 px-3 text-slate-400">{l.email}</td>
                <td className="py-3 px-3 text-slate-400">{l.vertical}</td>
                <td className="py-3 px-3"><span className={cn("font-semibold", l.score >= 80 ? "text-emerald-400" : l.score >= 50 ? "text-amber-400" : "text-slate-400")}>{l.score}</span></td>
                <td className="py-3 px-3 text-slate-300">${l.value.toLocaleString()}</td>
                <td className="py-3 px-3"><select value={l.status} onChange={e => handleStatus(l.id, e.target.value)} className="text-xs bg-slate-700 text-slate-300 rounded px-2 py-1">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select></td>
                <td className="py-3 px-3"><button onClick={() => handleDelete(l.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
            <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Add Lead</h3>
              <div className="space-y-3">
                <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm" />
                <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm" />
                <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm" />
                <select value={form.vertical} onChange={e => setForm({...form, vertical: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm">
                  {VERTICALS.map(v => <option key={v}>{v}</option>)}
                </select>
                <input placeholder="Source (Google, Meta, etc.)" value={form.source} onChange={e => setForm({...form, source: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm" />
                <input type="number" placeholder="Value ($)" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm" />
                <input type="number" placeholder="Score (0-100)" value={form.score} onChange={e => setForm({...form, score: e.target.value})} min="0" max="100" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm">Cancel</button>
                <button onClick={handleCreate} className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-sm">Add Lead</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
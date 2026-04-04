"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Card from "@/components/ui/Card";
import { ChartTooltip } from "@/components/ui/ChartTooltip";
import { cn } from "@/lib/utils";
import * as store from "@/lib/store";
import { saveImage, getImage, deleteImage } from "@/lib/imageStore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";

type AdType = "image" | "email" | "video";
type Status = "active" | "paused" | "draft";
type Vertical = "Medicare" | "Auto" | "Life" | "Home";

interface Creative {
  id: string; vertical: string; type: AdType; headline: string; body: string;
  cta: string; imageDescription: string; predictedCTR: number;
  actualCTR: number | null; impressions: number; clicks: number;
  status: Status; createdAt: string; generated?: boolean; imageUrl?: string;
  hasImage?: boolean;
}

const KEY = "creatives";
const VERTICALS: Vertical[] = ["Medicare", "Auto", "Life", "Home"];
const AD_TYPES: AdType[] = ["image", "email", "video"];
const STATUSES: Status[] = ["active", "paused", "draft"];
const TYPE_COLORS: Record<string, string> = { image: "bg-emerald-500/20 text-emerald-400", email: "bg-violet-500/20 text-violet-400", video: "bg-amber-500/20 text-amber-400" };
const STATUS_COLORS: Record<string, string> = { active: "bg-emerald-500/20 text-emerald-400", paused: "bg-amber-500/20 text-amber-400", draft: "bg-slate-500/20 text-slate-400" };

function fmt(n: number) { return n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : String(n); }

function CreativeDetailModal({ creative: c, onClose }: { creative: Creative; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-700/50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-blue-400">{c.vertical}</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full", TYPE_COLORS[c.type])}>{c.type}</span>
            {c.generated && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400">AI</span>}
            <span className={cn("text-xs px-2 py-0.5 rounded-full", STATUS_COLORS[c.status])}>{c.status}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors">\u00d7</button>
        </div>
        <div className="p-6 space-y-6">
          {/* Image or placeholder */}
          <div className="w-full rounded-xl overflow-hidden border border-slate-700/50">
            {c.imageUrl ? (
              <img src={c.imageUrl} alt={c.headline} className="w-full h-64 object-cover" />
            ) : (
              <div className="w-full h-64 bg-slate-800 flex flex-col items-center justify-center p-6">
                <div className="text-4xl mb-3">\ud83d\uddbc\ufe0f</div>
                <p className="text-sm text-slate-400 text-center italic">{c.imageDescription}</p>
              </div>
            )}
          </div>
          {/* Copy */}
          <div><div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Headline</div><div className="text-lg font-bold text-white">{c.headline}</div></div>
          <div><div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Body Copy</div><div className="text-sm text-slate-300 leading-relaxed">{c.body}</div></div>
          <div><div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Call to Action</div><span className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold">{c.cta}</span></div>
          <div><div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Image Description</div><div className="text-sm text-slate-400 italic">{c.imageDescription}</div></div>
          {/* Performance stats */}
          <div><div className="text-xs text-slate-500 uppercase tracking-wide mb-3">Performance</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[{ label: "Impressions", value: fmt(c.impressions), color: "text-blue-400" }, { label: "Clicks", value: fmt(c.clicks), color: "text-white" }, { label: "Predicted CTR", value: `${c.predictedCTR.toFixed(2)}%`, color: "text-violet-400" }, { label: "Actual CTR", value: c.actualCTR !== null ? `${c.actualCTR.toFixed(2)}%` : "\u2014", color: "text-emerald-400" }].map(s => (
                <div key={s.label} className="bg-slate-800/50 rounded-lg p-3"><div className="text-xs text-slate-500 mb-1">{s.label}</div><div className={cn("text-lg font-bold", s.color)}>{s.value}</div></div>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-500">Created{" "}<span className="text-slate-400">{new Date(c.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>
          <div className="text-xs text-slate-600">ID: {c.id}</div>
        </div>
      </div>
    </div>
  );
}

function GenerateModal({ onClose, onGenerated }: { onClose: () => void; onGenerated: (c: Creative) => void }) {
  const [vertical, setVertical] = useState<Vertical>("Medicare");
  const [type, setType] = useState<AdType>("image");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/generate-creative", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vertical, type, prompt: prompt || undefined }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      const creative = { ...data, status: "active", impressions: 0, clicks: 0, actualCTR: null, generated: true } as Creative;
      // Save image to IndexedDB, metadata to localStorage
      const { imageUrl, ...creativeToStore } = creative;
      if (imageUrl) {
        await saveImage(creative.id, imageUrl);
        store.create(KEY, { ...creativeToStore, hasImage: true });
      } else {
        store.create(KEY, creativeToStore);
      }
      onGenerated(creative);
      onClose();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Unknown error"); } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-6"><div><h3 className="text-lg font-bold text-white">Generate Creative</h3><p className="text-xs text-slate-400 mt-0.5">AI-powered ad copy</p></div><button onClick={onClose} className="text-slate-400 hover:text-white">X</button></div>
        <div className="mb-4"><label className="block text-xs text-slate-500 mb-1">Vertical</label><select value={vertical} onChange={e => setVertical(e.target.value as Vertical)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm">{VERTICALS.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
        <div className="mb-4"><label className="block text-xs text-slate-500 mb-1">Ad Type</label><div className="grid grid-cols-3 gap-2">{AD_TYPES.map(t => (<button key={t} onClick={() => setType(t)} className={cn("py-2 rounded-lg text-sm font-medium capitalize border", type === t ? "bg-emerald-600 border-emerald-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400")}>{t}</button>))}</div></div>
        <div className="mb-6"><label className="block text-xs text-slate-500 mb-1">Context (optional)</label><textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm resize-none" /></div>
        {error && <div className="mb-4 p-2 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-400">{error}</div>}
        <div className="flex gap-3"><button onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm">Cancel</button><button onClick={handleGenerate} disabled={loading} className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm">{loading ? "Generating..." : "Generate"}</button></div>
      </div>
    </div>
  );
}

export default function CreativePage() {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AdType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);

  const load = useCallback(async () => {
    const stored = store.getAll<Creative>(KEY);
    const withImages = await Promise.all(stored.map(async (c) => {
      if (!c.hasImage) return c;
      const img = await getImage(c.id);
      return img ? { ...c, imageUrl: img } : c;
    }));
    setCreatives(withImages);
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => creatives.filter(c => {
    const q = search.toLowerCase();
    return (!q || c.headline.toLowerCase().includes(q) || c.body.toLowerCase().includes(q)) &&
      (typeFilter === "all" || c.type === typeFilter) &&
      (statusFilter === "all" || c.status === statusFilter);
  }), [creatives, search, typeFilter, statusFilter]);

  const chartData = useMemo(() => filtered.filter(c => c.actualCTR !== null).slice(0, 8).map(c => ({
    name: c.headline.length > 20 ? c.headline.slice(0, 20) + "..." : c.headline,
    predicted: c.predictedCTR, actual: c.actualCTR,
  })), [filtered]);

  const stats = useMemo(() => {
    const active = creatives.filter(c => c.status === "active");
    const ti = active.reduce((s, c) => s + c.impressions, 0);
    const tc = active.reduce((s, c) => s + c.clicks, 0);
    const ap = creatives.length ? creatives.reduce((s, c) => s + c.predictedCTR, 0) / creatives.length : 0;
    const wa = creatives.filter(c => c.actualCTR !== null);
    const aa = wa.length ? wa.reduce((s, c) => s + (c.actualCTR ?? 0), 0) / wa.length : 0;
    return { ti, tc, ap, aa };
  }, [creatives]);

  async function handleDelete(id: string) {
    store.remove(KEY, id);
    await deleteImage(id);
    load();
  }

  function handleStatus(id: string, status: Status) {
    store.update<Creative>(KEY, id, { status });
    load();
  }

  async function handleCardClick(c: Creative) {
    if (c.hasImage && !c.imageUrl) {
      const img = await getImage(c.id);
      setSelectedCreative(img ? { ...c, imageUrl: img } : c);
    } else {
      setSelectedCreative(c);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div><h1 className="text-2xl font-bold">Creative Studio</h1><p className="text-slate-400 text-sm mt-1">Manage and generate AI-powered ad creatives</p></div>
          <button onClick={() => setShowModal(true)} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold">Generate Creative</button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[{ l: "Total Impressions", v: fmt(stats.ti), c: "text-blue-400" }, { l: "Total Clicks", v: fmt(stats.tc), c: "text-emerald-400" }, { l: "Avg Predicted CTR", v: `${stats.ap.toFixed(2)}%`, c: "text-violet-400" }, { l: "Avg Actual CTR", v: `${stats.aa.toFixed(2)}%`, c: "text-amber-400" }].map(s => (
            <Card key={s.l} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5"><div className="text-xs text-slate-500 uppercase tracking-wide mb-2">{s.l}</div><div className={cn("text-2xl font-bold", s.c)}>{s.v}</div></Card>
          ))}
        </div>

        {chartData.length > 0 && (
          <Card className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Predicted vs Actual CTR</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} /><YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} /><Legend />
                <Bar dataKey="predicted" name="Predicted" fill="#8b5cf6" radius={[4,4,0,0]} />
                <Bar dataKey="actual" name="Actual" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Search creatives..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-slate-500" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as AdType | "all")} className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm"><option value="all">All Types</option>{AD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as Status | "all")} className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm"><option value="all">All Status</option>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16"><div className="text-4xl mb-4">\ud83c\udfa8</div><h3 className="text-lg font-semibold text-white mb-2">No creatives yet</h3><p className="text-slate-400 text-sm">Click Generate Creative to create your first AI-powered ad.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(c => (
              <div key={c.id} onClick={() => handleCardClick(c)} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex flex-col gap-3 cursor-pointer hover:border-emerald-500/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-blue-400">{c.vertical}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", TYPE_COLORS[c.type])}>{c.type}</span>
                    {c.generated && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400">AI</span>}
                  </div>
                  <select value={c.status} onClick={e => e.stopPropagation()} onChange={e => { e.stopPropagation(); handleStatus(c.id, e.target.value as Status); }} className="text-xs bg-slate-700 border-none text-slate-300 rounded px-1 py-0.5">{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                </div>
                <p className="text-sm font-semibold text-white line-clamp-2">{c.headline}</p>
                <p className="text-xs text-slate-400 line-clamp-2">{c.body}</p>
                <div className="text-xs text-emerald-400">CTA: {c.cta}</div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/50 text-xs">
                  <div><div className="text-slate-500">Impressions</div><div className="font-semibold text-white">{fmt(c.impressions)}</div></div>
                  <div><div className="text-slate-500">Pred. CTR</div><div className="font-semibold text-violet-400">{c.predictedCTR.toFixed(1)}%</div></div>
                  <div><div className="text-slate-500">Actual CTR</div><div className="font-semibold text-emerald-400">{c.actualCTR !== null ? `${c.actualCTR.toFixed(1)}%` : "--"}</div></div>
                </div>
                <button onClick={e => { e.stopPropagation(); handleDelete(c.id); }} className="text-xs text-red-400 hover:text-red-300 self-end mt-1">Delete</button>
              </div>
            ))}
          </div>
        )}

        {showModal && <GenerateModal onClose={() => setShowModal(false)} onGenerated={() => load()} />}
        {selectedCreative && <CreativeDetailModal creative={selectedCreative} onClose={() => setSelectedCreative(null)} />}
      </div>
    </div>
  );
}
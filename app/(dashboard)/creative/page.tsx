"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Card from "@/components/ui/Card";
import { ChartTooltip } from "@/components/ui/ChartTooltip";
import { cn } from "@/lib/utils";
import * as store from "@/lib/store";
import { saveImage, getImage, deleteImage } from "@/lib/imageStore";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend,
} from "recharts";

type AdType  = "image" | "email" | "video";
type Status  = "active" | "paused" | "draft";
type Vertical = "Medicare" | "Auto" | "Life" | "Home";

interface Creative {
  id: string; vertical: string; type: AdType; headline: string; body: string; cta: string;
  imageDescription: string; predictedCTR: number; actualCTR: number | null;
  impressions: number; clicks: number; status: Status; createdAt: string;
  generated?: boolean;
  // imageUrl is intentionally absent here — stored in IndexedDB only
}

const KEY = "creatives";
const VERTICALS: Vertical[]  = ["Medicare", "Auto", "Life", "Home"];
const AD_TYPES: AdType[]     = ["image", "email", "video"];
const STATUSES: Status[]     = ["active", "paused", "draft"];

const TYPE_COLORS: Record<string, string> = {
  image: "bg-emerald-500/20 text-emerald-400",
  email: "bg-violet-500/20 text-violet-400",
  video: "bg-amber-500/20 text-amber-400",
};
const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  paused: "bg-amber-500/20 text-amber-400",
  draft:  "bg-slate-500/20 text-slate-400",
};

function fmt(n: number) {
  return n >= 1e6 ? `${(n / 1e6).toFixed(1)}M`
       : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K`
       : String(n);
}

// ---------------------------------------------------------------------------
// Detail modal — loads image from IndexedDB on open
// ---------------------------------------------------------------------------
function CreativeDetailModal({
  creative: c,
  onClose,
}: {
  creative: Creative;
  onClose: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setImgLoading(true);
    getImage(c.id)
      .then((url) => { if (!cancelled) { setImageUrl(url ?? null); setImgLoading(false); } })
      .catch(() => { if (!cancelled) setImgLoading(false); });
    return () => { cancelled = true; };
  }, [c.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-blue-400">{c.vertical}</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full", TYPE_COLORS[c.type])}>{c.type}</span>
            {c.generated && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400">AI</span>
            )}
            <span className={cn("text-xs px-2 py-0.5 rounded-full", STATUS_COLORS[c.status])}>{c.status}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
        </div>

        {/* Image area */}
        {imgLoading ? (
          <div className="w-full rounded-xl mb-6 bg-slate-800 border border-slate-700/50 p-8 text-center animate-pulse">
            <div className="text-sm text-slate-500">Loading image…</div>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={c.headline}
            className="w-full rounded-xl mb-6 object-cover max-h-96"
          />
        ) : (
          <div className="w-full rounded-xl mb-6 bg-slate-800 border border-slate-700/50 p-8 text-center">
            <div className="text-4xl mb-3">🖼️</div>
            <p className="text-sm text-slate-400 italic">{c.imageDescription}</p>
          </div>
        )}

        {/* Copy fields */}
        <div className="mb-4">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Headline</div>
          <h2 className="text-lg font-bold text-white">{c.headline}</h2>
        </div>
        <div className="mb-4">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Body Copy</div>
          <p className="text-sm text-slate-300 leading-relaxed">{c.body}</p>
        </div>
        <div className="mb-4">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Call to Action</div>
          <span className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold">
            {c.cta}
          </span>
        </div>
        <div className="mb-6">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Image Description</div>
          <p className="text-sm text-slate-400 italic">{c.imageDescription}</p>
        </div>

        {/* Performance */}
        <div className="mb-6">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">Performance</div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Impressions",   value: fmt(c.impressions),                         color: "text-blue-400"   },
              { label: "Clicks",        value: fmt(c.clicks),                              color: "text-white"      },
              { label: "Predicted CTR", value: `${c.predictedCTR.toFixed(2)}%`,            color: "text-violet-400" },
              { label: "Actual CTR",    value: c.actualCTR !== null ? `${c.actualCTR.toFixed(2)}%` : "—", color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">{s.label}</div>
                <div className={cn("text-sm font-bold", s.color)}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function CreativePage() {
  const [creatives, setCreatives]       = useState<Creative[]>([]);
  const [selected, setSelected]         = useState<Creative | null>(null);
  const [filterVertical, setFilterV]    = useState<Vertical | "All">("All");
  const [filterType, setFilterType]     = useState<AdType | "All">("All");
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");
  const [search, setSearch]             = useState("");
  const [generating, setGenerating]     = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);

  // Generate form state
  const [genVertical, setGenVertical] = useState<Vertical>("Medicare");
  const [genType, setGenType]         = useState<AdType>("image");
    const [genPrompt, setGenPrompt] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = store.getAll<Creative>(KEY);
    if (saved) setCreatives(saved);
  }, []);

  // Persist (without imageUrl — that never lives here)
  const persist = useCallback((list: Creative[]) => {
    store.setOne(KEY, list);
    setCreatives(list);
  }, []);

  // -------------------------------------------------------------------------
  // Generate
  // -------------------------------------------------------------------------
  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vertical: genVertical, type: genType, prompt: genPrompt }),
      });
      if (!res.ok) throw new Error("API error");

      const raw = await res.json(); // includes imageUrl as base64 data URI

      // 1. Pull out imageUrl so it never touches localStorage
      const { imageUrl, ...creative } = raw as Creative & { imageUrl?: string };

      // 2. Persist image to IndexedDB
      if (imageUrl) {
        await saveImage(creative.id, imageUrl);
      }

      // 3. Save lightweight creative to localStorage
      const updated = [creative, ...creatives];
      persist(updated);
      setShowGenModal(false);
            setGenPrompt("");
    } catch (err) {
      console.error("Generate failed:", err);
    } finally {
      setGenerating(false);
    }
  }, [genVertical, genType, genPrompt, creatives, persist]);

  // -------------------------------------------------------------------------
  // Delete
  // -------------------------------------------------------------------------
  const handleDelete = useCallback(
    async (id: string) => {
      await deleteImage(id).catch(() => {}); // best-effort
      persist(creatives.filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
    },
    [creatives, persist, selected],
  );

  // -------------------------------------------------------------------------
  // Filters + search
  // -------------------------------------------------------------------------
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return creatives.filter((c) => {
      if (filterVertical !== "All" && c.vertical !== filterVertical) return false;
      if (filterType    !== "All" && c.type     !== filterType)     return false;
      if (filterStatus  !== "All" && c.status   !== filterStatus)   return false;
      if (q && !c.headline.toLowerCase().includes(q) && !c.body.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [creatives, filterVertical, filterType, filterStatus, search]);

  // -------------------------------------------------------------------------
  // Chart data — CTR by vertical
  // -------------------------------------------------------------------------
  const chartData = useMemo(() => {
    const map: Record<string, { predicted: number[]; actual: number[] }> = {};
    for (const v of VERTICALS) map[v] = { predicted: [], actual: [] };
    for (const c of creatives) {
      map[c.vertical]?.predicted.push(c.predictedCTR);
      if (c.actualCTR !== null) map[c.vertical]?.actual.push(c.actualCTR);
    }
    return VERTICALS.map((v) => {
      const { predicted, actual } = map[v];
      const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      return { vertical: v, predicted: +avg(predicted).toFixed(2), actual: +avg(actual).toFixed(2) };
    });
  }, [creatives]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Creative Studio</h1>
          <p className="text-sm text-slate-400 mt-1">AI-generated ad creatives across verticals</p>
        </div>
        <button
          onClick={() => setShowGenModal(true)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          + Generate Creative
        </button>
      </div>

      {/* CTR chart */}
      <Card className="p-4">
        <div className="text-sm font-semibold text-slate-300 mb-4">Avg CTR by Vertical</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="vertical" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
            <Bar dataKey="predicted" name="Predicted CTR" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual"    name="Actual CTR"    fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search headline or body…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 w-56"
        />
        {(
          [
            { label: "Vertical", options: ["All", ...VERTICALS], value: filterVertical, set: setFilterV },
            { label: "Type",     options: ["All", ...AD_TYPES],  value: filterType,     set: setFilterType },
            { label: "Status",   options: ["All", ...STATUSES],  value: filterStatus,   set: setFilterStatus },
          ] as const
        ).map(({ label, options, value, set }) => (
          <select
            key={label}
            value={value}
            onChange={(e) => (set as (v: string) => void)(e.target.value)}
            className="bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            {options.map((o) => <option key={o}>{o}</option>)}
          </select>
        ))}
        <span className="ml-auto text-xs text-slate-500 self-center">
          {filtered.length} / {creatives.length} creatives
        </span>
      </div>

      {/* Card grid — NO images shown here, keeping cards lightweight */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500 text-sm">
          No creatives match your filters.{" "}
          <button onClick={() => setShowGenModal(true)} className="text-violet-400 hover:underline">
            Generate one?
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className="p-4 cursor-pointer hover:border-violet-500/50 transition-colors group relative"
              onClick={() => setSelected(c)}
            >
              {/* Badges */}
              <div className="flex items-center gap-1.5 flex-wrap mb-3">
                <span className="text-xs font-medium text-blue-400">{c.vertical}</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full", TYPE_COLORS[c.type])}>{c.type}</span>
                {c.generated && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400">AI</span>
                )}
                <span className={cn("text-xs px-2 py-0.5 rounded-full ml-auto", STATUS_COLORS[c.status])}>
                  {c.status}
                </span>
              </div>

              {/* Headline */}
              <p className="text-sm font-semibold text-white mb-1 line-clamp-2">{c.headline}</p>
              <p className="text-xs text-slate-400 line-clamp-2 mb-3">{c.body}</p>

              {/* Metrics */}
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>👁 {fmt(c.impressions)}</span>
                <span>🖱 {fmt(c.clicks)}</span>
                <span className="text-violet-400">~{c.predictedCTR.toFixed(2)}%</span>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs transition-opacity"
                title="Delete"
              >
                ✕
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <CreativeDetailModal creative={selected} onClose={() => setSelected(null)} />
      )}

      {/* Generate modal */}
      {showGenModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => !generating && setShowGenModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Generate Creative</h2>
              <button
                onClick={() => setShowGenModal(false)}
                disabled={generating}
                className="text-slate-400 hover:text-white text-xl leading-none disabled:opacity-50"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">Vertical</label>
                <div className="flex flex-wrap gap-2">
                  {VERTICALS.map((v) => (
                    <button
                      key={v}
                      onClick={() => setGenVertical(v)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        genVertical === v
                          ? "bg-violet-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white",
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">Ad Type</label>
                <div className="flex gap-2">
                  {AD_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setGenType(t)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize",
                        genType === t
                          ? "bg-violet-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">Description (optional)</label>
                <textarea
                  value={genPrompt}
                  onChange={(e) => setGenPrompt(e.target.value)}
                  placeholder="Describe what you want the creative to accomplish…"
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
              </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                "✨ Generate"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
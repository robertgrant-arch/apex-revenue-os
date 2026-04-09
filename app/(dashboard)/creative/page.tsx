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
}

const KEY = "creatives";
const VERTICALS: Vertical[]  = ["Medicare", "Auto", "Life", "Home"];
const AD_TYPES: AdType[]     = ["image", "email", "video"];
const STATUSES: Status[]     = ["active", "paused", "draft"];

type Platform = "Meta" | "Google" | "Programmatic" | "Display" | "CTV";
const PLATFORMS: Platform[] = ["Meta", "Google", "Programmatic", "Display", "CTV"];

const AD_SPECS: Record<string, { width: number; height: number; label: string }[]> = {
  Meta: [
    { width: 1080, height: 1080, label: "Feed Square 1080x1080" },
    { width: 1080, height: 1920, label: "Story/Reel 1080x1920" },
    { width: 1200, height: 628, label: "Link Ad 1200x628" },
  ],
  Google: [
    { width: 300, height: 250, label: "Medium Rectangle 300x250" },
    { width: 728, height: 90, label: "Leaderboard 728x90" },
    { width: 160, height: 600, label: "Wide Skyscraper 160x600" },
  ],
  Programmatic: [
    { width: 300, height: 250, label: "Medium Rectangle 300x250" },
    { width: 970, height: 250, label: "Billboard 970x250" },
    { width: 320, height: 50, label: "Mobile Banner 320x50" },
  ],
  Display: [
    { width: 728, height: 90, label: "Leaderboard 728x90" },
    { width: 300, height: 600, label: "Half Page 300x600" },
    { width: 320, height: 480, label: "Mobile Interstitial 320x480" },
  ],
  CTV: [
    { width: 1920, height: 1080, label: "Full HD 1920x1080" },
    { width: 1280, height: 720, label: "HD 1280x720" },
  ],
};

const AUDIENCES = ["Seniors 65+", "AEP Shoppers", "Dual Eligible", "Under-65 Disabled", "Caregivers", "General"];

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
  return n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : String(n);
}

function CreativeDetailModal({ creative: c, onClose }: { creative: Creative; onClose: () => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setImgLoading(true);
    getImage(c.id).then((url) => { if (!cancelled) { setImageUrl(url ?? null); setImgLoading(false); } }).catch(() => { if (!cancelled) setImgLoading(false); });
    return () => { cancelled = true; };
  }, [c.id]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">{c.vertical}</span>
            <span className={cn("px-2 py-0.5 rounded text-xs font-medium capitalize", TYPE_COLORS[c.type])}>{c.type}</span>
            {c.generated && <span className="px-2 py-0.5 rounded text-xs font-medium bg-violet-500/20 text-violet-400">AI</span>}
            <span className={cn("px-2 py-0.5 rounded text-xs font-medium capitalize", STATUS_COLORS[c.status])}>{c.status}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
        </div>
        {imgLoading ? (
          <div className="h-48 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">Loading image...</div>
        ) : imageUrl ? (
          <img src={imageUrl} alt={c.headline} className="w-full rounded-xl object-cover max-h-72" />
        ) : (
          <div className="h-48 bg-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 gap-2">
            <span className="text-4xl">&#x1f5bc;&#xfe0f;</span><p className="text-sm px-8 text-center">{c.imageDescription}</p>
          </div>
        )}
        <div className="space-y-4">
          <div><p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Headline</p><h3 className="text-white font-semibold text-lg">{c.headline}</h3></div>
          <div><p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Body Copy</p><p className="text-slate-300 text-sm">{c.body}</p></div>
          <div><p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Call to Action</p><span className="inline-block px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold">{c.cta}</span></div>
          <div><p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Image Description</p><p className="text-slate-300 text-sm">{c.imageDescription}</p></div>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">Performance</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[{label:"Impressions",value:fmt(c.impressions),color:"text-blue-400"},{label:"Clicks",value:fmt(c.clicks),color:"text-white"},{label:"Predicted CTR",value:`${c.predictedCTR.toFixed(2)}%`,color:"text-violet-400"},{label:"Actual CTR",value:c.actualCTR!==null?`${c.actualCTR.toFixed(2)}%`:"\u2014",color:"text-emerald-400"}].map((s)=>(
              <div key={s.label} className="bg-slate-800/50 rounded-lg p-3 text-center"><p className="text-xs text-slate-500 mb-1">{s.label}</p><p className={cn("text-lg font-semibold",s.color)}>{s.value}</p></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreativePage() {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [selected, setSelected] = useState<Creative | null>(null);
  const [filterVertical, setFilterV] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [genVertical, setGenVertical] = useState<Vertical>("Medicare");
  const [genType, setGenType] = useState<AdType>("image");
  const [genPrompt, setGenPrompt] = useState("");
  const [genPlatform, setGenPlatform] = useState<Platform>("Meta");
  const [genAudience, setGenAudience] = useState("Seniors 65+");
  const [genVariants, setGenVariants] = useState(3);
  const [genSpec, setGenSpec] = useState(AD_SPECS["Meta"][0].label);

  useEffect(() => { const saved = store.getAll<Creative[]>(KEY); if (saved) setCreatives(saved); }, []);
  const persist = useCallback((list: Creative[]) => { store.setOne(KEY, list); setCreatives(list); }, []);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-creative", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vertical: genVertical, type: genType, prompt: genPrompt, platform: genPlatform, spec: genSpec, audience: genAudience, variants: genVariants }),
      });
      if (!res.ok) throw new Error("API error");
      const raw = await res.json();
      const { imageUrl, ...creative } = raw as Creative & { imageUrl?: string };
      if (imageUrl) await saveImage(creative.id, imageUrl);
      persist([creative, ...creatives]);
      setShowGenModal(false); setGenPrompt("");
    } catch (err) { console.error("Generate failed:", err); }
    finally { setGenerating(false); }
  }, [genVertical, genType, genPrompt, genPlatform, genSpec, genAudience, genVariants, creatives, persist]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteImage(id).catch(() => {});
    persist(creatives.filter((c) => c.id !== id));
    if (selected?.id === id) setSelected(null);
  }, [creatives, persist, selected]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return creatives.filter((c) => {
      if (filterVertical !== "All" && c.vertical !== filterVertical) return false;
      if (filterType !== "All" && c.type !== filterType) return false;
      if (filterStatus !== "All" && c.status !== filterStatus) return false;
      if (q && !c.headline.toLowerCase().includes(q) && !c.body.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [creatives, filterVertical, filterType, filterStatus, search]);

  const chartData = useMemo(() => {
    const map: Record<string, { predicted: number[]; actual: number[] }> = {};
    for (const v of VERTICALS) map[v] = { predicted: [], actual: [] };
    for (const c of creatives) { map[c.vertical]?.predicted.push(c.predictedCTR); if (c.actualCTR !== null) map[c.vertical]?.actual.push(c.actualCTR); }
    return VERTICALS.map((v) => {
      const { predicted, actual } = map[v];
      const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      return { vertical: v, predicted: +avg(predicted).toFixed(2), actual: +avg(actual).toFixed(2) };
    });
  }, [creatives]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Creative Studio</h1>
          <p className="text-slate-400 text-sm">AI-generated ad creatives across verticals</p>
        </div>
        <button onClick={() => setShowGenModal(true)} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-semibold transition-colors">+ Generate Creative</button>
      </div>

      <Card title="Avg CTR by Vertical">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="vertical" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip content={<ChartTooltip />} />
            <Legend />
            <Bar dataKey="predicted" fill="#8b5cf6" radius={[4,4,0,0]} />
            <Bar dataKey="actual" fill="#10b981" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <input type="text" placeholder="Search headline or body..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 w-56" />
        {([{label:"Vertical",options:["All",...VERTICALS],value:filterVertical,set:setFilterV},{label:"Type",options:["All",...AD_TYPES],value:filterType,set:setFilterType},{label:"Status",options:["All",...STATUSES],value:filterStatus,set:setFilterStatus}] as const).map(({label,options,value,set})=>(
          <select key={label} value={value} onChange={(e)=>(set as (v:string)=>void)(e.target.value)} className="bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500">
            {options.map((o)=><option key={o}>{o}</option>)}
          </select>
        ))}
        <span className="text-xs text-slate-500 ml-auto">{filtered.length} / {creatives.length} creatives</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No creatives match your filters.{" "}<button onClick={()=>setShowGenModal(true)} className="text-violet-400 hover:underline">Generate one?</button></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} onClick={()=>setSelected(c)} className="group relative bg-slate-900 border border-slate-800 hover:border-violet-500/40 rounded-xl p-5 cursor-pointer transition-all space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">{c.vertical}</span>
                <span className={cn("px-2 py-0.5 rounded text-xs font-medium capitalize",TYPE_COLORS[c.type])}>{c.type}</span>
                {c.generated && <span className="px-2 py-0.5 rounded text-xs font-medium bg-violet-500/20 text-violet-400">AI</span>}
                <span className={cn("px-2 py-0.5 rounded text-xs font-medium capitalize",STATUS_COLORS[c.status])}>{c.status}</span>
              </div>
              <h3 className="text-white font-semibold text-sm line-clamp-1">{c.headline}</h3>
              <p className="text-slate-400 text-xs line-clamp-2">{c.body}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>&#x1f441; {fmt(c.impressions)}</span><span>&#x1f5b1; {fmt(c.clicks)}</span><span>~{c.predictedCTR.toFixed(2)}%</span>
              </div>
              <button onClick={(e)=>{e.stopPropagation();handleDelete(c.id);}} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs transition-opacity" title="Delete">&#x2715;</button>
            </div>
          ))}
        </div>
      )}

      {selected && <CreativeDetailModal creative={selected} onClose={()=>setSelected(null)} />}

      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={()=>!generating&&setShowGenModal(false)}>
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl max-w-lg w-full p-6 space-y-5" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Generate Creative</h2>
              <button onClick={()=>setShowGenModal(false)} disabled={generating} className="text-slate-400 hover:text-white text-xl leading-none disabled:opacity-50">&times;</button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">Vertical</label>
                <div className="flex flex-wrap gap-2">
                  {VERTICALS.map((v)=>(<button key={v} onClick={()=>setGenVertical(v)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",genVertical===v?"bg-violet-600 text-white":"bg-slate-800 text-slate-400 hover:text-white")}>{v}</button>))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">Ad Type</label>
                <div className="flex flex-wrap gap-2">
                  {AD_TYPES.map((t)=>(<button key={t} onClick={()=>setGenType(t)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize",genType===t?"bg-violet-600 text-white":"bg-slate-800 text-slate-400 hover:text-white")}>{t}</button>))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">Platform</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p)=>(<button key={p} onClick={()=>{setGenPlatform(p);setGenSpec(AD_SPECS[p][0].label);}} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",genPlatform===p?"bg-violet-600 text-white":"bg-slate-800 text-slate-400 hover:text-white")}>{p}</button>))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">Ad Spec</label>
                <select value={genSpec} onChange={(e)=>setGenSpec(e.target.value)} className="w-full bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500">
                  {AD_SPECS[genPlatform].map((s)=>(<option key={s.label} value={s.label}>{s.label}</option>))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">Target Audience</label>
                <select value={genAudience} onChange={(e)=>setGenAudience(e.target.value)} className="w-full bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500">
                  {AUDIENCES.map((a)=>(<option key={a} value={a}>{a}</option>))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">Headline Variants</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={1} max={10} value={genVariants} onChange={(e)=>setGenVariants(Number(e.target.value))} className="flex-1 accent-violet-500" />
                  <span className="text-white font-semibold text-sm w-6 text-center">{genVariants}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">Description (optional)</label>
                <textarea
                  value={genPrompt}
                  onChange={(e) => setGenPrompt(e.target.value)}
                  placeholder="Describe what you want the creative to accomplish..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
              </div>
            </div>
            <button onClick={handleGenerate} disabled={generating} className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              {generating ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>) : "Generate"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

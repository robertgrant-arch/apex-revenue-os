"use client";
import { useState } from "react";
import { Search, Plus, Image, FileText, Video, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { ChartTooltip } from "@/components/ui/ChartTooltip";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

const ASSETS = [
  { id: 1, name: "Medicare AEP - Turning 65", type: "image", vertical: "Medicare", status: "active", predictedCTR: 4.2, actualCTR: 4.8, impressions: 84200, clicks: 4042, created: "Mar 10", agent: "CREATOR" },
  { id: 2, name: "Auto Rate Shock - Price Drop", type: "image", vertical: "Auto", status: "active", predictedCTR: 3.1, actualCTR: 2.9, impressions: 52000, clicks: 1508, created: "Mar 12", agent: "CREATOR" },
  { id: 3, name: "Life - Family Protection Email", type: "email", vertical: "Life", status: "active", predictedCTR: 2.8, actualCTR: 3.2, impressions: 24000, clicks: 768, created: "Mar 14", agent: "CREATOR" },
  { id: 4, name: "Medicare Supplement Video 30s", type: "video", vertical: "Medicare", status: "review", predictedCTR: 5.1, actualCTR: 0, impressions: 0, clicks: 0, created: "Mar 20", agent: "CREATOR" },
  { id: 5, name: "Home Bundle - New Move Email", type: "email", vertical: "Home", status: "draft", predictedCTR: 2.4, actualCTR: 0, impressions: 0, clicks: 0, created: "Mar 22", agent: "CREATOR" },
  { id: 6, name: "Auto Multi-car Savings Banner", type: "image", vertical: "Auto", status: "paused", predictedCTR: 2.9, actualCTR: 2.1, impressions: 31000, clicks: 651, created: "Mar 8", agent: "CREATOR" },
];

const ctrChartData = [
  { date: "Mar 10", predicted: 4.2, actual: 3.8 },
  { date: "Mar 12", predicted: 3.8, actual: 4.1 },
  { date: "Mar 14", predicted: 4.0, actual: 4.3 },
  { date: "Mar 16", predicted: 4.4, actual: 4.7 },
  { date: "Mar 18", predicted: 4.1, actual: 4.5 },
  { date: "Mar 20", predicted: 4.6, actual: 4.8 },
  { date: "Mar 22", predicted: 4.8, actual: 5.1 },
];

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  review: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  draft: "bg-slate-700 text-slate-400 border-slate-600",
  paused: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const typeIcons: Record<string, React.ReactNode> = {
  image: <Image className="w-4 h-4" />,
  email: <FileText className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
};

const tabs = ["All", "active", "review", "draft", "paused"];

export default function CreativePage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genForm, setGenForm] = useState({ vertical: "Medicare", type: "image", goal: "clicks", tone: "professional" });

  const filtered = ASSETS.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === "All" || a.status === tab;
    const matchType = typeFilter === "All" || a.type === typeFilter;
    return matchSearch && matchTab && matchType;
  });

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setModalOpen(false);
      toast.success("Creative asset generated successfully");
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Creative Assets</h1>
          <p className="text-slate-400 text-sm mt-0.5">AI-generated ads, emails, and landing pages</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-400 text-white rounded-lg text-sm font-medium transition-colors">
          <Sparkles className="w-4 h-4" /> Generate Creative
        </button>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Predicted vs Actual CTR (%)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={ctrChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Predicted CTR" />
            <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} name="Actual CTR" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search creative assets..." className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50" />
        </div>
        <div className="flex gap-1">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn("px-2.5 py-2 text-xs rounded-lg font-medium capitalize transition-all border", tab === t ? "bg-violet-500/20 text-violet-400 border-violet-500/30" : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:text-white")}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {["All", "image", "email", "video"].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={cn("px-2.5 py-2 text-xs rounded-lg font-medium capitalize transition-all border", typeFilter === t ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:text-white")}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(asset => (
          <Card key={asset.id} hoverable className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-violet-400/10 rounded-lg text-violet-400">{typeIcons[asset.type]}</div>
                <div>
                  <p className="text-sm font-medium text-white leading-tight">{asset.name}</p>
                  <p className="text-xs text-slate-500">{asset.vertical} · {asset.created}</p>
                </div>
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize border flex-shrink-0", statusColors[asset.status])}>{asset.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center">
                <p className="text-xs text-slate-500">Pred CTR</p>
                <p className="text-sm font-semibold text-violet-400">{asset.predictedCTR}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Actual CTR</p>
                <p className="text-sm font-semibold text-emerald-400">{asset.actualCTR > 0 ? `${asset.actualCTR}%` : "—"}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Impressions</p>
                <p className="text-sm font-semibold text-white">{asset.impressions > 0 ? `${(asset.impressions / 1000).toFixed(1)}k` : "—"}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Generate Creative Asset" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Vertical</label>
            <select value={genForm.vertical} onChange={e => setGenForm(f => ({ ...f, vertical: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500/50">
              {["Medicare", "Auto", "Life", "Home"].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Asset Type</label>
            <div className="flex gap-2">
              {["image", "email", "video"].map(t => (
                <button key={t} onClick={() => setGenForm(f => ({ ...f, type: t }))} className={cn("flex-1 py-2 text-sm rounded-lg font-medium capitalize border transition-all flex items-center justify-center gap-1.5", genForm.type === t ? "bg-violet-500/20 text-violet-400 border-violet-500/30" : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white")}>
                  {typeIcons[t]} {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Optimization Goal</label>
            <div className="flex gap-2">
              {["clicks", "conversions", "awareness"].map(g => (
                <button key={g} onClick={() => setGenForm(f => ({ ...f, goal: g }))} className={cn("flex-1 py-1.5 text-xs rounded-lg font-medium capitalize border transition-all", genForm.goal === g ? "bg-violet-500/20 text-violet-400 border-violet-500/30" : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white")}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Tone</label>
            <div className="flex gap-2 flex-wrap">
              {["professional", "empathetic", "urgent", "friendly"].map(t => (
                <button key={t} onClick={() => setGenForm(f => ({ ...f, tone: t }))} className={cn("px-3 py-1.5 text-xs rounded-lg font-medium capitalize border transition-all", genForm.tone === t ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white")}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 py-2 text-sm rounded-lg font-medium text-slate-400 border border-slate-700 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleGenerate} disabled={generating} className="flex-1 py-2 text-sm rounded-lg font-medium bg-violet-500 hover:bg-violet-400 text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
              {generating ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</> : <><Sparkles className="w-3.5 h-3.5" />Generate</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
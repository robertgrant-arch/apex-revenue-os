"use client";
import { useState } from "react";
import {
  Wand2, Plus, Play, BarChart2, Image, Video, FileText,
  Layers, TrendingUp, Eye, MousePointer, CheckCircle, Clock, XCircle
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Toast, useToast } from "@/components/ui/Toast";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Creative {
  id: string;
  name: string;
  type: "image" | "video" | "copy";
  vertical: string;
  status: "active" | "draft" | "paused";
  ctr: number;
  cvr: number;
  impressions: number;
  spend: number;
  abPair?: string;
  abRole?: "control" | "variant";
  abResults?: ABResult;
}

interface ABResult {
  controlCtr: number;
  variantCtr: number;
  controlCvr: number;
  variantCvr: number;
  winner: "control" | "variant" | "inconclusive";
  confidence: number;
  impressions: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const INITIAL_CREATIVES: Creative[] = [
  {
    id: "c1", name: "Medicare Advantage - Hero Banner", type: "image",
    vertical: "Medicare", status: "active", ctr: 4.2, cvr: 8.7,
    impressions: 142000, spend: 3200, abPair: "c2", abRole: "control",
    abResults: { controlCtr: 4.2, variantCtr: 5.1, controlCvr: 8.7, variantCvr: 9.4, winner: "variant", confidence: 95, impressions: 284000 }
  },
  {
    id: "c2", name: "Medicare Advantage - Hero Banner V2", type: "image",
    vertical: "Medicare", status: "active", ctr: 5.1, cvr: 9.4,
    impressions: 142000, spend: 3200, abPair: "c1", abRole: "variant",
    abResults: { controlCtr: 4.2, variantCtr: 5.1, controlCvr: 8.7, variantCvr: 9.4, winner: "variant", confidence: 95, impressions: 284000 }
  },
  {
    id: "c3", name: "ACA Open Enrollment - Video Ad", type: "video",
    vertical: "ACA", status: "active", ctr: 3.8, cvr: 6.2,
    impressions: 89000, spend: 2100
  },
  {
    id: "c4", name: "Life Insurance - Email Copy", type: "copy",
    vertical: "Life Insurance", status: "draft", ctr: 0, cvr: 0,
    impressions: 0, spend: 0
  },
  {
    id: "c5", name: "Final Expense - Facebook Ad", type: "image",
    vertical: "Final Expense", status: "paused", ctr: 2.9, cvr: 5.1,
    impressions: 55000, spend: 980
  },
];

const VERTICALS = ["Medicare", "ACA", "Life Insurance", "Final Expense", "Auto", "Home"];
const CREATIVE_TYPES = ["image", "video", "copy"];

// ── Helpers ────────────────────────────────────────────────────────────────────
const typeIcon = (type: Creative["type"]) => {
  if (type === "image") return <Image size={16} />;
  if (type === "video") return <Video size={16} />;
  return <FileText size={16} />;
};

const statusBadge = (status: Creative["status"]) => {
  const map = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    paused: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border ${map[status]} capitalize`}>
      {status}
    </span>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────
export default function CreativeStudioPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [creatives, setCreatives] = useState<Creative[]>(INITIAL_CREATIVES);

  // Generate Creative modal
  const [genOpen, setGenOpen] = useState(false);
  const [genForm, setGenForm] = useState({ name: "", type: "image", vertical: "Medicare", prompt: "" });
  const [genLoading, setGenLoading] = useState(false);

  // New A/B Pair modal
  const [abOpen, setAbOpen] = useState(false);
  const [abForm, setAbForm] = useState({ controlId: "", variantId: "" });

  // View Test Results modal
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsCreative, setResultsCreative] = useState<Creative | null>(null);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!genForm.name.trim()) { addToast("Creative name is required", "error"); return; }
    if (!genForm.prompt.trim()) { addToast("AI prompt is required", "error"); return; }
    setGenLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    const newCreative: Creative = {
      id: `c${Date.now()}`,
      name: genForm.name,
      type: genForm.type as Creative["type"],
      vertical: genForm.vertical,
      status: "draft",
      ctr: 0, cvr: 0, impressions: 0, spend: 0,
    };
    setCreatives((prev) => [newCreative, ...prev]);
    setGenLoading(false);
    setGenOpen(false);
    setGenForm({ name: "", type: "image", vertical: "Medicare", prompt: "" });
    addToast(`Creative "${newCreative.name}" generated successfully`, "success");
  };

  const handleNewABPair = () => {
    if (!abForm.controlId || !abForm.variantId) { addToast("Select both control and variant", "error"); return; }
    if (abForm.controlId === abForm.variantId) { addToast("Control and variant must be different", "error"); return; }
    setCreatives((prev) =>
      prev.map((c) => {
        if (c.id === abForm.controlId) return { ...c, abPair: abForm.variantId, abRole: "control" };
        if (c.id === abForm.variantId) return { ...c, abPair: abForm.controlId, abRole: "variant" };
        return c;
      })
    );
    setAbOpen(false);
    setAbForm({ controlId: "", variantId: "" });
    addToast("A/B test pair created", "success");
  };

  const openResults = (creative: Creative) => {
    setResultsCreative(creative);
    setResultsOpen(true);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Creative Studio</h1>
          <p className="text-slate-400 text-sm mt-1">AI-powered creative generation and A/B testing</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAbOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-sm"
          >
            <Layers size={16} />
            New A/B Pair
          </button>
          <button
            onClick={() => setGenOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-all text-sm font-medium"
          >
            <Wand2 size={16} />
            Generate Creative
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Creatives", value: creatives.length.toString(), icon: <Image size={18} />, color: "violet" },
          { label: "Active A/B Tests", value: creatives.filter(c => c.abPair && c.abRole === "control").length.toString(), icon: <Layers size={18} />, color: "blue" },
          { label: "Avg CTR", value: (creatives.reduce((a, c) => a + c.ctr, 0) / Math.max(creatives.filter(c => c.ctr > 0).length, 1)).toFixed(1) + "%", icon: <MousePointer size={18} />, color: "emerald" },
          { label: "Total Spend", value: "$" + creatives.reduce((a, c) => a + c.spend, 0).toLocaleString(), icon: <TrendingUp size={18} />, color: "amber" },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-400 mb-3`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-slate-400 text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Creative Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {creatives.map((creative) => (
          <div key={creative.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-all">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                  {typeIcon(creative.type)}
                </div>
                <div>
                  <div className="text-sm font-medium text-white leading-tight">{creative.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{creative.vertical}</div>
                </div>
              </div>
              {statusBadge(creative.status)}
            </div>

            {/* A/B Badge */}
            {creative.abRole && (
              <div className="mb-3 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${creative.abRole === "control" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"}`}>
                  A/B {creative.abRole === "control" ? "Control" : "Variant"}
                </span>
              </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "CTR", value: creative.ctr > 0 ? `${creative.ctr}%` : "—" },
                { label: "CVR", value: creative.cvr > 0 ? `${creative.cvr}%` : "—" },
                { label: "Spend", value: creative.spend > 0 ? `$${creative.spend.toLocaleString()}` : "—" },
              ].map((m) => (
                <div key={m.label} className="bg-slate-900/50 rounded-lg p-2.5">
                  <div className="text-xs text-slate-500">{m.label}</div>
                  <div className="text-sm font-semibold text-white mt-0.5">{m.value}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-xs">
                <Eye size={13} /> Preview
              </button>
              {creative.abResults && (
                <button
                  onClick={() => openResults(creative)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 transition-all text-xs border border-violet-500/20"
                >
                  <BarChart2 size={13} /> View Test Results
                </button>
              )}
              {!creative.abResults && (
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-xs">
                  <Play size={13} /> Activate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Generate Creative Modal ─────────────────────────────────────────── */}
      <Modal open={genOpen} onClose={() => setGenOpen(false)} title="Generate Creative" width="max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Creative Name <span className="text-red-400">*</span></label>
            <input
              value={genForm.name}
              onChange={(e) => setGenForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Medicare Advantage Q3 Hero"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Type</label>
              <select
                value={genForm.type}
                onChange={(e) => setGenForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
              >
                {CREATIVE_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Vertical</label>
              <select
                value={genForm.vertical}
                onChange={(e) => setGenForm((p) => ({ ...p, vertical: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
              >
                {VERTICALS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">AI Prompt <span className="text-red-400">*</span></label>
            <textarea
              value={genForm.prompt}
              onChange={(e) => setGenForm((p) => ({ ...p, prompt: e.target.value }))}
              rows={4}
              placeholder="Describe the creative you want to generate. Include tone, key messages, target audience, CTA..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setGenOpen(false)}
              className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={genLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
            >
              {genLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                <><Wand2 size={15} /> Generate</>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── New A/B Pair Modal ──────────────────────────────────────────────── */}
      <Modal open={abOpen} onClose={() => setAbOpen(false)} title="New A/B Test Pair">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Select two creatives to set up as an A/B test pair.</p>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Control (A)</label>
            <select
              value={abForm.controlId}
              onChange={(e) => setAbForm((p) => ({ ...p, controlId: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="">Select control creative…</option>
              {creatives.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Variant (B)</label>
            <select
              value={abForm.variantId}
              onChange={(e) => setAbForm((p) => ({ ...p, variantId: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="">Select variant creative…</option>
              {creatives.filter((c) => c.id !== abForm.controlId).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setAbOpen(false)}
              className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleNewABPair}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all"
            >
              <Layers size={15} /> Create A/B Pair
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Test Results Modal ──────────────────────────────────────────────── */}
      <Modal open={resultsOpen} onClose={() => setResultsOpen(false)} title="A/B Test Results" width="max-w-2xl">
        {resultsCreative?.abResults && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              {resultsCreative.abResults.winner === "variant" ? (
                <CheckCircle size={20} className="text-emerald-400 shrink-0" />
              ) : resultsCreative.abResults.winner === "control" ? (
                <CheckCircle size={20} className="text-blue-400 shrink-0" />
              ) : (
                <Clock size={20} className="text-amber-400 shrink-0" />
              )}
              <div>
                <div className="text-sm font-medium text-white">
                  {resultsCreative.abResults.winner === "inconclusive"
                    ? "Test still running — no clear winner yet"
                    : `Variant ${resultsCreative.abResults.winner === "variant" ? "B" : "A"} is winning`}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {resultsCreative.abResults.confidence}% statistical confidence · {resultsCreative.abResults.impressions.toLocaleString()} total impressions
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(["control", "variant"] as const).map((role) => {
                const isControl = role === "control";
                const ctr = isControl ? resultsCreative.abResults!.controlCtr : resultsCreative.abResults!.variantCtr;
                const cvr = isControl ? resultsCreative.abResults!.controlCvr : resultsCreative.abResults!.variantCvr;
                const isWinner = resultsCreative.abResults!.winner === role;
                return (
                  <div
                    key={role}
                    className={`p-4 rounded-xl border ${isWinner ? "border-emerald-500/30 bg-emerald-500/5" : "border-slate-700/50 bg-slate-800/50"}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${isControl ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"}`}>
                        {isControl ? "A — Control" : "B — Variant"}
                      </span>
                      {isWinner && <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Winner</span>}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Click-Through Rate</div>
                        <div className="text-2xl font-bold text-white">{ctr}%</div>
                        <div className="mt-1.5 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(ctr / 10) * 100}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Conversion Rate</div>
                        <div className="text-2xl font-bold text-white">{cvr}%</div>
                        <div className="mt-1.5 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(cvr / 20) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {resultsCreative.abResults.winner !== "inconclusive" && (
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setResultsOpen(false);
                    addToast("Winning variant promoted to active creative", "success");
                  }}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all"
                >
                  Promote Winner
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
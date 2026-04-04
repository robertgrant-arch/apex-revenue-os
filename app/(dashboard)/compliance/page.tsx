"use client";

import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Channel = "ad" | "sms" | "voice" | "landing_page";
type Disposition = "approve" | "escalate" | "block";

interface FlaggedPhrase {
  claimType: string;
  phrase: string;
  severity: "low" | "medium" | "high" | "critical";
  explanation: string;
  suggestedFix?: string;
}

interface ComplianceRecord {
  id: string;
  timestamp: string;
  content: string;
  channel: Channel;
  vertical: string;
  score: number;
  flaggedPhrases: FlaggedPhrase[];
  requiredDisclaimers: string[];
  disposition: Disposition;
  suggestions: string[];
  channelViolations: string[];
  gptAnalysis?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "apex_compliance_history";
const CHANNELS: { value: Channel; label: string }[] = [
  { value: "ad", label: "Advertisement" },
  { value: "sms", label: "SMS" },
  { value: "voice", label: "Voice Script" },
  { value: "landing_page", label: "Landing Page" },
];
const VERTICALS = ["Medicare", "Medicare Advantage", "Medicare Supplement", "Part D", "ACA/Marketplace", "Life Insurance", "Other"];

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadHistory(): ComplianceRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch { return []; }
}

function saveHistory(records: ComplianceRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 500)));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80
    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
    : score >= 50
    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
    : "bg-red-500/20 text-red-300 border border-red-500/30";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", color)}>
      {score}/100
    </span>
  );
}

function DispositionBadge({ disposition }: { disposition: Disposition }) {
  const map = {
    approve: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    escalate: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    block: "bg-red-500/20 text-red-300 border border-red-500/30",
  };
  const labels = { approve: "✓ Approve", escalate: "⚠ Escalate", block: "✕ Block" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", map[disposition])}>
      {labels[disposition]}
    </span>
  );
}

function SeverityPip({ severity }: { severity: FlaggedPhrase["severity"] }) {
  const map = { low: "bg-blue-400", medium: "bg-amber-400", high: "bg-orange-400", critical: "bg-red-500" };
  return <span className={cn("inline-block w-2 h-2 rounded-full mr-1.5 mt-0.5 flex-shrink-0", map[severity])} />;
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text x="70" y="68" textAnchor="middle" fill="white" fontSize="28" fontWeight="600">{score}</text>
        <text x="70" y="86" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11">/ 100</text>
      </svg>
      <span className={cn("text-sm font-semibold", score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400")}>
        {score >= 80 ? "Compliant" : score >= 50 ? "Needs Review" : "Non-Compliant"}
      </span>
    </div>
  );
}

// ─── Check Modal ──────────────────────────────────────────────────────────────

function CheckModal({
  onClose,
  onResult,
}: {
  onClose: () => void;
  onResult: (record: ComplianceRecord) => void;
}) {
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState<Channel>("ad");
  const [vertical, setVertical] = useState("Medicare");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Omit<ComplianceRecord, "id" | "timestamp" | "content" | "channel" | "vertical"> | null>(null);

  async function runCheck() {
    if (!content.trim()) { setError("Please enter content to check."); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/compliance/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, channel, vertical }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
      const record: ComplianceRecord = {
        id: `chk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: data.timestamp ?? new Date().toISOString(),
        content,
        channel,
        vertical,
        ...data,
      };
      onResult(record);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-10 pb-10 px-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h2 className="text-white font-semibold text-lg">Run Compliance Check</h2>
            <p className="text-slate-400 text-sm mt-0.5">Paste your content and select channel for analysis</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Content</label>
            <textarea
              className="w-full bg-slate-800 border border-slate-600 rounded-xl text-white text-sm px-4 py-3 focus:outline-none focus:border-indigo-500 placeholder-slate-500 resize-none"
              rows={6}
              placeholder="Paste your ad copy, SMS message, voice script, or landing page content here..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Channel</label>
              <select
                className="w-full bg-slate-800 border border-slate-600 rounded-xl text-white text-sm px-4 py-2.5 focus:outline-none focus:border-indigo-500"
                value={channel}
                onChange={e => setChannel(e.target.value as Channel)}
              >
                {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Vertical</label>
              <select
                className="w-full bg-slate-800 border border-slate-600 rounded-xl text-white text-sm px-4 py-2.5 focus:outline-none focus:border-indigo-500"
                value={vertical}
                onChange={e => setVertical(e.target.value)}
              >
                {VERTICALS.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>
          )}
          <button
            onClick={runCheck}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            {loading ? "Analyzing…" : "Run Compliance Check"}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="border-t border-slate-700 px-6 py-5 space-y-5">
            {/* Score + Disposition */}
            <div className="flex items-center gap-6">
              <ScoreGauge score={result.score} />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">Disposition:</span>
                  <DispositionBadge disposition={result.disposition} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">Channel:</span>
                  <span className="text-white text-sm font-medium capitalize">{channel.replace("_", " ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">Vertical:</span>
                  <span className="text-white text-sm font-medium">{vertical}</span>
                </div>
              </div>
            </div>

            {/* GPT Narrative */}
            {result.gptAnalysis && (
              <div className="bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">AI Analysis</p>
                <p className="text-slate-300 text-sm leading-relaxed">{result.gptAnalysis}</p>
              </div>
            )}

            {/* Channel Violations */}
            {result.channelViolations.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Channel Violations</p>
                <div className="space-y-1.5">
                  {result.channelViolations.map((v, i) => (
                    <div key={i} className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      <span className="text-red-400 text-xs mt-0.5">✕</span>
                      <span className="text-red-300 text-xs">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flagged Phrases */}
            {result.flaggedPhrases.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                  Flagged Phrases ({result.flaggedPhrases.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {result.flaggedPhrases.map((fp, i) => (
                    <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
                      <div className="flex items-start gap-2 mb-1">
                        <SeverityPip severity={fp.severity} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-white text-xs font-mono bg-slate-700 px-1.5 py-0.5 rounded">
                              "{fp.phrase}"
                            </span>
                            <span className="text-slate-500 text-xs capitalize">{fp.claimType.replace("_", " ")}</span>
                          </div>
                          <p className="text-slate-400 text-xs">{fp.explanation}</p>
                          {fp.suggestedFix && (
                            <p className="text-indigo-400 text-xs mt-1">
                              <span className="font-medium">Fix:</span> {fp.suggestedFix.slice(0, 120)}{fp.suggestedFix.length > 120 ? "…" : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required Disclaimers */}
            {result.requiredDisclaimers.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                  Required Disclaimers ({result.requiredDisclaimers.length})
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {result.requiredDisclaimers.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2">
                      <span className="text-amber-400 text-xs mt-0.5">!</span>
                      <span className="text-slate-300 text-xs">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Suggestions</p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {result.suggestions.slice(0, 6).map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 text-xs mt-0.5">→</span>
                      <span className="text-slate-300 text-xs">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Record Detail Panel ──────────────────────────────────────────────────────

function RecordDetail({ record, onClose }: { record: ComplianceRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-10 pb-10 px-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h2 className="text-white font-semibold">Compliance Record</h2>
            <p className="text-slate-400 text-xs mt-0.5">{new Date(record.timestamp).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="flex items-center gap-4">
            <ScoreGauge score={record.score} />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DispositionBadge disposition={record.disposition} />
              </div>
              <div className="text-sm text-slate-300">
                <span className="text-slate-500">Channel:</span>{" "}
                <span className="capitalize">{record.channel.replace("_", " ")}</span>
              </div>
              <div className="text-sm text-slate-300">
                <span className="text-slate-500">Vertical:</span> {record.vertical}
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Content Reviewed</p>
            <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 max-h-32 overflow-y-auto">
              <p className="text-slate-300 text-xs font-mono whitespace-pre-wrap">{record.content}</p>
            </div>
          </div>
          {record.gptAnalysis && (
            <div className="bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">AI Analysis</p>
              <p className="text-slate-300 text-sm leading-relaxed">{record.gptAnalysis}</p>
            </div>
          )}
          {record.flaggedPhrases.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Flagged Phrases ({record.flaggedPhrases.length})</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {record.flaggedPhrases.map((fp, i) => (
                  <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
                    <div className="flex items-start gap-2">
                      <SeverityPip severity={fp.severity} />
                      <div>
                        <span className="text-white text-xs font-mono bg-slate-700 px-1.5 py-0.5 rounded">"{fp.phrase}"</span>
                        <p className="text-slate-400 text-xs mt-1">{fp.explanation}</p>
                        {fp.suggestedFix && <p className="text-indigo-400 text-xs mt-1">{fp.suggestedFix.slice(0, 140)}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {record.requiredDisclaimers.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Required Disclaimers</p>
              <div className="space-y-1.5">
                {record.requiredDisclaimers.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2">
                    <span className="text-amber-400 text-xs mt-0.5">!</span>
                    <span className="text-slate-300 text-xs">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {record.channelViolations.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Channel Violations</p>
              <div className="space-y-1.5">
                {record.channelViolations.map((v, i) => (
                  <div key={i} className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    <span className="text-red-400 text-xs">✕</span>
                    <span className="text-red-300 text-xs">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CompliancePage() {
  const [history, setHistory] = useState<ComplianceRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ComplianceRecord | null>(null);
  const [filterChannel, setFilterChannel] = useState<Channel | "all">("all");
  const [filterDisposition, setFilterDisposition] = useState<Disposition | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { setHistory(loadHistory()); }, []);

  function addRecord(record: ComplianceRecord) {
    const updated = [record, ...history];
    setHistory(updated);
    saveHistory(updated);
  }

  function clearHistory() {
    if (confirm("Clear all compliance history? This cannot be undone.")) {
      setHistory([]);
      saveHistory([]);
    }
  }

  // ─── Derived stats ──────────────────────────────────────────────────────────

  const avgScore = history.length
    ? Math.round(history.reduce((s, r) => s + r.score, 0) / history.length)
    : 0;

  const approveCount = history.filter(r => r.disposition === "approve").length;
  const escalateCount = history.filter(r => r.disposition === "escalate").length;
  const blockCount = history.filter(r => r.disposition === "block").length;

  const trendData = [...history]
    .slice(0, 20)
    .reverse()
    .map((r, i) => ({
      i: i + 1,
      score: r.score,
      label: new Date(r.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));

  const channelDist = CHANNELS.map(c => ({
    name: c.label.replace("Advertisement", "Ad").replace("Landing Page", "Landing"),
    count: history.filter(r => r.channel === c.value).length,
    avg: Math.round(
      history.filter(r => r.channel === c.value).reduce((s, r) => s + r.score, 0) /
        Math.max(1, history.filter(r => r.channel === c.value).length)
    ),
  })).filter(c => c.count > 0);

  // ─── Filtered list ──────────────────────────────────────────────────────────

  const filtered = history.filter(r => {
    if (filterChannel !== "all" && r.channel !== filterChannel) return false;
    if (filterDisposition !== "all" && r.disposition !== filterDisposition) return false;
    if (searchQuery && !r.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.vertical.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Compliance</h1>
          <p className="text-slate-400 text-sm mt-0.5">Medicare marketing compliance engine — CMS MMG, TCPA, FTC</p>
        </div>
        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              Clear History
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            Run Compliance Check
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Avg Compliance Score",
            value: history.length ? `${avgScore}/100` : "—",
            sub: history.length ? (avgScore >= 80 ? "Healthy" : avgScore >= 50 ? "Needs Attention" : "Critical") : "No data",
            color: !history.length ? "text-slate-500" : avgScore >= 80 ? "text-emerald-400" : avgScore >= 50 ? "text-amber-400" : "text-red-400",
          },
          { label: "Total Checks", value: history.length.toString(), sub: "All time", color: "text-white" },
          {
            label: "Approved",
            value: approveCount.toString(),
            sub: history.length ? `${Math.round((approveCount / history.length) * 100)}% pass rate` : "—",
            color: "text-emerald-400",
          },
          {
            label: "Blocked",
            value: blockCount.toString(),
            sub: escalateCount > 0 ? `+${escalateCount} escalated` : "No escalations",
            color: blockCount > 0 ? "text-red-400" : "text-slate-500",
          },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">{s.label}</p>
            <p className={cn("text-3xl font-semibold", s.color)}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      {history.length >= 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Score Trend */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-medium text-sm mb-4">Compliance Score Trend</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="i" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                  labelFormatter={v => `Check #${v}`}
                  formatter={(value: number) => [value, "Score"]}
                />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Channel Distribution */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-medium text-sm mb-4">Avg Score by Channel</h3>
            {channelDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={channelDist} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number, name: string) => [value, name === "avg" ? "Avg Score" : "Checks"]}
                  />
                  <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                    {channelDist.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={entry.avg >= 80 ? "#10b981" : entry.avg >= 50 ? "#f59e0b" : "#ef4444"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-slate-500 text-sm">
                Run checks across multiple channels to see distribution
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit Log */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-700/50">
          <h3 className="text-white font-medium text-sm">Compliance Audit Log</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search content or vertical…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg text-white text-xs px-3 py-1.5 w-44 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
            />
            <select
              value={filterChannel}
              onChange={e => setFilterChannel(e.target.value as Channel | "all")}
              className="bg-slate-700 border border-slate-600 rounded-lg text-white text-xs px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Channels</option>
              {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select
              value={filterDisposition}
              onChange={e => setFilterDisposition(e.target.value as Disposition | "all")}
              className="bg-slate-700 border border-slate-600 rounded-lg text-white text-xs px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Dispositions</option>
              <option value="approve">Approved</option>
              <option value="escalate">Escalated</option>
              <option value="block">Blocked</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center mb-3 text-2xl">✓</div>
            <p className="text-white font-medium">No compliance records yet</p>
            <p className="text-slate-500 text-sm mt-1">
              {history.length > 0 ? "No records match your filters." : "Run your first check to see results here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {filtered.map(record => (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className="flex items-start gap-4 px-5 py-4 hover:bg-slate-700/30 cursor-pointer transition-colors"
              >
                {/* Score circle */}
                <div className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold",
                  record.score >= 80 ? "bg-emerald-500/20 text-emerald-300" :
                  record.score >= 50 ? "bg-amber-500/20 text-amber-300" :
                  "bg-red-500/20 text-red-300"
                )}>
                  {record.score}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <DispositionBadge disposition={record.disposition} />
                    <span className="text-slate-400 text-xs capitalize">{record.channel.replace("_", " ")}</span>
                    <span className="text-slate-600 text-xs">·</span>
                    <span className="text-slate-400 text-xs">{record.vertical}</span>
                    {record.flaggedPhrases.length > 0 && (
                      <>
                        <span className="text-slate-600 text-xs">·</span>
                        <span className="text-orange-400 text-xs">{record.flaggedPhrases.length} flag{record.flaggedPhrases.length !== 1 ? "s" : ""}</span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mt-1.5 line-clamp-1">
                    {record.content.slice(0, 120)}{record.content.length > 120 ? "…" : ""}
                  </p>
                </div>
                {/* Timestamp */}
                <div className="flex-shrink-0 text-xs text-slate-500 whitespace-nowrap">
                  {new Date(record.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  <br />
                  <span className="text-slate-600">
                    {new Date(record.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <CheckModal
          onClose={() => setShowModal(false)}
          onResult={record => { addRecord(record); setShowModal(false); setSelectedRecord(record); }}
        />
      )}
      {selectedRecord && (
        <RecordDetail record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </div>
  );
}
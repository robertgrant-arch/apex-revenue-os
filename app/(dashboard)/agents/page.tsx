"use client";
import { useState } from "react";
import { Search, Play, Pause, Zap, Brain, Palette, Radio, Megaphone, GitBranch, BarChart2, ChevronRight, Clock, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

const AGENTS = [
  {
    id: "ORACLE", name: "ORACLE", role: "Lead Intelligence", icon: Brain, color: "emerald",
    description: "Scores and qualifies inbound leads using behavioral signals, firmographic data, and predictive ML models.",
    status: "running", uptime: "99.8%", actionsToday: 1840, successRate: 97.2,
    model: "claude-sonnet-4-20250514", latency: "1.2s",
    log: [
      { time: "14:22:01", action: "Scored lead: Margaret Chen → 94/100", type: "success" },
      { time: "14:21:47", action: "Flagged duplicate: John Smith (existing contact)", type: "warning" },
      { time: "14:21:12", action: "Scored 12 leads in batch job #4821", type: "success" },
      { time: "14:20:33", action: "Low-quality lead rejected: score 22", type: "info" },
      { time: "14:19:55", action: "Webhook received: 34 new leads from Facebook", type: "info" },
      { time: "14:18:41", action: "Scored lead: Patricia Davis → 91/100", type: "success" },
    ],
  },
  {
    id: "ARCHITECT", name: "ARCHITECT", role: "Campaign Strategy", icon: GitBranch, color: "violet",
    description: "Designs and optimizes campaign architecture, audience segmentation, and budget allocation strategies.",
    status: "running", uptime: "98.4%", actionsToday: 420, successRate: 94.8,
    model: "claude-sonnet-4-20250514", latency: "3.4s",
    log: [
      { time: "14:15:22", action: "Rebuilt Medicare AEP targeting model", type: "success" },
      { time: "14:08:11", action: "Reallocated $4,200 from underperforming ad set", type: "success" },
      { time: "13:55:44", action: "A/B test concluded: Variant B +18% CTR", type: "success" },
      { time: "13:42:10", action: "Audience overlap detected in campaigns #12, #18", type: "warning" },
    ],
  },
  {
    id: "CREATOR", name: "CREATOR", role: "Creative Generation", icon: Palette, color: "amber",
    description: "Generates ad copy, email sequences, landing page content, and creative assets optimized per vertical.",
    status: "running", uptime: "99.1%", actionsToday: 312, successRate: 91.0,
    model: "claude-sonnet-4-20250514", latency: "4.8s",
    log: [
      { time: "14:16:08", action: "Generated 6 ad variants for Medicare AEP", type: "success" },
      { time: "14:10:33", action: "Email sequence drafted: 5-touch Auto renewal", type: "success" },
      { time: "14:02:19", action: "Compliance review flagged: 2 claims need softening", type: "warning" },
      { time: "13:48:55", action: "Landing page copy personalized for CA audience", type: "success" },
    ],
  },
  {
    id: "SIGNAL", name: "SIGNAL", role: "Intent Detection", icon: Radio, color: "blue",
    description: "Monitors first and third-party signals to detect real-time purchase intent and trigger workflows.",
    status: "running", uptime: "99.9%", actionsToday: 2840, successRate: 88.4,
    model: "claude-sonnet-4-20250514", latency: "0.8s",
    log: [
      { time: "14:22:18", action: "Intent signal: 'medicare supplement plans' — 48 users", type: "success" },
      { time: "14:21:44", action: "Retirement search pattern detected — segment created", type: "success" },
      { time: "14:20:12", action: "Churned customer re-engagement trigger fired", type: "info" },
      { time: "14:18:30", action: "Price comparison intent: 12 auto leads flagged hot", type: "success" },
    ],
  },
  {
    id: "REACH", name: "REACH", role: "Multi-channel Outreach", icon: Megaphone, color: "rose",
    description: "Executes personalized outreach across email, SMS, paid social, and display channels.",
    status: "idle", uptime: "97.6%", actionsToday: 680, successRate: 82.1,
    model: "claude-sonnet-4-20250514", latency: "2.1s",
    log: [
      { time: "13:48:10", action: "Email sequence launched: 2,400 contacts", type: "success" },
      { time: "13:35:22", action: "SMS campaign delivered: 98.2% delivery rate", type: "success" },
      { time: "13:20:44", action: "Retargeting audience synced to Meta Ads", type: "success" },
      { time: "13:05:11", action: "Unsubscribe processed: 14 contacts removed", type: "info" },
    ],
  },
  {
    id: "CONVERT", name: "CONVERT", role: "Sales Enablement", icon: Zap, color: "amber",
    description: "Generates personalized proposals, handles objections, and guides leads through the final close.",
    status: "idle", uptime: "98.2%", actionsToday: 228, successRate: 93.4,
    model: "claude-sonnet-4-20250514", latency: "2.9s",
    log: [
      { time: "13:44:08", action: "Proposal PDF generated for James Thompson", type: "success" },
      { time: "13:30:55", action: "Objection script updated: price concern variant", type: "success" },
      { time: "13:15:22", action: "Follow-up sequence triggered for 8 warm leads", type: "info" },
    ],
  },
  {
    id: "LOOP", name: "LOOP", role: "Attribution & Learning", icon: BarChart2, color: "violet",
    description: "Closes the learning loop with multi-touch attribution, ROI analysis, and model retraining signals.",
    status: "idle", uptime: "99.3%", actionsToday: 94, successRate: 99.1,
    model: "claude-sonnet-4-20250514", latency: "6.2s",
    log: [
      { time: "13:00:00", action: "Attribution model updated with 187 closed deals", type: "success" },
      { time: "12:00:00", action: "Hourly performance report generated", type: "info" },
      { time: "11:00:00", action: "Model drift detected: retraining queued", type: "warning" },
    ],
  },
];

type AgentStatus = "running" | "idle" | "paused";

const colorMap: Record<string, string> = {
  emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  violet: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  rose: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

const statusColor: Record<AgentStatus, string> = {
  running: "bg-emerald-400",
  idle: "bg-slate-500",
  paused: "bg-amber-400",
};

const logTypeColor: Record<string, string> = {
  success: "text-emerald-400",
  warning: "text-amber-400",
  info: "text-slate-400",
  error: "text-rose-400",
};

export default function AgentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AgentStatus>("all");
  const [selected, setSelected] = useState<string | null>("ORACLE");
  const [agentStates, setAgentStates] = useState<Record<string, AgentStatus>>(
    Object.fromEntries(AGENTS.map(a => [a.id, a.status as AgentStatus]))
  );

  const filtered = AGENTS.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || agentStates[a.id] === statusFilter;
    return matchSearch && matchStatus;
  });

  const selectedAgent = AGENTS.find(a => a.id === selected);

  const handleStart = (id: string) => {
    setAgentStates(s => ({ ...s, [id]: "running" }));
    toast.success(`${id} agent started`);
  };
  const handlePause = (id: string) => {
    setAgentStates(s => ({ ...s, [id]: "paused" }));
    toast(`${id} agent paused`, "warning");
  };
  const handleStop = (id: string) => {
    setAgentStates(s => ({ ...s, [id]: "idle" }));
    toast(`${id} agent stopped`, "info");
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Agents</h1>
          <p className="text-slate-400 text-sm mt-0.5">7-agent revenue operating system</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {Object.values(agentStates).filter(s => s === "running").length} running
          </span>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        {(["all", "running", "idle", "paused"] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-2 text-sm rounded-lg font-medium capitalize transition-all border", statusFilter === s ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:text-white")}>
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-72 flex-shrink-0 space-y-2 overflow-y-auto">
          {filtered.map(agent => {
            const Icon = agent.icon;
            const st = agentStates[agent.id];
            return (
              <Card key={agent.id} hoverable onClick={() => setSelected(agent.id)} className={cn("p-4 transition-all", selected === agent.id && "border-emerald-500/40 bg-emerald-500/5")}>
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg border", colorMap[agent.color])}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{agent.name}</span>
                      <span className={cn("w-1.5 h-1.5 rounded-full", statusColor[st])} />
                    </div>
                    <p className="text-xs text-slate-400 truncate">{agent.role}</p>
                  </div>
                  <ChevronRight className={cn("w-4 h-4 text-slate-600 transition-transform", selected === agent.id && "rotate-90 text-emerald-400")} />
                </div>
                <div className="mt-3 flex gap-2">
                  <div className="flex-1 text-center">
                    <p className="text-xs text-slate-500">Actions</p>
                    <p className="text-sm font-semibold text-white">{agent.actionsToday.toLocaleString()}</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-xs text-slate-500">Success</p>
                    <p className="text-sm font-semibold text-emerald-400">{agent.successRate}%</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {selectedAgent && (
          <div className="flex-1 space-y-4 overflow-y-auto">
            <Card className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-3 rounded-xl border", colorMap[selectedAgent.color])}>
                    <selectedAgent.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedAgent.name}</h2>
                    <p className="text-sm text-slate-400">{selectedAgent.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => agentStates[selectedAgent.id] === "running" ? handlePause(selectedAgent.id) : handleStart(selectedAgent.id)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all", agentStates[selectedAgent.id] === "running" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30")}
                  >
                    {agentStates[selectedAgent.id] === "running" ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Start</>}
                  </button>
                  <button
                    onClick={() => handleStop(selectedAgent.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 transition-all"
                  >
                    <Square className="w-3.5 h-3.5" /> Stop
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-4">{selectedAgent.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Status", value: agentStates[selectedAgent.id], highlight: agentStates[selectedAgent.id] === "running" ? "text-emerald-400" : "text-slate-400" },
                  { label: "Uptime", value: selectedAgent.uptime, highlight: "text-emerald-400" },
                  { label: "Avg Latency", value: selectedAgent.latency, highlight: "text-white" },
                  { label: "Actions Today", value: selectedAgent.actionsToday.toLocaleString(), highlight: "text-white" },
                ].map(stat => (
                  <div key={stat.label} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                    <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                    <p className={cn("text-sm font-semibold capitalize", stat.highlight)}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-white">Action Log</h3>
              </div>
              <div className="space-y-2">
                {selectedAgent.log.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-700/30 last:border-0">
                    <CheckCircle2 className={cn("w-3.5 h-3.5 mt-0.5 flex-shrink-0", logTypeColor[entry.type])} />
                    <div className="flex-1">
                      <p className="text-sm text-slate-300">{entry.action}</p>
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0">{entry.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function Play({ className }: { className?: string }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>;
}
function Pause({ className }: { className?: string }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>;
}
function Square({ className }: { className?: string }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z" /></svg>;
}

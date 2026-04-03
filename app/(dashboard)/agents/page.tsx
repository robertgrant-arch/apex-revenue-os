"use client";
import { useState } from "react";
import {
  Brain, Zap, Shield, Megaphone, BarChart2, Users,
  Activity, CheckCircle, Clock, AlertCircle, Play, Pause, Settings
} from "lucide-react";
import { Toast, useToast } from "@/components/ui/Toast";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Agent {
  id: string;
  name: string;
  role: string;
  status: "active" | "idle" | "error" | "paused";
  tasksToday: number;
  successRate: number;
  avgLatency: number;
  description: string;
  capabilities: string[];
  recentActions: RecentAction[];
  icon: React.ReactNode;
  color: string;
}

interface RecentAction {
  id: string;
  action: string;
  result: string;
  time: string;
  status: "success" | "pending" | "error";
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const AGENTS: Agent[] = [
  {
    id: "lead-scorer",
    name: "LeadScorer",
    role: "Lead Intelligence",
    status: "active",
    tasksToday: 1847,
    successRate: 98.2,
    avgLatency: 142,
    description: "Scores and prioritizes inbound leads using ML models trained on 3M+ historical conversions. Integrates Medicare compliance rules and agent availability.",
    capabilities: ["Real-time lead scoring", "Intent classification", "Compliance pre-screening", "Agent routing", "Duplicate detection"],
    icon: <Brain size={20} />,
    color: "violet",
    recentActions: [
      { id: "a1", action: "Scored lead #L-20481", result: "Score: 94 → Routed to Agent Martinez", time: "2m ago", status: "success" },
      { id: "a2", action: "Flagged duplicate lead", result: "L-20479 matches L-20301", time: "4m ago", status: "success" },
      { id: "a3", action: "Compliance pre-screen", result: "PASSED — Medicare eligibility verified", time: "5m ago", status: "success" },
      { id: "a4", action: "Scored lead #L-20475", result: "Score: 61 → Queued for nurture", time: "7m ago", status: "success" },
    ],
  },
  {
    id: "campaign-optimizer",
    name: "CampaignOptimizer",
    role: "Media & Spend",
    status: "active",
    tasksToday: 312,
    successRate: 94.7,
    avgLatency: 890,
    description: "Continuously optimizes bid strategies, creative rotation, and budget allocation across channels. Runs multi-armed bandit experiments for creative testing.",
    capabilities: ["Bid optimization", "Budget reallocation", "Creative A/B testing", "Channel mix modeling", "ROAS forecasting"],
    icon: <Zap size={20} />,
    color: "amber",
    recentActions: [
      { id: "b1", action: "Shifted $1,200 budget", result: "Facebook → Google (better CPL signal)", time: "12m ago", status: "success" },
      { id: "b2", action: "Paused underperforming creative", result: "CTR 1.2% < threshold 2.0%", time: "34m ago", status: "success" },
      { id: "b3", action: "Launched A/B test", result: "Medicare video vs. static image", time: "1h ago", status: "success" },
      { id: "b4", action: "ROAS forecast updated", result: "Q3 projected: 4.2x (↑ from 3.8x)", time: "2h ago", status: "success" },
    ],
  },
  {
    id: "compliance-guardian",
    name: "ComplianceGuardian",
    role: "Regulatory & Legal",
    status: "active",
    tasksToday: 5621,
    successRate: 99.8,
    avgLatency: 48,
    description: "Real-time compliance monitoring for all outbound communications, ads, and agent scripts. Enforces CMS, TCPA, and state-specific regulations automatically.",
    capabilities: ["CMS ad review", "TCPA scrubbing", "Script compliance check", "DNC list management", "Audit trail generation"],
    icon: <Shield size={20} />,
    color: "emerald",
    recentActions: [
      { id: "c1", action: "Blocked non-compliant SMS", result: "Missing opt-out language", time: "1m ago", status: "success" },
      { id: "c2", action: "Approved email campaign", result: "Medicare Advantage Q3 — PASSED", time: "8m ago", status: "success" },
      { id: "c3", action: "DNC scrub completed", result: "847 numbers removed from list", time: "22m ago", status: "success" },
      { id: "c4", action: "Script review — Agent Chen", result: "1 flag: unapproved benefit claim", time: "45m ago", status: "error" },
    ],
  },
  {
    id: "content-creator",
    name: "ContentCreator",
    role: "Creative Generation",
    status: "idle",
    tasksToday: 47,
    successRate: 91.5,
    avgLatency: 4200,
    description: "Generates compliant ad copy, landing pages, email sequences, and scripts tuned to each vertical and audience segment using retrieval-augmented generation.",
    capabilities: ["Ad copy generation", "Landing page creation", "Email sequence drafting", "Script writing", "Personalization at scale"],
    icon: <Megaphone size={20} />,
    color: "blue",
    recentActions: [
      { id: "d1", action: "Generated 12 ad variants", result: "ACA open enrollment campaign", time: "15m ago", status: "success" },
      { id: "d2", action: "Drafted email sequence", result: "Final expense — 5-touch nurture", time: "1h ago", status: "success" },
      { id: "d3", action: "Compliance revision", result: "Removed 'guaranteed' from copy", time: "2h ago", status: "pending" },
    ],
  },
  {
    id: "analytics-engine",
    name: "AnalyticsEngine",
    role: "Insights & Reporting",
    status: "active",
    tasksToday: 89,
    successRate: 97.1,
    avgLatency: 2100,
    description: "Aggregates cross-channel attribution, builds real-time performance dashboards, detects anomalies, and surfaces actionable insights to the revenue team.",
    capabilities: ["Multi-touch attribution", "Anomaly detection", "Revenue forecasting", "Cohort analysis", "Automated reporting"],
    icon: <BarChart2 size={20} />,
    color: "pink",
    recentActions: [
      { id: "e1", action: "Anomaly detected", result: "CPL spike +40% — Medicare, Facebook", time: "3m ago", status: "error" },
      { id: "e2", action: "Weekly report generated", result: "Sent to 6 stakeholders", time: "2h ago", status: "success" },
      { id: "e3", action: "Attribution model updated", result: "Added new touchpoint: Direct Mail", time: "4h ago", status: "success" },
    ],
  },
  {
    id: "crm-sync",
    name: "CRMSync",
    role: "Data & Integrations",
    status: "paused",
    tasksToday: 0,
    successRate: 96.3,
    avgLatency: 320,
    description: "Bidirectional sync between APEX and downstream CRMs. Manages lead handoffs, updates disposition data, and maintains data hygiene across the stack.",
    capabilities: ["Salesforce sync", "HubSpot integration", "Lead deduplication", "Disposition tracking", "Data enrichment"],
    icon: <Users size={20} />,
    color: "teal",
    recentActions: [
      { id: "f1", action: "Sync paused", result: "Manual intervention requested", time: "1h ago", status: "pending" },
      { id: "f2", action: "Synced 234 leads", result: "To Salesforce — Medicare Q3", time: "3h ago", status: "success" },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const statusConfig = {
  active: { label: "Active", color: "emerald", icon: <CheckCircle size={12} /> },
  idle: { label: "Idle", color: "blue", icon: <Clock size={12} /> },
  error: { label: "Error", color: "red", icon: <AlertCircle size={12} /> },
  paused: { label: "Paused", color: "amber", icon: <Pause size={12} /> },
};

const actionStatusIcon = (s: RecentAction["status"]) => {
  if (s === "success") return <CheckCircle size={13} className="text-emerald-400 shrink-0" />;
  if (s === "error") return <AlertCircle size={13} className="text-red-400 shrink-0" />;
  return <Clock size={13} className="text-amber-400 shrink-0" />;
};

// ── Page ───────────────────────────────────────────────────────────────────────
export default function AgentsPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [selectedId, setSelectedId] = useState<string>(AGENTS[0].id);

  const selected = agents.find((a) => a.id === selectedId) ?? agents[0];
  const sc = statusConfig[selected.status];

  const toggleStatus = (id: string) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const next = a.status === "paused" ? "active" : "paused";
        addToast(`${a.name} ${next === "active" ? "resumed" : "paused"}`, "info");
        return { ...a, status: next };
      })
    );
  };

  return (
    <div className="p-6 space-y-6">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Agent Control Center</h1>
        <p className="text-slate-400 text-sm mt-1">Monitor and manage your AI agent fleet</p>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Agents", value: agents.filter(a => a.status === "active").length, color: "emerald" },
          { label: "Tasks Today", value: agents.reduce((a, ag) => a + ag.tasksToday, 0).toLocaleString(), color: "violet" },
          { label: "Avg Success Rate", value: (agents.reduce((a, ag) => a + ag.successRate, 0) / agents.length).toFixed(1) + "%", color: "blue" },
          { label: "Agents Paused", value: agents.filter(a => a.status === "paused" || a.status === "idle").length, color: "amber" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className={`text-2xl font-bold text-${s.color}-400`}>{s.value}</div>
            <div className="text-slate-400 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* All Agents Grid */}
        <div className="col-span-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">All Agents</h2>
          {agents.map((agent) => {
            const asc = statusConfig[agent.status];
            const isSelected = agent.id === selectedId;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedId(agent.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? `border-${agent.color}-500/40 bg-${agent.color}-500/10`
                    : "border-slate-700/50 bg-slate-800/50 hover:border-slate-600/50 hover:bg-slate-800"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-${agent.color}-500/10 flex items-center justify-center text-${agent.color}-400 shrink-0`}>
                  {agent.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{agent.name}</div>
                  <div className="text-xs text-slate-500">{agent.role}</div>
                </div>
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-${asc.color}-500/10 text-${asc.color}-400 border border-${asc.color}-500/20`}>
                  {asc.icon}{asc.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Agent Detail Panel */}
        <div className="col-span-8 space-y-4">
          {/* Detail Header */}
          <div className={`flex items-start justify-between p-5 rounded-xl border border-${selected.color}-500/30 bg-${selected.color}-500/5`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-${selected.color}-500/15 flex items-center justify-center text-${selected.color}-400`}>
                {selected.icon}
              </div>
              <div>
                <div className="text-xl font-bold text-white">{selected.name}</div>
                <div className="text-slate-400 text-sm">{selected.role}</div>
                <span className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-${sc.color}-500/10 text-${sc.color}-400 border border-${sc.color}-500/20`}>
                  {sc.icon}{sc.label}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleStatus(selected.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700 text-sm transition-all"
              >
                {selected.status === "paused" ? <Play size={14} /> : <Pause size={14} />}
                {selected.status === "paused" ? "Resume" : "Pause"}
              </button>
              <button
                onClick={() => addToast(`${selected.name} settings — coming soon`, "info")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700 text-sm transition-all"
              >
                <Settings size={14} /> Configure
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Tasks Today", value: selected.tasksToday.toLocaleString(), icon: <Activity size={16} /> },
              { label: "Success Rate", value: `${selected.successRate}%`, icon: <CheckCircle size={16} /> },
              { label: "Avg Latency", value: `${selected.avgLatency}ms`, icon: <Zap size={16} /> },
            ].map((m) => (
              <div key={m.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <div className={`text-${selected.color}-400 mb-2`}>{m.icon}</div>
                <div className="text-xl font-bold text-white">{m.value}</div>
                <div className="text-slate-500 text-xs mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Description + Capabilities */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Description</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{selected.description}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Capabilities</h3>
              <ul className="space-y-1.5">
                {selected.capabilities.map((cap) => (
                  <li key={cap} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle size={12} className={`text-${selected.color}-400 shrink-0`} />
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recent Actions */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Recent Actions</h3>
            <div className="space-y-2">
              {selected.recentActions.map((action) => (
                <div key={action.id} className="flex items-start gap-3 py-2 border-b border-slate-700/30 last:border-0">
                  {actionStatusIcon(action.status)}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-white">{action.action}</span>
                    <span className="text-xs text-slate-500 ml-2">{action.result}</span>
                  </div>
                  <span className="text-xs text-slate-600 shrink-0">{action.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
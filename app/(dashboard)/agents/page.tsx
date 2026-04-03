"use client";

import { useState, useEffect, useCallback } from "react";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import * as store from "@/lib/store";

interface AgentConfig { name: string; role: string; description: string; color: string; }
interface AgentStatus { id: string; name: string; status: "running" | "idle" | "error"; lastAction: string; lastActionTime: string; }
interface AgentLog { id: string; agent: string; action: string; timestamp: string; success: boolean; }

const AGENTS: AgentConfig[] = [
  { name: "ORACLE", role: "Lead Scoring", description: "Scores and prioritizes leads using predictive AI models", color: "text-blue-400" },
  { name: "ARCHITECT", role: "Campaign Builder", description: "Designs and optimizes campaign targeting strategies", color: "text-violet-400" },
  { name: "CREATOR", role: "Content Generation", description: "Generates ad copy, emails, and creative assets", color: "text-emerald-400" },
  { name: "SIGNAL", role: "Intent Detection", description: "Monitors behavioral signals and intent data", color: "text-amber-400" },
  { name: "REACH", role: "Outreach Automation", description: "Automates email sequences and outreach workflows", color: "text-rose-400" },
  { name: "CONVERT", role: "Proposal Engine", description: "Personalizes proposals and closing documents", color: "text-cyan-400" },
  { name: "LOOP", role: "Attribution & Analytics", description: "Tracks attribution and generates performance reports", color: "text-orange-400" },
];

const STATUS_KEY = "agent_statuses";
const LOG_KEY = "agent_logs";

export default function AgentsPage() {
  const [statuses, setStatuses] = useState<AgentStatus[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(() => {
    const s = store.getAll<AgentStatus>(STATUS_KEY);
    // Initialize statuses for agents that don't have one yet
    const existing = new Set(s.map(x => x.name));
    AGENTS.forEach(a => {
      if (!existing.has(a.name)) {
        const newStatus: AgentStatus = { id: `as-${a.name}`, name: a.name, status: "idle", lastAction: "", lastActionTime: "" };
        store.create<AgentStatus>(STATUS_KEY, newStatus);
        s.push(newStatus);
      }
    });
    setStatuses(s);
    setLogs(store.getAll<AgentLog>(LOG_KEY));
  }, []);

  useEffect(() => { load(); }, [load]);

  function toggleAgent(name: string) {
    const current = statuses.find(s => s.name === name);
    if (!current) return;
    const newStatus = current.status === "running" ? "idle" : "running";
    store.update<AgentStatus>(STATUS_KEY, current.id, { status: newStatus, lastAction: newStatus === "running" ? "Agent started" : "Agent stopped", lastActionTime: new Date().toISOString() });
    const log: AgentLog = { id: `log-${Date.now()}`, agent: name, action: newStatus === "running" ? "Agent started" : "Agent stopped", timestamp: new Date().toISOString(), success: true };
    store.create<AgentLog>(LOG_KEY, log);
    load();
  }

  const running = statuses.filter(s => s.status === "running").length;
  const todayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString());
  const successRate = todayLogs.length ? ((todayLogs.filter(l => l.success).length / todayLogs.length) * 100).toFixed(0) : "--";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div><h1 className="text-2xl font-bold">AI Agents</h1><p className="text-slate-400 text-sm mt-1">Manage your 7 autonomous AI agents</p></div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[{ l: "Total Agents", v: "7" }, { l: "Running", v: String(running) }, { l: "Actions Today", v: String(todayLogs.length) }, { l: "Success Rate", v: `${successRate}%` }].map(s => (
            <Card key={s.l} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <div className="text-xs text-slate-500 uppercase mb-2">{s.l}</div>
              <div className="text-2xl font-bold text-emerald-400">{s.v}</div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {AGENTS.map(agent => {
            const status = statuses.find(s => s.name === agent.name);
            const agentLogs = logs.filter(l => l.agent === agent.name).slice(-5).reverse();
            const isRunning = status?.status === "running";
            return (
              <div key={agent.name} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2.5 h-2.5 rounded-full", isRunning ? "bg-emerald-400 animate-pulse" : "bg-slate-600")} />
                    <div><p className={cn("text-sm font-bold", agent.color)}>{agent.name}</p><p className="text-xs text-slate-500">{agent.role}</p></div>
                  </div>
                  <button onClick={() => toggleAgent(agent.name)} className={cn("text-xs px-3 py-1 rounded-lg font-medium border", isRunning ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10")}>
                    {isRunning ? "Stop" : "Start"}
                  </button>
                </div>
                <p className="text-xs text-slate-400">{agent.description}</p>
                {status?.lastAction && <p className="text-xs text-slate-500">Last: {status.lastAction}</p>}
                <button onClick={() => setExpanded(expanded === agent.name ? null : agent.name)} className="text-xs text-slate-500 hover:text-slate-300 self-start">
                  {expanded === agent.name ? "Hide logs" : `View logs (${agentLogs.length})`}
                </button>
                {expanded === agent.name && (
                  <div className="space-y-1 pt-2 border-t border-slate-700/50">
                    {agentLogs.length === 0 ? <p className="text-xs text-slate-600">No logs yet</p> : agentLogs.map(l => (
                      <div key={l.id} className="flex justify-between text-xs">
                        <span className={l.success ? "text-emerald-400" : "text-red-400"}>{l.action}</span>
                        <span className="text-slate-600">{new Date(l.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
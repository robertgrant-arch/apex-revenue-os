"use client";

import { ChevronLeft, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusDot } from "@/components/ui/StatusDot";
import { type Agent, auditLog, AGENTS } from "@/lib/data";

interface AgentDetailProps {
  agent: Agent;
  onBack: () => void;
}

export function AgentDetail({ agent, onBack }: AgentDetailProps) {
  const recentOutputs = auditLog
    .filter((l) => l.agent === agent.name)
    .concat(auditLog.filter((l) => l.agent !== agent.name).slice(0, 3))
    .slice(0, 5);

  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ChevronLeft size={14} />
        Back to Agents
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: agent.color + "20" }}
              >
                <agent.icon size={22} style={{ color: agent.color }} />
              </div>
              <div>
                <div className="font-bold text-white text-lg">{agent.name}</div>
                <div className="text-slate-400 text-sm">{agent.role}</div>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {agent.desc}
            </p>
            <div className="space-y-2.5">
              {[
                ["Status",       <span className="flex items-center gap-1.5"><StatusDot status={agent.status} /><span className="text-white capitalize">{agent.status}</span></span>],
                ["Confidence",   <span className="text-white">{agent.confidence}%</span>],
                ["Total Actions",<span className="text-white">{agent.actions.toLocaleString()}</span>],
                ["Last Action",  <span className="text-emerald-400 text-right">{agent.lastAction}</span>],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">{k as string}</span>
                  {v as React.ReactNode}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Confidence Score
            </h4>
            <div
              className="text-4xl font-bold mb-2"
              style={{ color: agent.color }}
            >
              {agent.confidence}%
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${agent.confidence}%`,
                  background: agent.color,
                }}
              />
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Based on last 500 decisions
            </div>
          </Card>

          {/* Mini agent grid */}
          <Card className="p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              All Agents
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {AGENTS.map((a) => (
                <div
                  key={a.id}
                  className={`flex flex-col items-center p-1.5 rounded-lg ${a.id === agent.id ? "bg-slate-700" : ""}`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center mb-1"
                    style={{ background: a.color + "20" }}
                  >
                    <a.icon size={12} style={{ color: a.color }} />
                  </div>
                  <div className="text-[9px] text-slate-500 text-center leading-tight">
                    {a.name}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right columns */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Prompt Template
            </h4>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap overflow-x-auto">
              {agent.promptTemplate}
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Recent Outputs
            </h4>
            <div className="space-y-2">
              {recentOutputs.map((l, i) => {
                const ag = AGENTS.find((a) => a.name === l.agent);
                return (
                  <div key={i} className="p-3 bg-slate-900/50 rounded-lg group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {ag && (
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center"
                            style={{ background: ag.color + "20" }}
                          >
                            <ag.icon size={10} style={{ color: ag.color }} />
                          </div>
                        )}
                        <span className="text-xs font-bold text-white">
                          {l.agent}
                        </span>
                        <span className="text-xs text-slate-500">{l.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge color="emerald">{l.confidence}% conf.</Badge>
                        <button className="text-slate-600 hover:text-slate-400 transition-colors">
                          <Info size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-300">{l.decision}</div>
                    <div className="text-xs text-emerald-400/80 mt-1">
                      Impact: {l.impact}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

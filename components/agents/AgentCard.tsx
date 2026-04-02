"use client";

import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusDot } from "@/components/ui/StatusDot";
import { type Agent } from "@/lib/data";

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const Icon = agent.icon;
  return (
    <Card
      className="p-4 hover:border-slate-600 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: agent.color + "20" }}
        >
          <Icon size={18} style={{ color: agent.color }} />
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status={agent.status} />
          <span className="text-xs text-slate-400 capitalize">{agent.status}</span>
        </div>
      </div>
      <h3 className="text-sm font-bold text-white mb-0.5">{agent.name}</h3>
      <p className="text-xs text-slate-500 mb-3">{agent.role}</p>
      <p className="text-xs text-slate-400 mb-3 line-clamp-2">{agent.desc}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500">
            <span className="text-white font-medium">{agent.confidence}%</span> conf.
          </span>
          <span className="text-slate-500">
            <span className="text-white font-medium">{agent.actions.toLocaleString()}</span> actions
          </span>
        </div>
        <ChevronRight size={14} className="text-slate-600" />
      </div>
    </Card>
  );
}

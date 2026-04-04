"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  createWorkflow,
  executeWorkflow,
  listWorkflows,
  deleteWorkflow,
  submitHumanApproval,
  WORKFLOW_NODES,
  type WorkflowState,
  type WorkflowNodeId,
  type NodeStatus,
} from "@/lib/workflowEngine";

// ─── Constants ─────────────────────────────────────────────────────────────────

const EXECUTION_ORDER: WorkflowNodeId[] = [
  "brief_intake",
  "compliance_retrieval",
  "creative_planning",
  "copy_generation",
  "image_generation",
  "policy_enforcement",
  "human_approval",
  "publishing",
  "measurement",
];

const NODE_COLORS: Record<string, string> = {
  brief_intake: "#6366f1",
  compliance_retrieval: "#f59e0b",
  creative_planning: "#06b6d4",
  copy_generation: "#8b5cf6",
  image_generation: "#ec4899",
  policy_enforcement: "#f59e0b",
  human_approval: "#ef4444",
  publishing: "#10b981",
  measurement: "#64748b",
};

const STATUS_COLORS: Record<NodeStatus, string> = {
  idle: "#334155",
  running: "#6366f1",
  completed: "#10b981",
  error: "#ef4444",
  waiting_approval: "#f59e0b",
  skipped: "#475569",
};

const VERTICALS = ["Medicare", "Medicare Advantage", "Medicare Supplement", "Part D", "ACA/Marketplace"];
const CHANNELS = ["ad", "sms", "voice", "landing_page"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

function durationMs(iso?: string, end?: string) {
  if (!iso) return null;
  const endTime = end ? new Date(end).getTime() : Date.now();
  const ms = endTime - new Date(iso).getTime();
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusDot({ status }: { status: NodeStatus }) {
  const color = STATUS_COLORS[status];
  return (
    <span
      className={cn("inline-block w-2 h-2 rounded-full flex-shrink-0", status === "running" && "animate-pulse")}
      style={{ background: color }}
    />
  );
}

function WfStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    completed: { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/25" },
    running: { bg: "bg-blue-500/15", text: "text-blue-300", border: "border-blue-500/25" },
    paused: { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/25" },
    failed: { bg: "bg-red-500/15", text: "text-red-300", border: "border-red-500/25" },
    pending: { bg: "bg-slate-700/50", text: "text-slate-400", border: "border-slate-600" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border", s.bg, s.text, s.border)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", status === "running" && "animate-pulse")}
        style={{ background: STATUS_COLORS[status as NodeStatus] ?? "#475569" }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Workflow Graph ───────────────────────────────────────────────────────────

function WorkflowGraph({ workflow }: { workflow: WorkflowState | null }) {
  const W = 780;
  const NODE_W = 148;
  const NODE_H = 56;
  const COL_W = 170;
  const ROW_H = 90;

  // 3-column layout: 3 + 3 + 3
  const LAYOUT: [number, number][] = [
    [0, 0], [1, 0], [2, 0],
    [0, 1], [1, 1], [2, 1],
    [0, 2], [1, 2], [2, 2],
  ];

  const startX = (W - 3 * COL_W - NODE_W) / 2 + 10;
  const startY = 20;

  const nodePos = EXECUTION_ORDER.map((id, i) => ({
    id,
    x: startX + LAYOUT[i][0] * COL_W,
    y: startY + LAYOUT[i][1] * ROW_H,
  }));

  const posMap = Object.fromEntries(nodePos.map(n => [n.id, { x: n.x, y: n.y }]));

  // Edges: sequential + cross-row
  const EDGES: [WorkflowNodeId, WorkflowNodeId][] = [
    ["brief_intake", "compliance_retrieval"],
    ["compliance_retrieval", "creative_planning"],
    ["creative_planning", "copy_generation"],
    ["copy_generation", "image_generation"],
    ["image_generation", "policy_enforcement"],
    ["policy_enforcement", "human_approval"],
    ["human_approval", "publishing"],
    ["publishing", "measurement"],
  ];

  const H = startY + 3 * ROW_H + NODE_H + 20;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <marker id="ag-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
        <marker id="ag-arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>

      {/* Edges */}
      {EDGES.map(([from, to]) => {
        const f = posMap[from];
        const t = posMap[to];
        if (!f || !t) return null;

        const fromActive = workflow?.nodes[from]?.status === "completed";
        const color = fromActive ? "#6366f1" : "#334155";
        const marker = fromActive ? "url(#ag-arrow-active)" : "url(#ag-arrow)";

        const fx = f.x + NODE_W / 2;
        const fy = f.y + NODE_H / 2;
        const tx = t.x + NODE_W / 2;
        const ty = t.y + NODE_H / 2;

        // Same row: horizontal
        if (LAYOUT[EXECUTION_ORDER.indexOf(from)][1] === LAYOUT[EXECUTION_ORDER.indexOf(to)][1]) {
          const x1 = f.x + NODE_W;
          const x2 = t.x;
          const y = fy;
          return (
            <line key={`${from}-${to}`} x1={x1 + 2} y1={y} x2={x2 - 2} y2={y}
              stroke={color} strokeWidth="1.5" markerEnd={marker} />
          );
        }

        // Cross-row: elbow
        const midY = f.y + NODE_H + (t.y - f.y - NODE_H) / 2;
        return (
          <path
            key={`${from}-${to}`}
            d={`M ${fx} ${f.y + NODE_H} L ${fx} ${midY} L ${tx} ${midY} L ${tx} ${t.y}`}
            fill="none" stroke={color} strokeWidth="1.5" markerEnd={marker}
          />
        );
      })}

      {/* Nodes */}
      {nodePos.map(({ id, x, y }) => {
        const def = WORKFLOW_NODES[id];
        const nodeState = workflow?.nodes[id];
        const status: NodeStatus = nodeState?.status ?? "idle";
        const isActive = workflow?.currentNodeId === id;
        const statusColor = STATUS_COLORS[status];
        const nodeColor = NODE_COLORS[id] ?? "#475569";

        return (
          <g key={id}>
            {/* Glow when active */}
            {isActive && (
              <rect x={x - 3} y={y - 3} width={NODE_W + 6} height={NODE_H + 6} rx="11"
                fill="none" stroke={nodeColor} strokeWidth="2" opacity="0.4">
                <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.5s" repeatCount="indefinite" />
              </rect>
            )}
            {/* Node body */}
            <rect x={x} y={y} width={NODE_W} height={NODE_H} rx="8"
              fill={status === "idle" ? "#1e293b" : status === "completed" ? "#0f2a1e" : status === "running" ? "#1a1a3e" : status === "error" ? "#2a0f0f" : status === "waiting_approval" ? "#2a1f0a" : "#1e293b"}
              stroke={status === "idle" ? "#334155" : statusColor}
              strokeWidth={isActive ? 1.5 : 0.75}
            />
            {/* Status pip */}
            <circle cx={x + NODE_W - 12} cy={y + 12} r="4" fill={statusColor}>
              {status === "running" && (
                <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />
              )}
            </circle>
            {/* Label */}
            <text
              x={x + 12} y={y + 20}
              fill={status === "idle" ? "#94a3b8" : "white"}
              fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif"
            >
              {def.label}
            </text>
            {/* Status text */}
            <text
              x={x + 12} y={y + 36}
              fill={statusColor} fontSize="10"
              fontFamily="system-ui, sans-serif"
              opacity="0.85"
            >
              {status.replace("_", " ")}
              {nodeState?.retryCount ? ` (retry ${nodeState.retryCount})` : ""}
            </text>
            {/* Duration */}
            {nodeState?.startedAt && (
              <text x={x + 12} y={y + 48} fill="#475569" fontSize="9" fontFamily="system-ui, sans-serif">
                {durationMs(nodeState.startedAt, nodeState.completedAt)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── New Workflow Modal ───────────────────────────────────────────────────────

function NewWorkflowModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (state: WorkflowState) => void;
}) {
  const [name, setName] = useState("Campaign Workflow " + new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }));
  const [vertical, setVertical] = useState("Medicare");
  const [channel, setChannel] = useState<string>("ad");
  const [objective, setObjective] = useState("Lead generation");
  const [audience, setAudience] = useState("Medicare-eligible adults 65+");
  const [keyMessages, setKeyMessages] = useState("Affordable coverage, Trusted plans");

  function handleCreate() {
    const state = createWorkflow(name, {
      brief: {
        vertical,
        channel,
        targetAudience: audience,
        campaign: name,
        objective,
        keyMessages: keyMessages.split(",").map(s => s.trim()).filter(Boolean),
      },
    });
    onCreate(state);
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-16 px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h2 className="text-white font-semibold">New Workflow Run</h2>
            <p className="text-slate-400 text-xs mt-0.5">Configure and trigger a 9-node campaign workflow</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Workflow Name</label>
            <input
              className="w-full bg-slate-800 border border-slate-600 rounded-xl text-white text-sm px-4 py-2.5 focus:outline-none focus:border-indigo-500"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Vertical</label>
              <select className="w-full bg-slate-800 border border-slate-600 rounded-xl text-white text-sm px-4 py-2.5 focus:outline-none focus:border-indigo-500"
                value={vertical} onChange={e => setVertical(e.target.value)}>
                {VERTICALS.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Channel</label>
              <select className="w-full bg-slate-800 border border-slate-600 rounded-xl text-white text-sm px-4 py-2.5 focus:outline-none focus:border-indigo-500"
                value={channel} onChange={e => setChannel(e.target.value)}>
                {CHANNELS.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Objective</label>
            <input
              className="w-full bg-slate-800 border border-slate-600 rounded-xl text-white text-sm px-4 py-2.5 focus:outline-none focus:border-indigo-500"
              value={objective}
              onChange={e => setObjective(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Target Audience</label>
            <input
              className="w-full bg-slate-800 border border-slate-600 rounded-xl text-white text-sm px-4 py-2.5 focus:outline-none focus:border-indigo-500"
              value={audience}
              onChange={e => setAudience(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Key Messages (comma-separated)</label>
            <input
              className="w-full bg-slate-800 border border-slate-600 rounded-xl text-white text-sm px-4 py-2.5 focus:outline-none focus:border-indigo-500"
              value={keyMessages}
              onChange={e => setKeyMessages(e.target.value)}
              placeholder="Affordable coverage, Trusted plans, Easy enrollment"
            />
          </div>
          <button
            onClick={handleCreate}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            Create & Run Workflow
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Approval Panel ───────────────────────────────────────────────────────────

function ApprovalPanel({
  workflow,
  onDecision,
}: {
  workflow: WorkflowState;
  onDecision: (decision: "approved" | "rejected" | "revision_requested", notes?: string) => void;
}) {
  const [notes, setNotes] = useState("");
  const copy = workflow.context.generatedCopy;
  const policy = workflow.context.policyEnforcement;

  return (
    <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-amber-400 text-lg">⚠</span>
        <div>
          <p className="text-amber-300 font-medium text-sm">Human Approval Required</p>
          <p className="text-amber-400/70 text-xs">Review the generated creative and compliance results before publishing.</p>
        </div>
      </div>

      {copy && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-2">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Generated Copy</p>
          <div className="space-y-1">
            <p className="text-white text-sm font-medium">{copy.headline}</p>
            <p className="text-slate-300 text-sm">{copy.body}</p>
            <p className="text-indigo-400 text-sm font-medium">{copy.cta}</p>
          </div>
        </div>
      )}

      {policy && (
        <div className="flex items-center gap-3">
          <div className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-semibold",
            policy.score >= 80 ? "bg-emerald-500/20 text-emerald-300" :
            policy.score >= 50 ? "bg-amber-500/20 text-amber-300" :
            "bg-red-500/20 text-red-300"
          )}>
            Score: {policy.score}/100
          </div>
          <div className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-semibold",
            policy.disposition === "approve" ? "bg-emerald-500/20 text-emerald-300" :
            policy.disposition === "escalate" ? "bg-amber-500/20 text-amber-300" :
            "bg-red-500/20 text-red-300"
          )}>
            {policy.disposition.charAt(0).toUpperCase() + policy.disposition.slice(1)}
          </div>
          {policy.requiredDisclaimers.length > 0 && (
            <span className="text-amber-400 text-xs">{policy.requiredDisclaimers.length} disclaimer(s) required</span>
          )}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Reviewer Notes (optional)</label>
        <textarea
          className="w-full bg-slate-800 border border-slate-600 rounded-xl text-white text-sm px-3 py-2 resize-none focus:outline-none focus:border-indigo-500"
          rows={2}
          placeholder="Add review notes…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onDecision("approved", notes)}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2 rounded-xl transition-colors"
        >
          ✓ Approve & Publish
        </button>
        <button
          onClick={() => onDecision("revision_requested", notes)}
          className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium py-2 rounded-xl transition-colors"
        >
          ↺ Request Revision
        </button>
        <button
          onClick={() => onDecision("rejected", notes)}
          className="flex-1 bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium py-2 rounded-xl transition-colors"
        >
          ✕ Reject
        </button>
      </div>
    </div>
  );
}

// ─── Execution Log ────────────────────────────────────────────────────────────

function ExecutionLog({ workflow }: { workflow: WorkflowState }) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [workflow.transitions.length]);

  const completedNodes = EXECUTION_ORDER.filter(
    id => workflow.nodes[id]?.status === "completed"
  );

  return (
    <div
      ref={logRef}
      className="bg-slate-950/80 border border-slate-700/50 rounded-xl p-4 max-h-64 overflow-y-auto font-mono text-xs space-y-1.5"
    >
      {completedNodes.length === 0 && workflow.status === "pending" && (
        <p className="text-slate-500">Workflow pending execution…</p>
      )}

      {EXECUTION_ORDER.map(nodeId => {
        const ns = workflow.nodes[nodeId];
        if (!ns || ns.status === "idle") return null;

        const def = WORKFLOW_NODES[nodeId];
        const color = STATUS_COLORS[ns.status];

        return (
          <div key={nodeId} className="flex items-start gap-2">
            <span style={{ color }} className="mt-0.5 flex-shrink-0">
              {ns.status === "completed" ? "✓" : ns.status === "error" ? "✕" : ns.status === "running" ? "▶" : ns.status === "waiting_approval" ? "⏸" : "·"}
            </span>
            <div>
              <span style={{ color }} className="font-medium">{def.label}</span>
              <span className="text-slate-500"> — {ns.status.replace("_", " ")}</span>
              {ns.startedAt && (
                <span className="text-slate-600">
                  {" "}({durationMs(ns.startedAt, ns.completedAt)})
                </span>
              )}
              {ns.errorMessage && (
                <div className="text-red-400 mt-0.5">{ns.errorMessage}</div>
              )}
            </div>
          </div>
        );
      })}

      {workflow.status === "completed" && (
        <div className="pt-1 border-t border-slate-800 text-emerald-400 font-medium">
          ✓ Workflow completed — {workflow.transitions.length} transitions, {durationMs(workflow.createdAt, workflow.updatedAt)}
        </div>
      )}
      {workflow.status === "failed" && (
        <div className="pt-1 border-t border-slate-800 text-red-400 font-medium">
          ✕ Workflow failed
        </div>
      )}
    </div>
  );
}

// ─── Agent Config Panel ───────────────────────────────────────────────────────

function AgentConfigPanel() {
  const configs = EXECUTION_ORDER.map(id => ({
    id,
    def: WORKFLOW_NODES[id],
  }));

  return (
    <div className="space-y-2">
      {configs.map(({ id, def }) => (
        <div
          key={id}
          className="flex items-start gap-3 bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3"
        >
          <div
            className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
            style={{ background: NODE_COLORS[id] ?? "#475569" }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white text-sm font-medium">{def.label}</p>
              {def.requiresHuman && (
                <span className="text-xs bg-amber-500/15 text-amber-300 border border-amber-500/25 px-1.5 py-0.5 rounded-full">
                  Human-in-loop
                </span>
              )}
              {def.maxRetries > 0 && (
                <span className="text-xs bg-slate-700/50 text-slate-400 border border-slate-600 px-1.5 py-0.5 rounded-full">
                  {def.maxRetries} retries
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs mt-0.5">{def.description}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-slate-600 text-xs">
                Timeout: {def.timeoutMs >= 60_000 ? `${def.timeoutMs / 60_000}m` : `${def.timeoutMs / 1000}s`}
              </span>
              {def.edges.length > 0 && (
                <span className="text-slate-600 text-xs">
                  → {def.edges.map(e => WORKFLOW_NODES[e]?.label).join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const [workflows, setWorkflows] = useState<WorkflowState[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowState | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"graph" | "log" | "config">("graph");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const refreshWorkflows = useCallback(() => {
    const wfs = listWorkflows();
    setWorkflows(wfs);
    if (activeWorkflow) {
      const updated = wfs.find(w => w.workflowId === activeWorkflow.workflowId);
      if (updated) setActiveWorkflow(updated);
    }
  }, [activeWorkflow?.workflowId]);

  useEffect(() => { refreshWorkflows(); }, []);

  function handleCreate(state: WorkflowState) {
    setShowNewModal(false);
    setActiveWorkflow(state);
    refreshWorkflows();
    runWorkflow(state);
  }

  function handleStateChange(state: WorkflowState) {
    setActiveWorkflow({ ...state });
    setWorkflows(prev => {
      const idx = prev.findIndex(w => w.workflowId === state.workflowId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = state;
        return next;
      }
      return [state, ...prev];
    });
  }

  async function runWorkflow(state: WorkflowState) {
    setIsRunning(true);
    try {
      await executeWorkflow(state.workflowId, handleStateChange);
    } finally {
      setIsRunning(false);
      refreshWorkflows();
    }
  }

  async function handleApproval(decision: "approved" | "rejected" | "revision_requested", notes?: string) {
    if (!activeWorkflow) return;
    setIsRunning(true);
    try {
      await submitHumanApproval(
        activeWorkflow.workflowId,
        decision,
        "current_user",
        notes,
        handleStateChange
      );
    } finally {
      setIsRunning(false);
      refreshWorkflows();
    }
  }

  function handleDelete(workflowId: string) {
    deleteWorkflow(workflowId);
    if (activeWorkflow?.workflowId === workflowId) setActiveWorkflow(null);
    setDeleteConfirm(null);
    refreshWorkflows();
  }

  // Stats
  const completedCount = workflows.filter(w => w.status === "completed").length;
  const runningCount = workflows.filter(w => w.status === "running").length;
  const pausedCount = workflows.filter(w => w.status === "paused").length;
  const failedCount = workflows.filter(w => w.status === "failed").length;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Agents</h1>
          <p className="text-slate-400 text-sm mt-0.5">9-node LangGraph-style campaign workflow engine</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <span className="text-lg leading-none">▶</span>
          New Workflow Run
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Runs", value: workflows.length.toString(), color: "text-white" },
          { label: "Completed", value: completedCount.toString(), color: "text-emerald-400" },
          { label: "Running / Paused", value: `${runningCount + pausedCount}`, color: runningCount > 0 ? "text-blue-400" : "text-amber-400" },
          { label: "Failed", value: failedCount.toString(), color: failedCount > 0 ? "text-red-400" : "text-slate-500" },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1.5">{s.label}</p>
            <p className={cn("text-3xl font-semibold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Workflow List */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl flex flex-col">
          <div className="px-5 py-4 border-b border-slate-700/50">
            <h3 className="text-white font-medium text-sm">Workflow Runs</h3>
            <p className="text-slate-500 text-xs mt-0.5">{workflows.length} total</p>
          </div>

          {workflows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center mb-3 text-xl">⚙️</div>
              <p className="text-slate-400 text-sm font-medium">No workflows yet</p>
              <p className="text-slate-600 text-xs mt-1">Click "New Workflow Run" to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/40 flex-1 overflow-y-auto max-h-[520px]">
              {workflows.map(wf => (
                <div
                  key={wf.workflowId}
                  onClick={() => setActiveWorkflow(wf)}
                  className={cn(
                    "flex items-start gap-3 px-5 py-3.5 hover:bg-slate-700/30 cursor-pointer transition-colors",
                    activeWorkflow?.workflowId === wf.workflowId && "bg-slate-700/40 border-l-2 border-indigo-500"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{wf.workflowName}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <WfStatusBadge status={wf.status} />
                      <span className="text-slate-600 text-xs">{relativeTime(wf.updatedAt)}</span>
                    </div>
                    {wf.currentNodeId && (
                      <p className="text-slate-500 text-xs mt-1 truncate">
                        Current: {WORKFLOW_NODES[wf.currentNodeId]?.label ?? wf.currentNodeId}
                      </p>
                    )}
                  </div>
                  {deleteConfirm === wf.workflowId ? (
                    <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleDelete(wf.workflowId)} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 bg-red-500/10 rounded-lg">Delete</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1">Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); setDeleteConfirm(wf.workflowId); }}
                      className="text-slate-600 hover:text-red-400 text-sm flex-shrink-0 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Detail Panel */}
        <div className="lg:col-span-2 space-y-4">
          {activeWorkflow ? (
            <>
              {/* Workflow Header */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-white font-semibold">{activeWorkflow.workflowName}</h2>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <WfStatusBadge status={activeWorkflow.status} />
                      <span className="text-slate-500 text-xs">
                        Created {relativeTime(activeWorkflow.createdAt)}
                      </span>
                      <span className="text-slate-500 text-xs">
                        Updated {relativeTime(activeWorkflow.updatedAt)}
                      </span>
                      {activeWorkflow.context.brief && (
                        <span className="text-slate-400 text-xs">
                          {activeWorkflow.context.brief.vertical} · {activeWorkflow.context.brief.channel}
                        </span>
                      )}
                    </div>
                  </div>
                  {(activeWorkflow.status === "failed" || activeWorkflow.status === "completed") && (
                    <button
                      onClick={() => {
                        const newState = createWorkflow(activeWorkflow.workflowName + " (Retry)", activeWorkflow.context);
                        setActiveWorkflow(newState);
                        refreshWorkflows();
                        runWorkflow(newState);
                      }}
                      className="flex-shrink-0 text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      ↺ Re-run
                    </button>
                  )}
                </div>
              </div>

              {/* Approval Panel */}
              {activeWorkflow.status === "paused" &&
               activeWorkflow.currentNodeId === "human_approval" && (
                <ApprovalPanel workflow={activeWorkflow} onDecision={handleApproval} />
              )}

              {/* Tabs */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="flex border-b border-slate-700/50">
                  {(["graph", "log", "config"] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "flex-1 px-4 py-3 text-sm font-medium transition-colors capitalize",
                        activeTab === tab
                          ? "text-white border-b-2 border-indigo-500 bg-slate-700/30"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      {tab === "graph" ? "Visual Graph" : tab === "log" ? "Execution Log" : "Agent Config"}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {activeTab === "graph" && (
                    <div>
                      <WorkflowGraph workflow={activeWorkflow} />
                      <div className="flex items-center gap-4 mt-4 flex-wrap">
                        {(["idle", "running", "completed", "waiting_approval", "error"] as NodeStatus[]).map(s => (
                          <div key={s} className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s] }} />
                            <span className="text-xs text-slate-400 capitalize">{s.replace("_", " ")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeTab === "log" && <ExecutionLog workflow={activeWorkflow} />}
                  {activeTab === "config" && <AgentConfigPanel />}
                </div>
              </div>

              {/* Context Output */}
              {activeWorkflow.context.generatedCopy && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
                  <h3 className="text-white font-medium text-sm mb-3">Generated Output</h3>
                  <div className="space-y-2">
                    <div className="bg-slate-900/60 rounded-xl px-4 py-3">
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Headline</p>
                      <p className="text-white text-sm font-medium">{activeWorkflow.context.generatedCopy.headline}</p>
                    </div>
                    <div className="bg-slate-900/60 rounded-xl px-4 py-3">
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Body</p>
                      <p className="text-slate-300 text-sm">{activeWorkflow.context.generatedCopy.body}</p>
                    </div>
                    <div className="bg-slate-900/60 rounded-xl px-4 py-3">
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">CTA</p>
                      <p className="text-indigo-400 text-sm font-medium">{activeWorkflow.context.generatedCopy.cta}</p>
                    </div>
                    {activeWorkflow.context.policyEnforcement && (
                      <div className="bg-slate-900/60 rounded-xl px-4 py-3">
                        <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Compliance</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={cn(
                            "text-sm font-semibold px-2.5 py-0.5 rounded-lg",
                            activeWorkflow.context.policyEnforcement.score >= 80 ? "bg-emerald-500/20 text-emerald-300" :
                            activeWorkflow.context.policyEnforcement.score >= 50 ? "bg-amber-500/20 text-amber-300" :
                            "bg-red-500/20 text-red-300"
                          )}>
                            {activeWorkflow.context.policyEnforcement.score}/100
                          </span>
                          <span className={cn(
                            "text-sm font-medium px-2.5 py-0.5 rounded-lg",
                            activeWorkflow.context.policyEnforcement.disposition === "approve" ? "bg-emerald-500/20 text-emerald-300" :
                            activeWorkflow.context.policyEnforcement.disposition === "escalate" ? "bg-amber-500/20 text-amber-300" :
                            "bg-red-500/20 text-red-300"
                          )}>
                            {activeWorkflow.context.policyEnforcement.disposition}
                          </span>
                        </div>
                        {activeWorkflow.context.policyEnforcement.requiredDisclaimers.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {activeWorkflow.context.policyEnforcement.requiredDisclaimers.slice(0, 2).map((d, i) => (
                              <p key={i} className="text-slate-500 text-xs">• {d}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center mb-4 text-3xl">⚙️</div>
              <h3 className="text-white font-semibold text-lg">No workflow selected</h3>
              <p className="text-slate-500 text-sm mt-1.5 max-w-xs">
                Select a workflow from the list or create a new run to see the visual graph and execution log.
              </p>
              <button
                onClick={() => setShowNewModal(true)}
                className="mt-5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                New Workflow Run
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showNewModal && (
        <NewWorkflowModal onClose={() => setShowNewModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
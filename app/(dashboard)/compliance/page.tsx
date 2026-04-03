"use client";
import { useState } from "react";
import {
  Shield, Plus, ChevronDown, ChevronRight, CheckCircle,
  XCircle, AlertTriangle, Clock, FileText, Lock, Zap
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Toast, useToast } from "@/components/ui/Toast";

// ── Types ──────────────────────────────────────────────────────────────────────
interface ApprovalItem {
  id: string;
  title: string;
  type: "ad" | "email" | "sms" | "script" | "landing_page";
  submittedBy: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  content: string;
  rejectionReason?: string;
}

interface ComplianceRule {
  id: string;
  name: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  active: boolean;
  description: string;
  details: string;
  lastTriggered?: string;
  triggerCount: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const INITIAL_APPROVALS: ApprovalItem[] = [
  { id: "ap1", title: "Medicare Advantage Q3 Facebook Ad", type: "ad", submittedBy: "CampaignOptimizer", submittedAt: "2025-07-14 09:12", status: "pending", content: "Get the Medicare Advantage plan that's right for you. Compare plans in your area today. Benefits may vary by location. Not all plans available in all areas." },
  { id: "ap2", title: "Final Expense Email — Sequence 3", type: "email", submittedBy: "ContentCreator", submittedAt: "2025-07-14 08:45", status: "pending", content: "Subject: Your family deserves peace of mind\n\nDear [First Name], protecting your loved ones doesn't have to be expensive. Our final expense plans start at just $X/month..." },
  { id: "ap3", title: "ACA Landing Page — Hero Copy", type: "landing_page", submittedBy: "ContentCreator", submittedAt: "2025-07-13 16:30", status: "pending", content: "Find affordable health insurance coverage for 2025. Get a free quote in minutes. No commitment required." },
  { id: "ap4", title: "Medicare SMS Campaign", type: "sms", submittedBy: "CampaignOptimizer", submittedAt: "2025-07-13 14:00", status: "approved", content: "Hi [Name], your Medicare options for 2025 are waiting. Reply STOP to opt out." },
  { id: "ap5", title: "Agent Script — Medicare Advantage Intro", type: "script", submittedBy: "ContentCreator", submittedAt: "2025-07-12 11:20", status: "rejected", content: "Hi, I'm calling about guaranteed Medicare Advantage coverage available in your area...", rejectionReason: "Contains prohibited 'guaranteed' language per CMS guidelines §40.3" },
];

const INITIAL_RULES: ComplianceRule[] = [
  { id: "r1", name: "CMS Prohibited Language Filter", category: "Medicare", severity: "critical", active: true, description: "Blocks ads and scripts containing CMS-prohibited terms", details: "Scans all outbound content for terms prohibited by CMS, including 'guaranteed', 'best', 'unlimited benefits', and other superlatives. Applies to Medicare Advantage and Part D communications.", lastTriggered: "2025-07-14", triggerCount: 147 },
  { id: "r2", name: "TCPA Consent Verification", category: "Contact", severity: "critical", active: true, description: "Validates opt-in consent before allowing SMS/call campaigns", details: "Cross-references all phone contacts against consent database. Blocks outreach to numbers without valid TCPA written consent. Auto-removes numbers after consent expiry (18 months).", lastTriggered: "2025-07-14", triggerCount: 892 },
  { id: "r3", name: "DNC Registry Scrub", category: "Contact", severity: "high", active: true, description: "Scrubs lists against Federal and State DNC registries", details: "Daily automated scrub against the National Do Not Call Registry and 13 state-specific DNC lists. Lists are re-scrubbed every 31 days per FTC requirements.", lastTriggered: "2025-07-14", triggerCount: 3401 },
  { id: "r4", name: "Disclaimer Presence Check", category: "Advertising", severity: "high", active: true, description: "Ensures all ads include required legal disclaimers", details: "Verifies presence of required disclosures: plan availability notice, licensed agent disclosure, CMS required language for Medicare. Blocks publication if any disclaimer is missing.", lastTriggered: "2025-07-13", triggerCount: 24 },
  { id: "r5", name: "State Licensing Verification", category: "Operations", severity: "medium", active: true, description: "Validates agent licensing before lead assignment", details: "Checks agent license status in target state before routing leads. Integrates with NIPR database for real-time verification. Alerts compliance team if license is expired or pending.", lastTriggered: "2025-07-12", triggerCount: 8 },
  { id: "r6", name: "SOC 2 Data Handling", category: "Privacy", severity: "medium", active: false, description: "Enforces data retention and access control policies", details: "Monitors PII access patterns, enforces data retention schedules (7 years for insurance records), and alerts on anomalous access. Paused for infrastructure migration.", triggerCount: 0 },
];

const severityConfig = {
  critical: { color: "red", label: "Critical" },
  high: { color: "amber", label: "High" },
  medium: { color: "blue", label: "Medium" },
  low: { color: "slate", label: "Low" },
};

const typeIcon = (type: ApprovalItem["type"]) => {
  if (type === "ad") return <Zap size={14} />;
  if (type === "email" || type === "sms") return <FileText size={14} />;
  if (type === "script") return <Lock size={14} />;
  return <FileText size={14} />;
};

// ── Page ───────────────────────────────────────────────────────────────────────
export default function CompliancePage() {
  const { toasts, addToast, removeToast } = useToast();
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [rules, setRules] = useState<ComplianceRule[]>(INITIAL_RULES);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  // Modals
  const [addRuleOpen, setAddRuleOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<ApprovalItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Add Rule form
  const emptyRule = { name: "", category: "Medicare", severity: "high", description: "", details: "" };
  const [ruleForm, setRuleForm] = useState(emptyRule);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleApprove = (id: string) => {
    setApprovals((prev) => prev.map((a) => a.id === id ? { ...a, status: "approved" } : a));
    const item = approvals.find((a) => a.id === id);
    addToast(`"${item?.title}" approved`, "success");
  };

  const openReject = (item: ApprovalItem) => {
    setRejectTarget(item);
    setRejectReason("");
    setRejectOpen(true);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) { addToast("Rejection reason is required", "error"); return; }
    if (!rejectTarget) return;
    setApprovals((prev) =>
      prev.map((a) => a.id === rejectTarget.id ? { ...a, status: "rejected", rejectionReason: rejectReason } : a)
    );
    setRejectOpen(false);
    setRejectReason("");
    addToast(`"${rejectTarget.title}" rejected`, "info");
  };

  const handleAddRule = () => {
    if (!ruleForm.name.trim()) { addToast("Rule name is required", "error"); return; }
    if (!ruleForm.description.trim()) { addToast("Description is required", "error"); return; }
    const nr: ComplianceRule = {
      id: `r${Date.now()}`,
      name: ruleForm.name,
      category: ruleForm.category,
      severity: ruleForm.severity as ComplianceRule["severity"],
      active: true,
      description: ruleForm.description,
      details: ruleForm.details,
      triggerCount: 0,
    };
    setRules((prev) => [nr, ...prev]);
    setAddRuleOpen(false);
    setRuleForm(emptyRule);
    addToast(`Rule "${nr.name}" added`, "success");
  };

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const next = !r.active;
      addToast(`Rule "${r.name}" ${next ? "enabled" : "disabled"}`, next ? "success" : "info");
      return { ...r, active: next };
    }));
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const pending = approvals.filter((a) => a.status === "pending");
  const approved = approvals.filter((a) => a.status === "approved").length;
  const rejected = approvals.filter((a) => a.status === "rejected").length;
  const activeRules = rules.filter((r) => r.active).length;

  return (
    <div className="p-6 space-y-6">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Compliance Center</h1>
          <p className="text-slate-400 text-sm mt-1">Review queue, rule management, and audit trail</p>
        </div>
        <button
          onClick={() => setAddRuleOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-all text-sm font-medium"
        >
          <Plus size={16} /> Add Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Pending Review", value: pending.length, color: "amber", icon: <Clock size={18} /> },
          { label: "Approved", value: approved, color: "emerald", icon: <CheckCircle size={18} /> },
          { label: "Rejected", value: rejected, color: "red", icon: <XCircle size={18} /> },
          { label: "Active Rules", value: activeRules, color: "violet", icon: <Shield size={18} /> },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg bg-${s.color}-500/10 flex items-center justify-center text-${s.color}-400 mb-3`}>
              {s.icon}
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Approval Queue */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-sm font-semibold text-white">Approval Queue</h2>
        </div>
        <div className="divide-y divide-slate-700/30">
          {approvals.map((item) => (
            <div key={item.id} className="px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    item.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                    item.status === "rejected" ? "bg-red-500/10 text-red-400" :
                    "bg-amber-500/10 text-amber-400"
                  }`}>
                    {typeIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white">{item.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Submitted by {item.submittedBy} · {item.submittedAt}
                    </div>
                    <div className="mt-2 p-2.5 rounded-lg bg-slate-900/50 border border-slate-700/30">
                      <p className="text-xs text-slate-400 font-mono leading-relaxed line-clamp-2">{item.content}</p>
                    </div>
                    {item.status === "rejected" && item.rejectionReason && (
                      <div className="mt-2 flex items-start gap-1.5">
                        <AlertTriangle size={12} className="text-red-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-400">{item.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status === "pending" ? (
                    <>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/30 text-xs transition-all"
                      >
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button
                        onClick={() => openReject(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/20 hover:bg-red-600/30 text-xs transition-all"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      item.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    } capitalize`}>
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Rules */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Compliance Rules</h2>
          <span className="text-xs text-slate-500">{rules.length} rules · {activeRules} active</span>
        </div>
        <div className="divide-y divide-slate-700/30">
          {rules.map((rule) => {
            const sc = severityConfig[rule.severity];
            const isExpanded = expandedRule === rule.id;
            return (
              <div key={rule.id}>
                <div
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-700/20 cursor-pointer transition-colors"
                  onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
                >
                  <div className="text-slate-500">
                    {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{rule.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{rule.category} · {rule.description}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs border bg-${sc.color}-500/10 text-${sc.color}-400 border-${sc.color}-500/20`}>
                    {sc.label}
                  </span>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">{rule.triggerCount.toLocaleString()} triggers</div>
                    {rule.lastTriggered && <div className="text-xs text-slate-600">{rule.lastTriggered}</div>}
                  </div>
                  {/* Toggle */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleRule(rule.id); }}
                    className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${rule.active ? "bg-violet-600" : "bg-slate-700"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${rule.active ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-4 bg-slate-900/30 border-t border-slate-700/30">
                    <div className="pt-4 space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Rule Details</div>
                        <p className="text-sm text-slate-300 leading-relaxed">{rule.details}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Category: <span className="text-slate-300">{rule.category}</span></span>
                        <span>Severity: <span className={`text-${sc.color}-400`}>{sc.label}</span></span>
                        <span>Status: <span className={rule.active ? "text-emerald-400" : "text-slate-400"}>{rule.active ? "Active" : "Disabled"}</span></span>
                        {rule.lastTriggered && <span>Last triggered: <span className="text-slate-300">{rule.lastTriggered}</span></span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Reject Modal ──────────────────────────────────────────────────────── */}
      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Submission">
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-slate-800 border border-slate-700/50">
            <div className="text-sm font-medium text-white">{rejectTarget?.title}</div>
            <div className="text-xs text-slate-500 mt-0.5">Submitted by {rejectTarget?.submittedBy}</div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Rejection Reason <span className="text-red-400">*</span></label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. Contains prohibited 'guaranteed' language per CMS guidelines §40.3"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setRejectOpen(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">Cancel</button>
            <button onClick={handleReject} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-all">
              <XCircle size={15} /> Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Add Rule Modal ─────────────────────────────────────────────────── */}
      <Modal open={addRuleOpen} onClose={() => setAddRuleOpen(false)} title="Add Compliance Rule" width="max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Rule Name <span className="text-red-400">*</span></label>
            <input
              value={ruleForm.name}
              onChange={(e) => setRuleForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. State-Specific Disclosure Check"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Category</label>
              <select
                value={ruleForm.category}
                onChange={(e) => setRuleForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
              >
                {["Medicare", "ACA", "Contact", "Advertising", "Privacy", "Operations", "Other"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Severity</label>
              <select
                value={ruleForm.severity}
                onChange={(e) => setRuleForm((p) => ({ ...p, severity: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
              >
                {["critical", "high", "medium", "low"].map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Short Description <span className="text-red-400">*</span></label>
            <input
              value={ruleForm.description}
              onChange={(e) => setRuleForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="One-line description of what this rule enforces"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Detailed Logic</label>
            <textarea
              value={ruleForm.details}
              onChange={(e) => setRuleForm((p) => ({ ...p, details: e.target.value }))}
              rows={3}
              placeholder="Describe the rule's logic, triggers, and enforcement actions…"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setAddRuleOpen(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">Cancel</button>
            <button onClick={handleAddRule} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all">
              <Plus size={15} /> Add Rule
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
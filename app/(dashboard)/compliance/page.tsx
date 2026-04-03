"use client";
import { useState } from "react";
import { Shield, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Card from "@/components/ui/Card";
import { ChartTooltip } from "@/components/ui/ChartTooltip";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

const SCORES = [
  { vertical: "Medicare", score: 94, rules: 48, violations: 2, color: "#10b981" },
  { vertical: "Auto", score: 98, rules: 32, violations: 0, color: "#8b5cf6" },
  { vertical: "Life", score: 91, rules: 41, violations: 3, color: "#f59e0b" },
  { vertical: "Home", score: 96, rules: 28, violations: 1, color: "#3b82f6" },
];

const donutData = [
  { name: "Medicare", value: 94, color: "#10b981" },
  { name: "Auto", value: 98, color: "#8b5cf6" },
  { name: "Life", value: 91, color: "#f59e0b" },
  { name: "Home", value: 96, color: "#3b82f6" },
];

const AUDIT_LOG = [
  { id: 1, item: "Medicare AEP Ad Copy — Claim softened: 'guaranteed' removed", vertical: "Medicare", severity: "medium", status: "pending", agent: "CREATOR", time: "14:18" },
  { id: 2, item: "Life Insurance Email — Disclosure statement added", vertical: "Life", severity: "high", status: "pending", agent: "CREATOR", time: "13:55" },
  { id: 3, item: "Auto Ad — CTA compliant with state regs (TX, CA, NY)", vertical: "Auto", severity: "low", status: "approved", agent: "REACH", time: "12:40" },
  { id: 4, item: "Home Bundle Landing Page — Privacy notice updated", vertical: "Home", severity: "medium", status: "approved", agent: "ARCHITECT", time: "11:22" },
  { id: 5, item: "Medicare Email — HIPAA safe harbor language verified", vertical: "Medicare", severity: "high", status: "approved", agent: "ORACLE", time: "10:14" },
  { id: 6, item: "Life Ad — 'Best rate' claim flagged for substantiation", vertical: "Life", severity: "high", status: "pending", agent: "CREATOR", time: "09:33" },
];

const RULES = [
  { id: 1, rule: "No guaranteed outcome claims in Medicare ads", vertical: "Medicare", severity: "critical", active: true },
  { id: 2, rule: "All insurance ads must include state licensing number", vertical: "All", severity: "high", active: true },
  { id: 3, rule: "HIPAA safe harbor language required in all health comms", vertical: "Medicare", severity: "critical", active: true },
  { id: 4, rule: "Substantiate all comparative price claims", vertical: "All", severity: "high", active: true },
  { id: 5, rule: "Life insurance illustrations must meet NAIC standards", vertical: "Life", severity: "high", active: true },
  { id: 6, rule: "Include privacy policy link in all email campaigns", vertical: "All", severity: "medium", active: true },
  { id: 7, rule: "Auto ads: list all applicable fees", vertical: "Auto", severity: "medium", active: false },
];

const severityColors: Record<string, string> = {
  critical: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  high: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  low: "bg-slate-700 text-slate-400 border-slate-600",
};

export default function CompliancePage() {
  const [auditLog, setAuditLog] = useState(AUDIT_LOG);
  const [rules, setRules] = useState(RULES);

  const handleApprove = (id: number) => {
    setAuditLog(log => log.map(l => l.id === id ? { ...l, status: "approved" } : l));
    toast.success("Item approved");
  };

  const handleReject = (id: number) => {
    setAuditLog(log => log.map(l => l.id === id ? { ...l, status: "rejected" } : l));
    toast.error("Item rejected — flagged for revision");
  };

  const toggleRule = (id: number) => {
    setRules(r => r.map(rule => rule.id === id ? { ...rule, active: !rule.active } : rule));
    const rule = rules.find(r => r.id === id);
    toast(rule?.active ? "Rule disabled" : "Rule enabled", rule?.active ? "warning" : "success");
  };

  const avgScore = Math.round(SCORES.reduce((s, a) => s + a.score, 0) / SCORES.length);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Compliance</h1>
        <p className="text-slate-400 text-sm mt-0.5">AI-enforced compliance across all verticals</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Compliance Score by Vertical</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 text-center">
            <p className="text-3xl font-bold text-emerald-400">{avgScore}%</p>
            <p className="text-xs text-slate-500">Overall Compliance Score</p>
          </div>
        </Card>

        <Card className="xl:col-span-2 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Vertical Breakdown</h3>
          <div className="space-y-4">
            {SCORES.map(s => (
              <div key={s.vertical}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white font-medium">{s.vertical}</span>
                  <div className="flex items-center gap-3">
                    {s.violations > 0 ? (
                      <span className="text-xs text-amber-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{s.violations} violation{s.violations > 1 ? "s" : ""}</span>
                    ) : (
                      <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Clean</span>
                    )}
                    <span className="text-sm font-bold" style={{ color: s.color }}>{s.score}%</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.score}%`, backgroundColor: s.color }} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{s.rules} rules monitored</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-white">Recent Audit Log</h3>
          </div>
          <div className="space-y-3">
            {auditLog.map(item => (
              <div key={item.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-xs text-slate-300 flex-1">{item.item}</p>
                  <span className="text-xs text-slate-500 flex-shrink-0">{item.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs px-1.5 py-0.5 rounded border font-medium capitalize", severityColors[item.severity])}>{item.severity}</span>
                    <span className="text-xs text-slate-500">{item.vertical} · {item.agent}</span>
                  </div>
                  {item.status === "pending" ? (
                    <div className="flex gap-1.5">
                      <button onClick={() => handleApprove(item.id)} className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                      <button onClick={() => handleReject(item.id)} className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 transition-colors">
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  ) : (
                    <span className={cn("text-xs font-medium capitalize flex items-center gap-1", item.status === "approved" ? "text-emerald-400" : "text-rose-400")}>
                      {item.status === "approved" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-white">Compliance Rules</h3>
          </div>
          <div className="space-y-2">
            {rules.map(rule => (
              <div key={rule.id} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <button onClick={() => toggleRule(rule.id)} className={cn("mt-0.5 w-9 h-5 rounded-full transition-colors flex-shrink-0 relative", rule.active ? "bg-emerald-500" : "bg-slate-600")}>
                  <span className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow", rule.active ? "left-4" : "left-0.5")} />
                </button>
                <div className="flex-1">
                  <p className="text-xs text-slate-300">{rule.rule}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-xs px-1.5 py-0.5 rounded border font-medium capitalize", severityColors[rule.severity])}>{rule.severity}</span>
                    <span className="text-xs text-slate-500">{rule.vertical}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
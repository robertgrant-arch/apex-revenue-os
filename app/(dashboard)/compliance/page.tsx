"use client";

import { useState, useEffect, useCallback } from "react";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import * as store from "@/lib/store";

interface ComplianceIssue { id: string; rule: string; severity: string; description: string; resolved: boolean; }
interface ComplianceCheck { id: string; targetType: string; targetName: string; status: string; issues: ComplianceIssue[]; runAt: string; resolvedCount: number; }

const KEY = "compliance_checks";
const SEVERITY_COLORS: Record<string, string> = { critical: "text-red-400", high: "text-orange-400", medium: "text-amber-400", low: "text-slate-400" };

const RULES = [
  { rule: "CMS Medicare Disclaimer", severity: "critical", description: "All Medicare ads must include CMS-required disclaimer text" },
  { rule: "Fair Lending Notice", severity: "high", description: "Insurance ads must not discriminate based on protected classes" },
  { rule: "Rate Accuracy", severity: "high", description: "Quoted rates must match current filed rates" },
  { rule: "Privacy Policy Link", severity: "medium", description: "Landing pages must include accessible privacy policy" },
  { rule: "Call Recording Disclosure", severity: "medium", description: "Outbound calls must disclose recording" },
  { rule: "TCPA Consent", severity: "critical", description: "Prior express written consent required for marketing calls" },
  { rule: "State License Display", severity: "low", description: "Agent license numbers should be visible on state-specific ads" },
];

export default function CompliancePage() {
  const [checks, setChecks] = useState<ComplianceCheck[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const load = useCallback(() => setChecks(store.getAll<ComplianceCheck>(KEY)), []);
  useEffect(() => { load(); }, [load]);

  function runCheck() {
    setRunning(true);
    setTimeout(() => {
      const creatives = store.getAll<{id: string; headline: string}>("creatives");
      const campaigns = store.getAll<{id: string; name: string}>("campaigns");
      const targets = [...creatives.map(c => ({ type: "creative", name: c.headline, id: c.id })), ...campaigns.map(c => ({ type: "campaign", name: c.name, id: c.id }))];
      if (targets.length === 0) { setRunning(false); return; }
      const target = targets[Math.floor(Math.random() * targets.length)];
      const numIssues = Math.floor(Math.random() * 4);
      const shuffled = [...RULES].sort(() => Math.random() - 0.5).slice(0, numIssues);
      const issues: ComplianceIssue[] = shuffled.map((r, i) => ({ id: `ci-${Date.now()}-${i}`, ...r, resolved: false }));
      const check: ComplianceCheck = { id: `cc-${Date.now()}`, targetType: target.type, targetName: target.name, status: numIssues === 0 ? "passed" : "failed", issues, runAt: new Date().toISOString(), resolvedCount: 0 };
      store.create(KEY, check);
      setRunning(false); load();
    }, 1500);
  }

  function resolveIssue(checkId: string, issueId: string) {
    const check = checks.find(c => c.id === checkId);
    if (!check) return;
    const updated = check.issues.map(i => i.id === issueId ? { ...i, resolved: true } : i);
    const resolvedCount = updated.filter(i => i.resolved).length;
    const status = resolvedCount === updated.length ? "passed" : "failed";
    store.update<ComplianceCheck>(KEY, checkId, { issues: updated, resolvedCount, status });
    load();
  }

  const totalChecks = checks.length;
  const passed = checks.filter(c => c.status === "passed").length;
  const failed = checks.filter(c => c.status === "failed").length;
  const openIssues = checks.reduce((s, c) => s + c.issues.filter(i => !i.resolved).length, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div><h1 className="text-2xl font-bold">Compliance</h1><p className="text-slate-400 text-sm mt-1">Insurance regulatory compliance scanning</p></div>
          <button onClick={runCheck} disabled={running} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold">{running ? "Scanning..." : "Run Compliance Check"}</button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[{ l: "Total Checks", v: totalChecks, c: "text-blue-400" }, { l: "Passed", v: passed, c: "text-emerald-400" }, { l: "Failed", v: failed, c: "text-red-400" }, { l: "Open Issues", v: openIssues, c: "text-amber-400" }].map(s => (
            <Card key={s.l} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <div className="text-xs text-slate-500 uppercase mb-2">{s.l}</div>
              <div className={cn("text-2xl font-bold", s.c)}>{s.v}</div>
            </Card>
          ))}
        </div>

        {checks.length === 0 ? (
          <div className="text-center py-16"><div className="text-4xl mb-4">&#x1f6e1;</div><h3 className="text-lg font-semibold text-white mb-2">No compliance checks yet</h3><p className="text-slate-400 text-sm max-w-sm mx-auto">Run your first compliance scan on your creatives and campaigns.</p></div>
        ) : (
          <div className="space-y-3">
            {checks.slice().reverse().map(check => {
              const open = check.issues.filter(i => !i.resolved).length;
              return (
                <Card key={check.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(expanded === check.id ? null : check.id)}>
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full", check.status === "passed" ? "bg-emerald-400" : "bg-red-400")} />
                      <div><p className="text-sm font-semibold text-white">{check.targetName}</p><p className="text-xs text-slate-500">{check.targetType} &middot; {new Date(check.runAt).toLocaleString()}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      {open > 0 && <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">{open} open</span>}
                      <span className="text-xs text-slate-500">{expanded === check.id ? "v" : ">"}</span>
                    </div>
                  </div>
                  {expanded === check.id && check.issues.length > 0 && (
                    <div className="mt-4 space-y-2 pt-3 border-t border-slate-700/50">
                      {check.issues.map(issue => (
                        <div key={issue.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className={cn("font-medium", SEVERITY_COLORS[issue.severity])}>[{issue.severity}]</span>
                            <span className={issue.resolved ? "text-slate-600 line-through" : "text-white"}>{issue.rule}</span>
                          </div>
                          {!issue.resolved && <button onClick={(e) => { e.stopPropagation(); resolveIssue(check.id, issue.id); }} className="text-emerald-400 hover:text-emerald-300">Resolve</button>}
                        </div>
                      ))}
                    </div>
                  )}
                  {expanded === check.id && check.issues.length === 0 && <p className="mt-3 text-xs text-emerald-400">All clear - no issues found.</p>}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
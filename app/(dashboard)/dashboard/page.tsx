"use client";

import { useState, useEffect, useCallback } from "react";
import MetricCard from "@/components/ui/MetricCard";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import * as store from "@/lib/store";
import { DollarSign, Users, TrendingUp, Zap, Target, Activity } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState({ leads: [] as any[], campaigns: [] as any[], creatives: [] as any[], logs: [] as any[], checks: [] as any[] });

  const load = useCallback(() => {
    setData({
      leads: store.getAll("leads"),
      campaigns: store.getAll("campaigns"),
      creatives: store.getAll("creatives"),
      logs: store.getAll("agent_logs"),
      checks: store.getAll("compliance_checks"),
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalLeads = data.leads.length;
  const totalCampaigns = data.campaigns.length;
  const totalCreatives = data.creatives.length;
  const pipelineValue = data.leads.reduce((s: number, l: any) => s + (l.value || 0), 0);
  const activeCampaigns = data.campaigns.filter((c: any) => c.status === "active").length;
  const convertedLeads = data.leads.filter((l: any) => l.status === "converted").length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0";
  const recentLogs = data.logs.slice(-10).reverse();
  const recentLeads = data.leads.slice(-6).reverse();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">APEX Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">AI Revenue Operating System &mdash; Live Data</p>
          </div>
          <button onClick={load} className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">Refresh</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard label="Total Leads" value={totalLeads.toString()} icon={<Users className="w-5 h-5" />} accent="emerald" />
          <MetricCard label="Pipeline Value" value={`$${pipelineValue.toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} accent="emerald" />
          <MetricCard label="Campaigns" value={totalCampaigns.toString()} icon={<Target className="w-5 h-5" />} accent="violet" />
          <MetricCard label="Active" value={activeCampaigns.toString()} icon={<Zap className="w-5 h-5" />} accent="amber" />
          <MetricCard label="Creatives" value={totalCreatives.toString()} icon={<Activity className="w-5 h-5" />} accent="blue" />
          <MetricCard label="Conv. Rate" value={`${conversionRate}%`} icon={<TrendingUp className="w-5 h-5" />} accent="rose" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Recent Leads</h3>
            {recentLeads.length === 0 ? <p className="text-xs text-slate-500">No leads yet. Go to Leads to add some.</p> : (
              <div className="space-y-2">
                {recentLeads.map((l: any) => (
                  <div key={l.id} className="flex items-center justify-between text-sm">
                    <div><span className="text-white font-medium">{l.name}</span><span className="text-slate-500 ml-2 text-xs">{l.vertical}</span></div>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-xs font-semibold", l.score >= 80 ? "text-emerald-400" : l.score >= 50 ? "text-amber-400" : "text-slate-400")}>{l.score}</span>
                      <span className="text-slate-400 text-xs">${l.value?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Agent Activity</h3>
            {recentLogs.length === 0 ? <p className="text-xs text-slate-500">No agent activity yet. Start agents on the Agents page.</p> : (
              <div className="space-y-2">
                {recentLogs.map((l: any) => (
                  <div key={l.id} className="flex items-center justify-between text-xs">
                    <div><span className="text-emerald-400 font-bold mr-2">{l.agent}</span><span className="text-slate-400">{l.action}</span></div>
                    <span className="text-slate-600">{new Date(l.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Campaigns</h3>
            {data.campaigns.length === 0 ? <p className="text-xs text-slate-500">No campaigns yet.</p> : (
              <div className="space-y-3">
                {data.campaigns.slice(-4).reverse().map((c: any) => {
                  const pct = c.budget > 0 ? Math.min((c.spent / c.budget) * 100, 100) : 0;
                  return (
                    <div key={c.id}>
                      <div className="flex justify-between text-xs mb-1"><span className="text-white font-medium">{c.name}</span><span className="text-slate-400">{pct.toFixed(0)}%</span></div>
                      <div className="h-1.5 bg-slate-700 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{width: `${pct}%`}} /></div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Compliance</h3>
            {data.checks.length === 0 ? <p className="text-xs text-slate-500">No compliance checks yet.</p> : (
              <div className="space-y-2">
                {data.checks.slice(-5).reverse().map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", c.status === "passed" ? "bg-emerald-400" : "bg-red-400")} />
                      <span className="text-white">{c.targetName}</span>
                    </div>
                    <span className="text-slate-500">{new Date(c.runAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
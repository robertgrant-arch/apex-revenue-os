"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import * as store from "@/lib/store";

interface AppSettings {
  companyName: string; timezone: string; leadScoreThreshold: number;
  notifications: { email: boolean; slack: boolean; inApp: boolean };
}

const DEFAULTS: AppSettings = {
  companyName: "", timezone: "America/Chicago", leadScoreThreshold: 70,
  notifications: { email: true, slack: false, inApp: true },
};

const TIMEZONES = ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Phoenix", "UTC"];

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = store.getOne<AppSettings>("settings");
    if (s) setSettings(s);
  }, []);

  function handleSave() {
    store.setOne("settings", settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleClearAll() {
    if (!confirm("This will delete ALL data (leads, campaigns, creatives, logs, compliance checks). Are you sure?")) return;
    ["leads", "campaigns", "creatives", "agent_logs", "agent_statuses", "compliance_checks", "settings"].forEach(k => localStorage.removeItem(k));
    setSettings(DEFAULTS);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-slate-400 text-sm mt-1">Configure your APEX Revenue OS</p></div>

        <Card className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">General</h2>
          <div><label className="block text-xs text-slate-400 mb-1">Company Name</label>
            <input value={settings.companyName} onChange={e => setSettings({...settings, companyName: e.target.value})} placeholder="Your company name" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm" />
          </div>
          <div><label className="block text-xs text-slate-400 mb-1">Timezone</label>
            <select value={settings.timezone} onChange={e => setSettings({...settings, timezone: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm">
              {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="block text-xs text-slate-400 mb-1">Lead Score Threshold: {settings.leadScoreThreshold}</label>
            <input type="range" min={0} max={100} value={settings.leadScoreThreshold} onChange={e => setSettings({...settings, leadScoreThreshold: Number(e.target.value)})} className="w-full" />
          </div>
        </Card>

        <Card className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Notifications</h2>
          {(["email", "slack", "inApp"] as const).map(key => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-slate-300 capitalize">{key === "inApp" ? "In-App" : key}</span>
              <button onClick={() => setSettings({...settings, notifications: {...settings.notifications, [key]: !settings.notifications[key]}})} className={cn("w-10 h-5 rounded-full relative transition-colors", settings.notifications[key] ? "bg-emerald-600" : "bg-slate-700")}>
                <div className={cn("w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform", settings.notifications[key] ? "translate-x-5" : "translate-x-0.5")} />
              </button>
            </div>
          ))}
        </Card>

        <Card className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Data & Storage</h2>
          <div className="space-y-2">
            {["leads", "campaigns", "creatives", "agent_logs", "compliance_checks"].map(key => (
              <div key={key} className="flex items-center justify-between py-1.5 border-b border-slate-700/50 text-xs">
                <span className="text-slate-400">{key}</span>
                <span className="text-white font-semibold">{store.getAll(key).length} records</span>
              </div>
            ))}
          </div>
          <button onClick={handleClearAll} className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-3 py-1.5">Clear All Data</button>
        </Card>

        <button onClick={handleSave} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold">
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
"use client";
import { useState } from "react";
import { Plug, Globe, User, Users, Bell, Check, X, Plus } from "lucide-react";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

const TABS = [
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "verticals", label: "Verticals", icon: Globe },
  { id: "account", label: "Account", icon: User },
  { id: "team", label: "Team", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const INTEGRATIONS = [
  { id: "salesforce", name: "Salesforce CRM", description: "Sync leads and pipeline data", category: "CRM", connected: true, logo: "SF" },
  { id: "hubspot", name: "HubSpot", description: "Contact and deal management", category: "CRM", connected: false, logo: "HS" },
  { id: "facebook", name: "Meta Ads", description: "Facebook and Instagram ad campaigns", category: "Advertising", connected: true, logo: "FB" },
  { id: "google", name: "Google Ads", description: "Search and display advertising", category: "Advertising", connected: true, logo: "GA" },
  { id: "klaviyo", name: "Klaviyo", description: "Email marketing automation", category: "Email", connected: false, logo: "KL" },
  { id: "twilio", name: "Twilio", description: "SMS and voice communications", category: "Comms", connected: true, logo: "TW" },
  { id: "slack", name: "Slack", description: "Team alerts and notifications", category: "Comms", connected: true, logo: "SL" },
  { id: "segment", name: "Segment", description: "Customer data platform", category: "Data", connected: false, logo: "SG" },
];

const VERTICALS = [
  { id: "medicare", name: "Medicare", active: true, leads: 2840, ruleCount: 48 },
  { id: "auto", name: "Auto Insurance", active: true, leads: 1240, ruleCount: 32 },
  { id: "life", name: "Life Insurance", active: true, leads: 680, ruleCount: 41 },
  { id: "home", name: "Home Insurance", active: false, leads: 320, ruleCount: 28 },
];

const TEAM = [
  { id: 1, name: "Alex Rivera", email: "alex@company.com", role: "Admin", status: "active", avatar: "AR" },
  { id: 2, name: "Jordan Park", email: "jordan@company.com", role: "Manager", status: "active", avatar: "JP" },
  { id: 3, name: "Casey Morgan", email: "casey@company.com", role: "Analyst", status: "active", avatar: "CM" },
  { id: 4, name: "Taylor Kim", email: "taylor@company.com", role: "Analyst", status: "invited", avatar: "TK" },
];

const NOTIFICATIONS = [
  { id: "lead_hot", label: "Hot lead scored (90+)", description: "Instant alert when ORACLE scores a lead 90+", enabled: true },
  { id: "campaign_budget", label: "Campaign budget threshold", description: "Alert at 80% budget spend", enabled: true },
  { id: "compliance_flag", label: "Compliance violation flagged", description: "Immediate alert on compliance issue", enabled: true },
  { id: "agent_error", label: "Agent error or timeout", description: "Alert when any agent fails or times out", enabled: true },
  { id: "daily_report", label: "Daily performance report", description: "Morning summary of previous day's metrics", enabled: false },
  { id: "weekly_summary", label: "Weekly revenue summary", description: "Monday morning pipeline and attribution report", enabled: true },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("integrations");
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [verticals, setVerticals] = useState(VERTICALS);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [account, setAccount] = useState({ name: "Bob Grant", email: "robert.grant@selectquote.com", company: "SelectQuote", timezone: "America/Chicago" });

  const toggleIntegration = (id: string) => {
    const integ = integrations.find(i => i.id === id);
    setIntegrations(ints => ints.map(i => i.id === id ? { ...i, connected: !i.connected } : i));
    toast(integ?.connected ? `${integ.name} disconnected` : `${integ?.name} connected`, integ?.connected ? "info" : "success");
  };

  const toggleVertical = (id: string) => {
    const v = verticals.find(v => v.id === id);
    setVerticals(vs => vs.map(v => v.id === id ? { ...v, active: !v.active } : v));
    toast(`${v?.name} ${v?.active ? "disabled" : "enabled"}`, v?.active ? "warning" : "success");
  };

  const toggleNotification = (id: string) => {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n));
  };

  const handleSaveAccount = () => toast.success("Account settings saved");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Configure your APEX AI Revenue OS</p>
      </div>

      <div className="flex gap-1 border-b border-slate-700/50">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px", activeTab === tab.id ? "text-emerald-400 border-emerald-400" : "text-slate-400 border-transparent hover:text-white")}>
              <Icon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "integrations" && (
        <div className="space-y-4">
          {["CRM", "Advertising", "Email", "Comms", "Data"].map(cat => {
            const catIntegrations = integrations.filter(i => i.category === cat);
            return (
              <div key={cat}>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{cat}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catIntegrations.map(integ => (
                    <Card key={integ.id} className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{integ.logo}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{integ.name}</p>
                        <p className="text-xs text-slate-500 truncate">{integ.description}</p>
                      </div>
                      <button onClick={() => toggleIntegration(integ.id)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex-shrink-0", integ.connected ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30" : "bg-slate-700 text-slate-400 border-slate-600 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30")}>
                        {integ.connected ? <><Check className="w-3 h-3" />Connected</> : <><Plus className="w-3 h-3" />Connect</>}
                      </button>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "verticals" && (
        <div className="space-y-3">
          {verticals.map(v => (
            <Card key={v.id} className="p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-white">{v.name}</p>
                  {!v.active && <span className="text-xs text-slate-500">(inactive)</span>}
                </div>
                <p className="text-xs text-slate-500">{v.leads.toLocaleString()} leads · {v.ruleCount} compliance rules</p>
              </div>
              <button onClick={() => toggleVertical(v.id)} className={cn("w-10 h-5 rounded-full transition-colors relative flex-shrink-0", v.active ? "bg-emerald-500" : "bg-slate-600")}>
                <span className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow", v.active ? "left-5" : "left-0.5")} />
              </button>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "account" && (
        <Card className="p-6 max-w-lg space-y-4">
          {[
            { label: "Full Name", key: "name" as const },
            { label: "Email", key: "email" as const },
            { label: "Company", key: "company" as const },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs text-slate-400 mb-1.5 block">{field.label}</label>
              <input value={account[field.key]} onChange={e => setAccount(a => ({ ...a, [field.key]: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50" />
            </div>
          ))}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Timezone</label>
            <select value={account.timezone} onChange={e => setAccount(a => ({ ...a, timezone: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50">
              {["America/Chicago", "America/New_York", "America/Denver", "America/Los_Angeles"].map(tz => <option key={tz}>{tz}</option>)}
            </select>
          </div>
          <button onClick={handleSaveAccount} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-medium transition-colors">Save Changes</button>
        </Card>
      )}

      {activeTab === "team" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">{TEAM.length} members</p>
            <button onClick={() => toast.info("Invite sent")} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Invite Member
            </button>
          </div>
          {TEAM.map(member => (
            <Card key={member.id} className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400 flex-shrink-0">{member.avatar}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{member.name}</p>
                <p className="text-xs text-slate-500">{member.email}</p>
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium border", member.status === "active" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30")}>{member.status}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 border border-slate-600">{member.role}</span>
              {member.role !== "Admin" && (
                <button onClick={() => toast(`${member.name} removed`, "warning")} className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded"><X className="w-3.5 h-3.5" /></button>
              )}
            </Card>
          ))}
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="space-y-3 max-w-xl">
          {notifications.map(n => (
            <Card key={n.id} className="p-4 flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{n.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.description}</p>
              </div>
              <button onClick={() => toggleNotification(n.id)} className={cn("mt-0.5 w-9 h-5 rounded-full transition-colors relative flex-shrink-0", n.enabled ? "bg-emerald-500" : "bg-slate-600")}>
                <span className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow", n.enabled ? "left-4" : "left-0.5")} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
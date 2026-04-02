"use client";

import { useState } from "react";
import {
  Building,
  Globe,
  Phone,
  Calendar,
  DollarSign,
  Palette,
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Heart,
  Scale,
  Home,
  Car,
  Save,
  Key,
  Users,
  Shield,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ChevronRight,
  Zap,
  Activity,
  Mail,
  MessageSquare,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusDot } from "@/components/ui/StatusDot";
import { integrations } from "@/lib/data";

const iconMap: Record<string, React.ElementType> = {
  "Salesforce CRM":   Building,
  "Google Ads":       Globe,
  "Meta Ads":         Globe,
  "Twilio":           Phone,
  "HubSpot":          Building,
  "Calendly":         Calendar,
  "TikTok Ads":       Globe,
  "Figma":            Palette,
  "Stripe":           DollarSign,
  "LinkedIn Ads":     Globe,
  "Google Calendar":  Calendar,
  "Slack":            Bell,
};

const categoryColors: Record<string, string> = {
  CRM:            "#6366f1",
  "Ad Platform":  "#f59e0b",
  Communications: "#10b981",
  Calendar:       "#3b82f6",
  Creative:       "#ec4899",
  Revenue:        "#34d399",
  Notifications:  "#8b5cf6",
};

const VERTICALS_INIT = [
  { v: "Medicare",       active: true,  Icon: Heart,      color: "#3b82f6" },
  { v: "Auto Insurance", active: true,  Icon: Car,        color: "#f59e0b" },
  { v: "Personal Injury",active: true,  Icon: Scale,      color: "#8b5cf6" },
  { v: "Home Services",  active: true,  Icon: Home,       color: "#10b981" },
  { v: "Debt Settlement",active: false, Icon: DollarSign, color: "#6b7280" },
  { v: "SaaS / B2B",    active: false, Icon: Globe,      color: "#6b7280" },
];

const NOTIFICATION_PREFS = [
  { label: "New Appointment Booked",        channel: "Slack + Email", icon: Calendar,     on: true  },
  { label: "Compliance Flag Triggered",     channel: "Slack + SMS",   icon: Shield,       on: true  },
  { label: "Agent Decision (High Impact)",  channel: "Slack",         icon: Zap,          on: true  },
  { label: "Daily Revenue Summary",         channel: "Email",         icon: Mail,         on: true  },
  { label: "Lead Score Threshold (90+)",    channel: "SMS",           icon: Activity,     on: true  },
  { label: "Experiment Significance Hit",   channel: "Slack",         icon: RefreshCw,    on: false },
  { label: "Compliance Approval Needed",    channel: "Email + Slack", icon: AlertTriangle,on: true  },
  { label: "Weekly Performance Digest",     channel: "Email",         icon: MessageSquare,on: false },
];

type TabKey = "integrations" | "verticals" | "account" | "team" | "notifications";

const TABS: { key: TabKey; label: string }[] = [
  { key: "integrations",  label: "Integrations" },
  { key: "verticals",     label: "Verticals" },
  { key: "account",       label: "Account" },
  { key: "team",          label: "Team" },
  { key: "notifications", label: "Notifications" },
];

const TEAM_MEMBERS = [
  { name: "Jason Davis",    email: "jason@apexrevenue.com",    role: "Admin",    avatar: "JD", active: true  },
  { name: "Maria Santos",   email: "maria@apexrevenue.com",    role: "Manager",  avatar: "MS", active: true  },
  { name: "Tyler Nguyen",   email: "tyler@apexrevenue.com",    role: "Setter",   avatar: "TN", active: true  },
  { name: "Aisha Okonkwo",  email: "aisha@apexrevenue.com",    role: "Setter",   avatar: "AO", active: true  },
  { name: "Brad Harrison",  email: "brad@apexrevenue.com",     role: "Closer",   avatar: "BH", active: false },
  { name: "Rachel Kim",     email: "rachel@apexrevenue.com",   role: "Closer",   avatar: "RK", active: true  },
  { name: "Devon Marsh",    email: "devon@apexrevenue.com",    role: "Analyst",  avatar: "DM", active: true  },
  { name: "Sophie Lin",     email: "sophie@apexrevenue.com",   role: "Analyst",  avatar: "SL", active: false },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab]       = useState<TabKey>("integrations");
  const [verticals, setVerticals]       = useState(VERTICALS_INIT);
  const [notifications, setNotifications] = useState(NOTIFICATION_PREFS);
  const [apiVisible, setApiVisible]     = useState(false);
  const [saved, setSaved]               = useState(false);
  const [copied, setCopied]             = useState(false);

  const toggleVertical = (idx: number) => {
    setVerticals((v) =>
      v.map((item, i) => (i === idx ? { ...item, active: !item.active } : item))
    );
  };

  const toggleNotif = (idx: number) => {
    setNotifications((n) =>
      n.map((item, i) => (i === idx ? { ...item, on: !item.on } : item))
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const connectedCount = integrations.filter(
    (i) => i.status === "connected"
  ).length;

  return (
    <>
      <TopBar title="Settings & Integrations" subtitle="Account configuration" />
      <div className="p-6 space-y-6">

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Connected Integrations"
            value={`${connectedCount} / ${integrations.length}`}
            icon={Globe}
            color="#10b981"
          />
          <MetricCard
            label="Active Verticals"
            value={`${verticals.filter((v) => v.active).length} / ${verticals.length}`}
            icon={Shield}
            color="#6366f1"
          />
          <MetricCard
            label="API Uptime (30d)"
            value="99.9%"
            sub="All systems operational"
            icon={Activity}
            color="#10b981"
          />
          <MetricCard
            label="Team Members"
            value={String(TEAM_MEMBERS.filter((m) => m.active).length)}
            sub={`${TEAM_MEMBERS.filter((m) => !m.active).length} inactive`}
            icon={Users}
            color="#f59e0b"
          />
        </div>

        {/* ── Tab bar ── */}
        <div className="flex gap-1.5 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`text-xs px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === t.key
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ─────────────────────────────────────────────── */}
        {/* INTEGRATIONS tab                               */}
        {/* ─────────────────────────────────────────────── */}
        {activeTab === "integrations" && (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">
                  All Integrations
                </h3>
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-1.5 text-xs border border-slate-700 text-slate-400 px-3 py-1.5 rounded-lg hover:border-slate-500 transition-colors"
                    onClick={() => {}}
                  >
                    <RefreshCw size={12} />
                    Sync All
                  </button>
                  <button className="flex items-center gap-1.5 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors">
                    <Plus size={12} />
                    Add Integration
                  </button>
                </div>
              </div>

              {/* Group by category */}
              {Array.from(new Set(integrations.map((i) => i.category))).map(
                (cat) => {
                  const items = integrations.filter((i) => i.category === cat);
                  const catColor = categoryColors[cat] ?? "#64748b";
                  return (
                    <div key={cat} className="mb-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-xs font-semibold"
                          style={{ color: catColor }}
                        >
                          {cat}
                        </span>
                        <div className="flex-1 h-px bg-slate-800" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {items.map((int) => {
                          const Icon = iconMap[int.name] ?? Globe;
                          return (
                            <div
                              key={int.name}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                int.status === "warning"
                                  ? "bg-amber-500/5 border-amber-500/20"
                                  : int.status === "disconnected"
                                  ? "bg-slate-900/30 border-slate-800"
                                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                              }`}
                            >
                              <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: catColor + "15" }}
                              >
                                <Icon size={16} style={{ color: catColor }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white">
                                  {int.name}
                                </div>
                                <div className="text-xs text-slate-500 truncate">
                                  {int.description}
                                </div>
                                <div className="text-[10px] text-slate-600 mt-0.5">
                                  Last sync: {int.lastSync}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <div
                                  className={`flex items-center gap-1 text-xs ${
                                    int.status === "connected"
                                      ? "text-emerald-400"
                                      : int.status === "warning"
                                      ? "text-amber-400"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {int.status === "connected"    && <CheckCircle2  size={11} />}
                                  {int.status === "warning"      && <AlertTriangle size={11} />}
                                  {int.status === "disconnected" && <XCircle       size={11} />}
                                  <span className="capitalize">{int.status}</span>
                                </div>
                                <button
                                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                                    int.status === "disconnected"
                                      ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                                      : int.status === "warning"
                                      ? "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                                      : "border-slate-700 text-slate-400 hover:border-slate-500"
                                  }`}
                                >
                                  {int.status === "disconnected"
                                    ? "Connect"
                                    : int.status === "warning"
                                    ? "Reconnect"
                                    : "Manage"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              )}
            </Card>

            {/* Webhook configuration */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-white mb-4">
                Webhook Configuration
              </h3>
              <div className="space-y-3">
                {[
                  { event: "lead.created",         endpoint: "https://hook.zapier.com/hooks/catch/apex/lead-new",    active: true  },
                  { event: "appointment.booked",   endpoint: "https://your-crm.com/webhooks/apex/appointment",       active: true  },
                  { event: "compliance.flagged",   endpoint: "https://hooks.slack.com/services/T0/B0/apex-compliance",active: true  },
                  { event: "experiment.complete",  endpoint: "https://your-bi.com/apex/experiment",                  active: false },
                ].map((wh) => (
                  <div
                    key={wh.event}
                    className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${wh.active ? "bg-emerald-400" : "bg-slate-600"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-emerald-400">
                        {wh.event}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {wh.endpoint}
                      </div>
                    </div>
                    <button className="text-slate-500 hover:text-slate-300 transition-colors">
                      <ChevronRight size={12} />
                    </button>
                  </div>
                ))}
                <button className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors mt-1">
                  <Plus size={12} />Add webhook
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* ─────────────────────────────────────────────── */}
        {/* VERTICALS tab                                  */}
        {/* ─────────────────────────────────────────────── */}
        {activeTab === "verticals" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">
                  Active Verticals
                </h3>
                <Badge color="emerald">
                  {verticals.filter((v) => v.active).length} active
                </Badge>
              </div>
              <div className="space-y-2">
                {verticals.map((item, idx) => (
                  <div
                    key={item.v}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      item.active
                        ? "bg-slate-900/50 border-slate-700"
                        : "bg-slate-900/20 border-slate-800"
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all"
                      style={{ background: item.active ? item.color + "20" : "#1e293b" }}
                    >
                      <item.Icon
                        size={16}
                        style={{ color: item.active ? item.color : "#475569" }}
                      />
                    </div>
                    <div className="flex-1">
                      <div
                        className={`text-sm font-medium transition-colors ${
                          item.active ? "text-white" : "text-slate-500"
                        }`}
                      >
                        {item.v}
                      </div>
                      {item.active && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          All 7 agents active
                        </div>
                      )}
                    </div>
                    {item.active && (
                      <Badge color="emerald">Active</Badge>
                    )}
                    <button
                      onClick={() => toggleVertical(idx)}
                      className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${
                        item.active ? "bg-emerald-500" : "bg-slate-700"
                      }`}
                      aria-label={`Toggle ${item.v}`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          item.active ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800">
                <button className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                  <Plus size={12} />Request new vertical
                </button>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-semibold text-white mb-4">
                Vertical Configuration
              </h3>
              <div className="space-y-4">
                {verticals
                  .filter((v) => v.active)
                  .map((item) => (
                    <div key={item.v} className="bg-slate-900 rounded-xl p-3 border border-slate-800">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{ background: item.color + "20" }}
                        >
                          <item.Icon size={12} style={{ color: item.color }} />
                        </div>
                        <span className="text-xs font-semibold text-white">
                          {item.v}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        {[
                          ["Compliance tier", "Tier 1–2"],
                          ["Lead target CPL", "$40"],
                          ["Appt. target",    "80%+ show"],
                          ["Outreach budget", "Auto"],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-slate-500">{k}</span>
                            <span className="text-white font-medium">{v}</span>
                          </div>
                        ))}
                      </div>
                      <button className="mt-2 text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                        Configure <ChevronRight size={10} />
                      </button>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        )}

        {/* ─────────────────────────────────────────────── */}
        {/* ACCOUNT tab                                    */}
        {/* ─────────────────────────────────────────────── */}
        {activeTab === "account" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account details */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-white mb-4">
                Account Details
              </h3>
              <div className="space-y-3">
                {[
                  ["Company Name",     "Apex Revenue Inc."         ],
                  ["Plan",             "Growth ($4,500/mo)"         ],
                  ["Billing Email",    "billing@apexrevenue.com"    ],
                  ["Billing Cycle",    "Monthly · Renews May 1"     ],
                  ["Timezone",         "America/Chicago (CT)"       ],
                  ["Data Retention",   "24 months"                  ],
                  ["Support Tier",     "Priority (4hr SLA)"         ],
                  ["Account ID",       "APX-2024-00841"             ],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between py-1.5 border-b border-slate-800"
                  >
                    <span className="text-xs text-slate-400">{k}</span>
                    <span className="text-xs text-white font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSave}
                className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  saved
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-500 hover:bg-emerald-400 text-white"
                }`}
              >
                {saved ? (
                  <><CheckCircle2 size={14} />Saved!</>
                ) : (
                  <><Save size={14} />Save Changes</>
                )}
              </button>
            </Card>

            {/* API Keys */}
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">API Keys</h3>
                  <button className="flex items-center gap-1.5 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors">
                    <Plus size={12} />New Key
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      label: "Production API Key",
                      value: apiVisible ? "sk-apex-live-a4f9b2c3d1e0f5a6b7c8d9e0f1a2b3c4-3f9a" : "sk-apex-live-••••••••••••••••••••••••••••••3f9a",
                      active: true,
                      env: "Production",
                    },
                    {
                      label: "Staging API Key",
                      value: "sk-apex-stg-••••••••••••••••••••••••••••••ab12",
                      active: true,
                      env: "Staging",
                    },
                    {
                      label: "Webhook Secret",
                      value: "whsec-••••••••••••••••••••••••••••••cd34",
                      active: true,
                      env: "All",
                    },
                  ].map((k) => (
                    <div
                      key={k.label}
                      className="p-3 bg-slate-900 rounded-lg border border-slate-800"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-white">
                            {k.label}
                          </span>
                          <Badge color={k.env === "Production" ? "red" : k.env === "Staging" ? "amber" : "slate"}>
                            {k.env}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {k.label === "Production API Key" && (
                            <button
                              onClick={() => setApiVisible((v) => !v)}
                              className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                            >
                              {apiVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                          )}
                          <button
                            onClick={handleCopy}
                            className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                          >
                            {copied ? (
                              <CheckCircle2 size={12} className="text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                          <button className="text-slate-500 hover:text-red-400 transition-colors p-0.5">
                            <RefreshCw size={12} />
                          </button>
                        </div>
                      </div>
                      <code className="text-xs font-mono text-slate-400 break-all leading-relaxed">
                        {k.value}
                      </code>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Danger zone */}
              <Card className="p-4 border-red-500/20">
                <h3 className="text-sm font-semibold text-red-400 mb-3">
                  Danger Zone
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Pause all campaigns",  desc: "Stop all active ad spend immediately" },
                    { label: "Reset all AI agents",  desc: "Clear agent memory and restart learning" },
                    { label: "Delete account data",  desc: "Permanently remove all leads and data" },
                  ].map((action) => (
                    <div
                      key={action.label}
                      className="flex items-center justify-between p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg"
                    >
                      <div>
                        <div className="text-xs font-medium text-white">
                          {action.label}
                        </div>
                        <div className="text-xs text-slate-500">{action.desc}</div>
                      </div>
                      <button className="text-xs border border-red-500/40 text-red-400 hover:bg-red-500/10 px-2.5 py-1 rounded-lg transition-colors">
                        {action.label.startsWith("Delete") ? (
                          <span className="flex items-center gap-1"><Trash2 size={10} />Delete</span>
                        ) : (
                          action.label.split(" ")[0]
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────── */}
        {/* TEAM tab                                       */}
        {/* ─────────────────────────────────────────────── */}
        {activeTab === "team" && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">
                Team Members
              </h3>
              <button className="flex items-center gap-1.5 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors">
                <Plus size={12} />Invite Member
              </button>
            </div>
            <div className="space-y-2">
              {TEAM_MEMBERS.map((m) => (
                <div
                  key={m.email}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    m.active
                      ? "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                      : "bg-slate-900/20 border-slate-800/50 opacity-60"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {m.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {m.name}
                      </span>
                      {!m.active && (
                        <Badge color="slate">Inactive</Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {m.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      color={
                        m.role === "Admin"   ? "red"    :
                        m.role === "Manager" ? "purple" :
                        m.role === "Setter"  ? "blue"   :
                        m.role === "Closer"  ? "emerald": "slate"
                      }
                    >
                      {m.role}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <StatusDot status={m.active ? "active" : "paused"} />
                    </div>
                    <button className="text-slate-500 hover:text-slate-300 transition-colors">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                ["Admin",   "1"],
                ["Manager", "1"],
                ["Setter",  "2"],
                ["Closer",  "2"],
              ].map(([role, count]) => (
                <div key={role} className="bg-slate-900 rounded-lg p-2.5">
                  <div className="text-sm font-bold text-white">{count}</div>
                  <div className="text-xs text-slate-500">{role}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ─────────────────────────────────────────────── */}
        {/* NOTIFICATIONS tab                              */}
        {/* ─────────────────────────────────────────────── */}
        {activeTab === "notifications" && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">
                Notification Preferences
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{notifications.filter((n) => n.on).length} active</span>
                <span>/</span>
                <span>{notifications.length} total</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {notifications.map((n, idx) => (
                <div
                  key={n.label}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                    n.on
                      ? "bg-slate-900/50 border-slate-700"
                      : "bg-slate-900/20 border-slate-800 opacity-60"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      n.on ? "bg-emerald-500/20" : "bg-slate-800"
                    }`}
                  >
                    <n.icon
                      size={14}
                      className={n.on ? "text-emerald-400" : "text-slate-600"}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-medium ${n.on ? "text-white" : "text-slate-500"}`}>
                      {n.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      via {n.channel}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleNotif(idx)}
                    className={`w-9 h-4.5 h-5 rounded-full flex items-center px-0.5 transition-colors shrink-0 mt-0.5 ${
                      n.on ? "bg-emerald-500" : "bg-slate-700"
                    }`}
                    aria-label={`Toggle ${n.label}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        n.on ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() =>
                  setNotifications((n) => n.map((i) => ({ ...i, on: true })))
                }
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Enable all
              </button>
              <button
                onClick={() =>
                  setNotifications((n) => n.map((i) => ({ ...i, on: false })))
                }
                className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
              >
                Disable all
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-medium transition-all ${
                  saved
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-500 hover:bg-emerald-400 text-white"
                }`}
              >
                {saved ? <><CheckCircle2 size={12} />Saved!</> : <><Save size={12} />Save Preferences</>}
              </button>
            </div>
          </Card>
        )}

      </div>
    </>
  );
}

// Need this import for MoreHorizontal in team tab
function MoreHorizontal({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
    </svg>
  );
}

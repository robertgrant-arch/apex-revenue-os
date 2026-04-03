"use client";
import { useState } from "react";
import {
  User, Bell, Shield, Key, Users, Plug, Save,
  Plus, Copy, Eye, EyeOff, Check, Trash2
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Toast, useToast } from "@/components/ui/Toast";

// ── Types ──────────────────────────────────────────────────────────────────────
interface TeamMember { id: string; name: string; email: string; role: string; status: "active" | "pending"; }
interface Integration { id: string; name: string; description: string; status: "connected" | "disconnected"; icon: string; }
interface ApiKey { id: string; name: string; key: string; created: string; lastUsed: string; visible: boolean; }

// ── Mock Data ──────────────────────────────────────────────────────────────────
const INIT_MEMBERS: TeamMember[] = [
  { id: "m1", name: "Bob Grant", email: "robert.grant@selectquote.com", role: "Admin", status: "active" },
  { id: "m2", name: "Jane Martinez", email: "j.martinez@selectquote.com", role: "Agent", status: "active" },
  { id: "m3", name: "Lee Chen", email: "l.chen@selectquote.com", role: "Analyst", status: "pending" },
];

const INIT_INTEGRATIONS: Integration[] = [
  { id: "i1", name: "Salesforce", description: "CRM sync and lead handoff", status: "connected", icon: "S" },
  { id: "i2", name: "Google Ads", description: "Campaign management and performance data", status: "connected", icon: "G" },
  { id: "i3", name: "Facebook Ads", description: "Social campaign automation", status: "connected", icon: "F" },
  { id: "i4", name: "HubSpot", description: "Marketing automation and email sequences", status: "disconnected", icon: "H" },
  { id: "i5", name: "Twilio", description: "SMS and voice communication", status: "disconnected", icon: "T" },
  { id: "i6", name: "Stripe", description: "Billing and payment processing", status: "disconnected", icon: "St" },
];

const INIT_KEYS: ApiKey[] = [
  { id: "k1", name: "Production Key", key: "apex_prod_sk_4f8a2b3c9d1e5f7a", created: "2025-06-01", lastUsed: "2025-07-14", visible: false },
  { id: "k2", name: "Development Key", key: "apex_dev_sk_1a2b3c4d5e6f7a8b", created: "2025-06-15", lastUsed: "2025-07-13", visible: false },
];

const TABS = [
  { id: "profile", label: "Profile", icon: <User size={16} /> },
  { id: "team", label: "Team", icon: <Users size={16} /> },
  { id: "integrations", label: "Integrations", icon: <Plug size={16} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { id: "security", label: "Security", icon: <Shield size={16} /> },
  { id: "api", label: "API Keys", icon: <Key size={16} /> },
];

// ── Page ───────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [members, setMembers] = useState<TeamMember[]>(INIT_MEMBERS);
  const [integrations, setIntegrations] = useState<Integration[]>(INIT_INTEGRATIONS);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(INIT_KEYS);

  // Profile form
  const [profile, setProfile] = useState({ name: "Bob Grant", email: "robert.grant@selectquote.com", company: "SelectQuote", role: "Product / Strategy" });

  // Notification prefs
  const [notifs, setNotifs] = useState({ leadAlerts: true, complianceFlags: true, campaignReports: false, agentErrors: true, weeklyDigest: true });

  // Invite modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "Agent" });

  // Connect modal
  const [connectOpen, setConnectOpen] = useState(false);
  const [connectTarget, setConnectTarget] = useState<Integration | null>(null);
  const [connectForm, setConnectForm] = useState({ apiKey: "", accountId: "" });

  // New API Key modal
  const [newKeyOpen, setNewKeyOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSaveProfile = () => {
    if (!profile.name.trim()) { addToast("Name is required", "error"); return; }
    addToast("Profile saved successfully", "success");
  };

  const handleSaveNotifs = () => {
    addToast("Notification preferences saved", "success");
  };

  const handleInvite = () => {
    if (!inviteForm.email.trim() || !inviteForm.email.includes("@")) { addToast("Valid email required", "error"); return; }
    const nm: TeamMember = {
      id: `m${Date.now()}`, name: inviteForm.email.split("@")[0], email: inviteForm.email, role: inviteForm.role, status: "pending",
    };
    setMembers((p) => [...p, nm]);
    setInviteOpen(false);
    setInviteForm({ email: "", role: "Agent" });
    addToast(`Invite sent to ${inviteForm.email}`, "success");
  };

  const handleConnect = () => {
    if (!connectForm.apiKey.trim()) { addToast("API key is required", "error"); return; }
    if (!connectTarget) return;
    setIntegrations((prev) => prev.map((i) => i.id === connectTarget.id ? { ...i, status: "connected" } : i));
    setConnectOpen(false);
    setConnectForm({ apiKey: "", accountId: "" });
    addToast(`${connectTarget.name} connected successfully`, "success");
  };

  const handleDisconnect = (id: string) => {
    setIntegrations((prev) => prev.map((i) => i.id === id ? { ...i, status: "disconnected" } : i));
    const integration = integrations.find((i) => i.id === id);
    addToast(`${integration?.name} disconnected`, "info");
  };

  const handleNewKey = () => {
    if (!newKeyName.trim()) { addToast("Key name is required", "error"); return; }
    const nk: ApiKey = {
      id: `k${Date.now()}`, name: newKeyName,
      key: `apex_${newKeyName.toLowerCase().replace(/\s+/g, "_")}_sk_${Math.random().toString(36).slice(2, 18)}`,
      created: new Date().toISOString().slice(0, 10), lastUsed: "Never", visible: true,
    };
    setApiKeys((p) => [nk, ...p]);
    setNewKeyOpen(false);
    setNewKeyName("");
    addToast(`API key "${nk.name}" created`, "success");
  };

  const toggleKeyVisibility = (id: string) => {
    setApiKeys((prev) => prev.map((k) => k.id === id ? { ...k, visible: !k.visible } : k));
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key).then(() => addToast("API key copied to clipboard", "success"));
  };

  const deleteKey = (id: string) => {
    const key = apiKeys.find((k) => k.id === id);
    setApiKeys((p) => p.filter((k) => k.id !== id));
    addToast(`Key "${key?.name}" deleted`, "info");
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account, team, and integrations</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Nav */}
        <div className="w-52 shrink-0">
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-violet-600/20 text-violet-400 border border-violet-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* ── Profile ── */}
          {activeTab === "profile" && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 space-y-4">
              <h2 className="text-base font-semibold text-white mb-4">Profile Settings</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Full Name", key: "name", placeholder: "Your full name" },
                  { label: "Email", key: "email", placeholder: "your@email.com" },
                  { label: "Company", key: "company", placeholder: "Company name" },
                  { label: "Role", key: "role", placeholder: "Your role" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm text-slate-400 mb-1.5">{label}</label>
                    <input
                      value={profile[key as keyof typeof profile]}
                      onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={handleSaveProfile} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all">
                  <Save size={15} /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* ── Team ── */}
          {activeTab === "team" && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
                <h2 className="text-base font-semibold text-white">Team Members</h2>
                <button
                  onClick={() => setInviteOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all"
                >
                  <Plus size={15} /> Invite Member
                </button>
              </div>
              <div className="divide-y divide-slate-700/30">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-sm font-semibold">
                        {m.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{m.name}</div>
                        <div className="text-xs text-slate-500">{m.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{m.role}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${m.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                        {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Integrations ── */}
          {activeTab === "integrations" && (
            <div className="grid grid-cols-1 gap-4">
              {integrations.map((intg) => (
                <div key={intg.id} className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
                      {intg.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{intg.name}</div>
                      <div className="text-xs text-slate-500">{intg.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 text-xs ${intg.status === "connected" ? "text-emerald-400" : "text-slate-500"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${intg.status === "connected" ? "bg-emerald-400" : "bg-slate-600"}`} />
                      {intg.status === "connected" ? "Connected" : "Disconnected"}
                    </span>
                    {intg.status === "connected" ? (
                      <button
                        onClick={() => handleDisconnect(intg.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-xs transition-all border border-slate-600/50"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => { setConnectTarget(intg); setConnectForm({ apiKey: "", accountId: "" }); setConnectOpen(true); }}
                        className="px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 text-xs transition-all border border-violet-500/20"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Notifications ── */}
          {activeTab === "notifications" && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 space-y-4">
              <h2 className="text-base font-semibold text-white mb-4">Notification Preferences</h2>
              <div className="space-y-3">
                {(Object.entries(notifs) as [keyof typeof notifs, boolean][]).map(([key, val]) => {
                  const labels: Record<keyof typeof notifs, string> = {
                    leadAlerts: "New high-score lead alerts",
                    complianceFlags: "Compliance flags and rejections",
                    campaignReports: "Daily campaign performance reports",
                    agentErrors: "Agent error and anomaly alerts",
                    weeklyDigest: "Weekly revenue digest email",
                  };
                  return (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-slate-700/30 last:border-0">
                      <span className="text-sm text-slate-300">{labels[key]}</span>
                      <button
                        onClick={() => setNotifs((p) => ({ ...p, [key]: !val }))}
                        className={`relative w-10 h-5 rounded-full transition-colors ${val ? "bg-violet-600" : "bg-slate-700"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${val ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={handleSaveNotifs} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all">
                  <Save size={15} /> Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-base font-semibold text-white mb-4">Password</h2>
                <div className="space-y-3">
                  {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                    <div key={label}>
                      <label className="block text-sm text-slate-400 mb-1.5">{label}</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => addToast("Password updated successfully", "success")}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all"
                  >
                    <Save size={15} /> Update Password
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Two-Factor Authentication</div>
                    <div className="text-xs text-slate-500 mt-0.5">Add an extra layer of security to your account</div>
                  </div>
                  <button
                    onClick={() => addToast("2FA setup — coming soon", "info")}
                    className="px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:text-white text-sm transition-all border border-slate-600/50"
                  >
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── API Keys ── */}
          {activeTab === "api" && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
                <div>
                  <h2 className="text-base font-semibold text-white">API Keys</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Keep these secret — they grant full API access</p>
                </div>
                <button
                  onClick={() => { setNewKeyName(""); setNewKeyOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all"
                >
                  <Plus size={15} /> New Key
                </button>
              </div>
              <div className="divide-y divide-slate-700/30">
                {apiKeys.map((k) => (
                  <div key={k.id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-white">{k.name}</div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => copyKey(k.key)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-all"><Copy size={13} /></button>
                        <button onClick={() => toggleKeyVisibility(k.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-all">
                          {k.visible ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button onClick={() => deleteKey(k.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={13} /></button>
                      </div>
                    </div>
                    <div className="font-mono text-xs text-slate-400 bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-700/30">
                      {k.visible ? k.key : k.key.slice(0, 12) + "••••••••••••••••••••"}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-slate-600">
                      <span>Created: {k.created}</span>
                      <span>Last used: {k.lastUsed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Invite Modal ─────────────────────────────────────────────────────── */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Team Member">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Email Address <span className="text-red-400">*</span></label>
            <input
              value={inviteForm.email}
              onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
              type="email"
              placeholder="colleague@selectquote.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Role</label>
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm((p) => ({ ...p, role: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
            >
              {["Admin", "Analyst", "Agent", "Read Only"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setInviteOpen(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">Cancel</button>
            <button onClick={handleInvite} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all">
              <Plus size={15} /> Send Invite
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Connect Integration Modal ─────────────────────────────────────────── */}
      <Modal open={connectOpen} onClose={() => setConnectOpen(false)} title={`Connect ${connectTarget?.name ?? ""}`}>
        <div className="space-y-4">
          <p className="text-sm text-slate-400">{connectTarget?.description}</p>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">API Key / Access Token <span className="text-red-400">*</span></label>
            <input
              value={connectForm.apiKey}
              onChange={(e) => setConnectForm((p) => ({ ...p, apiKey: e.target.value }))}
              type="password"
              placeholder="Paste your API key…"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors font-mono"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Account ID (optional)</label>
            <input
              value={connectForm.accountId}
              onChange={(e) => setConnectForm((p) => ({ ...p, accountId: e.target.value }))}
              placeholder="Your account or workspace ID"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConnectOpen(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">Cancel</button>
            <button onClick={handleConnect} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all">
              <Check size={15} /> Connect
            </button>
          </div>
        </div>
      </Modal>

      {/* ── New API Key Modal ──────────────────────────────────────────────────── */}
      <Modal open={newKeyOpen} onClose={() => setNewKeyOpen(false)} title="Create New API Key">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Key Name <span className="text-red-400">*</span></label>
            <input
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g. Staging Key, CI/CD Key"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <p className="text-xs text-amber-400">The key will only be shown once. Copy and store it securely before closing this dialog.</p>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setNewKeyOpen(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">Cancel</button>
            <button onClick={handleNewKey} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all">
              <Key size={15} /> Generate Key
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
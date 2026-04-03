"use client";
import { useState, useRef, useEffect } from "react";
import {
  Search, Bell, X, CheckCircle, AlertTriangle, Info,
  TrendingUp, Zap, Shield, Brain, ArrowRight
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Toast, useToast } from "@/components/ui/Toast";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Notification {
  id: string;
  type: "alert" | "success" | "info" | "warning";
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  href: string;
  icon: React.ReactNode;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "alert", title: "CPL Spike Detected", message: "Medicare Facebook CPL up 40% — AnalyticsEngine flagged anomaly", time: "3m ago", read: false },
  { id: "n2", type: "warning", title: "Compliance Flag", message: "Agent script submitted by ContentCreator contains prohibited language", time: "45m ago", read: false },
  { id: "n3", type: "success", title: "A/B Test Winner", message: "Medicare Advantage Variant B is winning at 95% confidence", time: "2h ago", read: false },
  { id: "n4", type: "info", title: "Budget Threshold", message: "Q3 Medicare campaign has spent 64% of budget", time: "4h ago", read: true },
  { id: "n5", type: "success", title: "1,847 Leads Scored", message: "LeadScorer processed today's leads with 98.2% success rate", time: "5h ago", read: true },
  { id: "n6", type: "info", title: "Weekly Report Ready", message: "Your July 7–13 revenue digest is available", time: "1d ago", read: true },
];

const ALL_RESULTS: SearchResult[] = [
  { id: "s1", title: "Medicare Advantage Q3 Push", subtitle: "Campaign · Active · $32,400 spent", category: "Campaigns", href: "/campaigns", icon: <TrendingUp size={15} /> },
  { id: "s2", title: "LeadScorer Agent", subtitle: "AI Agent · 1,847 tasks today · 98.2% success", category: "Agents", href: "/agents", icon: <Brain size={15} /> },
  { id: "s3", title: "ComplianceGuardian", subtitle: "AI Agent · 5,621 tasks · 99.8% success", category: "Agents", href: "/agents", icon: <Shield size={15} /> },
  { id: "s4", title: "Margaret Thompson", subtitle: "Lead · Medicare · Score 94 · Florida", category: "Leads", href: "/leads", icon: <Zap size={15} /> },
  { id: "s5", title: "ACA Open Enrollment 2025", subtitle: "Campaign · Draft · $75,000 budget", category: "Campaigns", href: "/campaigns", icon: <TrendingUp size={15} /> },
  { id: "s6", title: "TCPA Consent Rule", subtitle: "Compliance · Critical · 892 triggers", category: "Compliance", href: "/compliance", icon: <Shield size={15} /> },
  { id: "s7", title: "Medicare Advantage - Hero Banner V2", subtitle: "Creative · Active · CTR 5.1%", category: "Creative", href: "/creative", icon: <Zap size={15} /> },
  { id: "s8", title: "CMS Prohibited Language Filter", subtitle: "Compliance · Critical · 147 triggers", category: "Compliance", href: "/compliance", icon: <Shield size={15} /> },
];

const notifIcon = (type: Notification["type"]) => {
  if (type === "success") return <CheckCircle size={15} className="text-emerald-400 shrink-0" />;
  if (type === "alert") return <AlertTriangle size={15} className="text-red-400 shrink-0" />;
  if (type === "warning") return <AlertTriangle size={15} className="text-amber-400 shrink-0" />;
  return <Info size={15} className="text-blue-400 shrink-0" />;
};

// ── TopBar ─────────────────────────────────────────────────────────────────────
export default function TopBar() {
  const { toasts, addToast, removeToast } = useToast();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Filter search results
  const filtered = searchQuery.trim().length > 0
    ? ALL_RESULTS.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ALL_RESULTS.slice(0, 5);

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast("All notifications marked as read", "success");
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />

      <header className="h-16 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between px-6 sticky top-0 z-30">
        {/* Left: Logo / App Name */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm tracking-tight">APEX Revenue OS</span>
        </div>

        {/* Right: Search + Notifs + Avatar */}
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600 transition-all text-sm"
          >
            <Search size={15} />
            <span className="hidden md:block text-xs">Search…</span>
            <kbd className="hidden md:block px-1.5 py-0.5 rounded text-xs bg-slate-700 text-slate-500">⌘K</kbd>
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((p) => !p)}
              className={`relative p-2 rounded-lg transition-all ${notifOpen ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 top-12 w-96 bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden z-50">
                {/* Dropdown Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-xs bg-red-500/15 text-red-400 border border-red-500/20">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-96 overflow-y-auto divide-y divide-slate-700/30">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-slate-500 text-sm">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-800/50 cursor-pointer transition-colors ${!n.read ? "bg-slate-800/30" : ""}`}
                      >
                        <div className="mt-0.5">{notifIcon(n.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${n.read ? "text-slate-400" : "text-white"}`}>{n.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</div>
                          <div className="text-xs text-slate-600 mt-1">{n.time}</div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1" />}
                          <button
                            onClick={(e) => clearNotif(n.id, e)}
                            className="p-1 rounded text-slate-600 hover:text-slate-400 hover:bg-slate-700 transition-all"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-slate-700/50">
                  <button className="w-full text-center text-xs text-violet-400 hover:text-violet-300 transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center text-violet-400 text-xs font-bold cursor-pointer hover:bg-violet-600/40 transition-all">
            BG
          </div>
        </div>
      </header>

      {/* ── Search / Command Palette Modal ───────────────────────────────────── */}
      <Modal open={searchOpen} onClose={() => setSearchOpen(false)} title="" width="max-w-2xl">
        {/* Override modal inner padding for full-bleed search */}
        <div className="-mx-6 -mt-5 -mb-5">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/50">
            <Search size={18} className="text-slate-500 shrink-0" />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns, agents, leads, compliance…"
              className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-slate-500 hover:text-white transition-colors">
                <X size={15} />
              </button>
            )}
            <kbd className="px-1.5 py-0.5 rounded text-xs bg-slate-800 text-slate-500 border border-slate-700">esc</kbd>
          </div>

          {/* Results */}
          <div className="max-h-[420px] overflow-y-auto">
            {/* Category Groups */}
            {(() => {
              const categories = [...new Set(filtered.map((r) => r.category))];
              return categories.map((cat) => {
                const items = filtered.filter((r) => r.category === cat);
                return (
                  <div key={cat}>
                    <div className="px-5 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-900/50">
                      {cat}
                    </div>
                    {items.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => {
                          setSearchOpen(false);
                          addToast(`Navigating to ${result.title}`, "info");
                        }}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-800/70 transition-colors text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-400 group-hover:border-slate-600 shrink-0">
                          {result.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white font-medium">{result.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5 truncate">{result.subtitle}</div>
                        </div>
                        <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                );
              });
            })()}

            {filtered.length === 0 && (
              <div className="px-5 py-12 text-center">
                <Search size={24} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No results for "{searchQuery}"</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-700/50 text-xs text-slate-600">
            <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700 mr-1">↑↓</kbd>Navigate</span>
            <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700 mr-1">↵</kbd>Open</span>
            <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700 mr-1">esc</kbd>Close</span>
          </div>
        </div>
      </Modal>
    </>
  );
}
"use client";
import { useState } from "react";
import {
  ChevronDown, ChevronRight, Phone, MessageSquare, Mail,
  CalendarClock, Download, TrendingUp, Users, Target, Clock
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Toast, useToast } from "@/components/ui/Toast";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  vertical: string;
  score: number;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  source: string;
  agent: string;
  createdAt: string;
  age: number;
  state: string;
  notes: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const INITIAL_LEADS: Lead[] = [
  { id: "L-20481", name: "Margaret Thompson", phone: "(555) 234-8901", email: "m.thompson@email.com", vertical: "Medicare", score: 94, status: "new", source: "Google Ads", agent: "Martinez, J.", createdAt: "2025-07-14", age: 67, state: "FL", notes: "Interested in Medicare Advantage Plan G. Has existing coverage expiring Oct 31." },
  { id: "L-20479", name: "Robert Kincaid", phone: "(555) 887-3214", email: "rkincaid@mail.com", vertical: "Medicare", score: 88, status: "contacted", source: "Facebook", agent: "Chen, L.", createdAt: "2025-07-14", age: 71, state: "AZ", notes: "Called once. Left voicemail. Interested in Part D coverage." },
  { id: "L-20475", name: "Sandra Williams", phone: "(555) 112-4567", email: "sandraw@gmail.com", vertical: "ACA", score: 61, status: "qualified", source: "Direct Mail", agent: "Davis, R.", createdAt: "2025-07-13", age: 42, state: "TX", notes: "Self-employed, needs individual plan. Budget ~$400/mo." },
  { id: "L-20468", name: "James Okonkwo", phone: "(555) 543-9012", email: "james.o@work.net", vertical: "Life Insurance", score: 79, status: "contacted", source: "Referral", agent: "Martinez, J.", createdAt: "2025-07-13", age: 38, state: "CA", notes: "Small business owner. Wants $500K term life." },
  { id: "L-20451", name: "Patricia Nguyen", phone: "(555) 678-2345", email: "pnguyen@email.com", vertical: "Final Expense", score: 72, status: "qualified", source: "Inbound Call", agent: "Chen, L.", createdAt: "2025-07-12", age: 74, state: "OH", notes: "On fixed income. Looking for $15K final expense policy." },
  { id: "L-20440", name: "David Morrison", phone: "(555) 901-6789", email: "dmorrison@mail.com", vertical: "Medicare", score: 55, status: "new", source: "Google Ads", agent: "Unassigned", createdAt: "2025-07-12", age: 65, state: "PA", notes: "First time enrollee, turning 65 in 3 months." },
];

// ── CSV Export ────────────────────────────────────────────────────────────────
function exportLeadsToCSV(leads: Lead[]) {
  const headers = ["Lead ID", "Name", "Phone", "Email", "Vertical", "Score", "Status", "Source", "Agent", "Created", "Age", "State"];
  const rows = leads.map((l) => [
    l.id, l.name, l.phone, l.email, l.vertical, l.score,
    l.status, l.source, l.agent, l.createdAt, l.age, l.state,
  ]);
  const csv = [headers, ...rows].map((r) => r.map((cell) => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const statusConfig: Record<Lead["status"], { label: string; color: string }> = {
  new: { label: "New", color: "blue" },
  contacted: { label: "Contacted", color: "amber" },
  qualified: { label: "Qualified", color: "violet" },
  converted: { label: "Converted", color: "emerald" },
  lost: { label: "Lost", color: "red" },
};

const scoreColor = (s: number) => {
  if (s >= 80) return "text-emerald-400";
  if (s >= 60) return "text-amber-400";
  return "text-red-400";
};

// ── Page ───────────────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Modals
  const [callOpen, setCallOpen] = useState(false);
  const [smsOpen, setSmsOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  // Action forms
  const [smsText, setSmsText] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("");

  // ── Open helpers ─────────────────────────────────────────────────────────────
  const openAction = (lead: Lead, action: "call" | "sms" | "email" | "book") => {
    setActiveLead(lead);
    if (action === "call") setCallOpen(true);
    if (action === "sms") { setSmsText(""); setSmsOpen(true); }
    if (action === "email") { setEmailSubject(""); setEmailBody(""); setEmailOpen(true); }
    if (action === "book") { setApptDate(""); setApptTime(""); setBookOpen(true); }
  };

  const markContacted = (leadId: string) => {
    setLeads((prev) => prev.map((l) => l.id === leadId && l.status === "new" ? { ...l, status: "contacted" } : l));
  };

  const handleCall = () => {
    if (!activeLead) return;
    markContacted(activeLead.id);
    setCallOpen(false);
    addToast(`Initiating call to ${activeLead.name} at ${activeLead.phone}`, "info");
  };

  const handleSMS = () => {
    if (!smsText.trim()) { addToast("Message cannot be empty", "error"); return; }
    if (!activeLead) return;
    markContacted(activeLead.id);
    setSmsOpen(false);
    setSmsText("");
    addToast(`SMS sent to ${activeLead.name}`, "success");
  };

  const handleEmail = () => {
    if (!emailSubject.trim()) { addToast("Subject is required", "error"); return; }
    if (!emailBody.trim()) { addToast("Message body is required", "error"); return; }
    if (!activeLead) return;
    markContacted(activeLead.id);
    setEmailOpen(false);
    setEmailSubject("");
    setEmailBody("");
    addToast(`Email sent to ${activeLead.email}`, "success");
  };

  const handleBook = () => {
    if (!apptDate) { addToast("Date is required", "error"); return; }
    if (!apptTime) { addToast("Time is required", "error"); return; }
    if (!activeLead) return;
    setBookOpen(false);
    addToast(`Appointment booked with ${activeLead.name} on ${apptDate} at ${apptTime}`, "success");
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter((l) => l.status === "qualified" || l.status === "converted").length;
  const avgScore = leads.reduce((a, l) => a + l.score, 0) / leads.length;
  const newToday = leads.filter((l) => l.createdAt === "2025-07-14").length;

  return (
    <div className="p-6 space-y-6">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Lead Management</h1>
          <p className="text-slate-400 text-sm mt-1">AI-scored and prioritized lead pipeline</p>
        </div>
        <button
          onClick={() => { exportLeadsToCSV(leads); addToast("CSV export downloaded", "success"); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-sm"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: totalLeads, icon: <Users size={18} />, color: "violet" },
          { label: "New Today", value: newToday, icon: <TrendingUp size={18} />, color: "blue" },
          { label: "Qualified", value: qualifiedLeads, icon: <Target size={18} />, color: "emerald" },
          { label: "Avg Score", value: avgScore.toFixed(0), icon: <Clock size={18} />, color: "amber" },
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

      {/* Lead Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">All Leads</h2>
          <span className="text-xs text-slate-500">{leads.length} records</span>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-700/30 text-xs text-slate-500 font-medium">
          <div className="col-span-1" />
          <div className="col-span-3">Lead</div>
          <div className="col-span-2">Vertical / Source</div>
          <div className="col-span-1 text-center">Score</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Agent</div>
          <div className="col-span-1">Date</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-700/30">
          {leads.map((lead) => {
            const sc = statusConfig[lead.status];
            const isExpanded = expanded === lead.id;
            return (
              <div key={lead.id}>
                <div
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-700/20 cursor-pointer transition-colors items-center"
                  onClick={() => setExpanded(isExpanded ? null : lead.id)}
                >
                  <div className="col-span-1 text-slate-500">
                    {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </div>
                  <div className="col-span-3">
                    <div className="text-sm font-medium text-white">{lead.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{lead.id} · {lead.state}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-slate-300">{lead.vertical}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{lead.source}</div>
                  </div>
                  <div className={`col-span-1 text-center text-sm font-bold ${scoreColor(lead.score)}`}>
                    {lead.score}
                  </div>
                  <div className="col-span-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs border bg-${sc.color}-500/10 text-${sc.color}-400 border-${sc.color}-500/20`}>
                      {sc.label}
                    </span>
                  </div>
                  <div className="col-span-2 text-sm text-slate-400">{lead.agent}</div>
                  <div className="col-span-1 text-xs text-slate-500">{lead.createdAt}</div>
                </div>

                {/* Expanded Row */}
                {isExpanded && (
                  <div className="px-6 pb-5 bg-slate-900/30 border-t border-slate-700/30">
                    <div className="grid grid-cols-2 gap-6 pt-4">
                      {/* Lead Details */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact Info</h3>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex gap-2"><span className="text-slate-500 w-14">Phone</span><span className="text-slate-300">{lead.phone}</span></div>
                          <div className="flex gap-2"><span className="text-slate-500 w-14">Email</span><span className="text-slate-300">{lead.email}</span></div>
                          <div className="flex gap-2"><span className="text-slate-500 w-14">Age</span><span className="text-slate-300">{lead.age}</span></div>
                          <div className="flex gap-2"><span className="text-slate-500 w-14">State</span><span className="text-slate-300">{lead.state}</span></div>
                        </div>
                        {lead.notes && (
                          <div className="mt-3 p-3 rounded-lg bg-slate-800 border border-slate-700/50">
                            <p className="text-xs text-slate-400 leading-relaxed">{lead.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Actions</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); openAction(lead, "call"); }}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/30 transition-all text-sm"
                          >
                            <Phone size={15} /> Call Now
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openAction(lead, "sms"); }}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/20 hover:bg-blue-600/30 transition-all text-sm"
                          >
                            <MessageSquare size={15} /> Send SMS
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openAction(lead, "email"); }}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/20 hover:bg-violet-600/30 transition-all text-sm"
                          >
                            <Mail size={15} /> Send Email
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openAction(lead, "book"); }}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/20 hover:bg-amber-600/30 transition-all text-sm"
                          >
                            <CalendarClock size={15} /> Book Appt
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Call Modal ───────────────────────────────────────────────────────── */}
      <Modal open={callOpen} onClose={() => setCallOpen(false)} title="Initiate Call">
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800 border border-slate-700/50">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Phone size={22} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-white font-medium">{activeLead?.name}</div>
              <div className="text-slate-400 text-sm">{activeLead?.phone}</div>
              <div className="text-slate-500 text-xs mt-0.5">{activeLead?.vertical} · Score: {activeLead?.score}</div>
            </div>
          </div>
          {activeLead?.notes && (
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="text-xs text-slate-500 mb-1">Lead Notes</div>
              <p className="text-sm text-slate-300">{activeLead.notes}</p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button onClick={() => setCallOpen(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">Cancel</button>
            <button onClick={handleCall} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all">
              <Phone size={15} /> Call Now
            </button>
          </div>
        </div>
      </Modal>

      {/* ── SMS Modal ────────────────────────────────────────────────────────── */}
      <Modal open={smsOpen} onClose={() => setSmsOpen(false)} title="Send SMS">
        <div className="space-y-4">
          <div className="text-sm text-slate-400">
            To: <span className="text-white">{activeLead?.name}</span> · <span className="text-slate-300">{activeLead?.phone}</span>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Message <span className="text-red-400">*</span></label>
            <textarea
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              rows={4}
              maxLength={160}
              placeholder="Type your SMS message…"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
            <div className="text-right text-xs text-slate-500 mt-1">{smsText.length}/160</div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setSmsOpen(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">Cancel</button>
            <button onClick={handleSMS} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all">
              <MessageSquare size={15} /> Send SMS
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Email Modal ──────────────────────────────────────────────────────── */}
      <Modal open={emailOpen} onClose={() => setEmailOpen(false)} title="Send Email" width="max-w-xl">
        <div className="space-y-4">
          <div className="text-sm text-slate-400">
            To: <span className="text-white">{activeLead?.name}</span> · <span className="text-slate-300">{activeLead?.email}</span>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Subject <span className="text-red-400">*</span></label>
            <input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="e.g. Your Medicare Advantage Options for 2025"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Body <span className="text-red-400">*</span></label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={6}
              placeholder="Type your email message…"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setEmailOpen(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">Cancel</button>
            <button onClick={handleEmail} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all">
              <Mail size={15} /> Send Email
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Book Appointment Modal ───────────────────────────────────────────── */}
      <Modal open={bookOpen} onClose={() => setBookOpen(false)} title="Book Appointment">
        <div className="space-y-4">
          <div className="text-sm text-slate-400">
            With: <span className="text-white">{activeLead?.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Date <span className="text-red-400">*</span></label>
              <input
                type="date"
                value={apptDate}
                onChange={(e) => setApptDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Time <span className="text-red-400">*</span></label>
              <input
                type="time"
                value={apptTime}
                onChange={(e) => setApptTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setBookOpen(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">Cancel</button>
            <button onClick={handleBook} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-all">
              <CalendarClock size={15} /> Confirm Booking
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
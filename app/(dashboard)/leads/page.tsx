"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Users,
  Calendar,
  Target,
  Zap,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ChartTooltip } from "@/components/ui/ChartTooltip";
import { leads } from "@/lib/data";
import { scoreColor } from "@/lib/utils";

const sourceData = [
  { source: "Facebook",  count: 512, fill: "#6366f1" },
  { source: "Google",    count: 389, fill: "#3b82f6" },
  { source: "TikTok",    count: 218, fill: "#ec4899" },
  { source: "Email",     count: 167, fill: "#10b981" },
  { source: "Referral",  count: 94,  fill: "#f59e0b" },
  { source: "LinkedIn",  count: 64,  fill: "#06b6d4" },
];

const statusCounts = [
  { status: "New Lead",        count: 312, color: "#6366f1" },
  { status: "In Sequence",     count: 489, color: "#3b82f6" },
  { status: "Nurture",         count: 298, color: "#f59e0b" },
  { status: "Appointment Set", count: 89,  color: "#10b981" },
  { status: "Closed Won",      count: 156, color: "#34d399" },
  { status: "Disqualified",    count: 100, color: "#ef4444" },
];

type SortKey = "score" | "name" | "created";

function intentColor(intent: string): "emerald" | "amber" | "slate" {
  if (intent === "Very High" || intent === "High") return "emerald";
  if (intent === "Medium") return "amber";
  return "slate";
}

function verticalColor(vertical: string): "blue" | "purple" | "amber" | "slate" {
  if (vertical === "Medicare")      return "blue";
  if (vertical === "Legal")         return "purple";
  if (vertical === "Insurance" || vertical === "Auto") return "amber";
  return "slate";
}

export default function LeadsPage() {
  const [search, setSearch]           = useState("");
  const [verticalFilter, setVertical] = useState("All");
  const [statusFilter, setStatus]     = useState("All");
  const [sortKey, setSortKey]         = useState<SortKey>("score");
  const [sortDir, setSortDir]         = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded]       = useState<number | null>(null);

  const verticals = ["All", ...Array.from(new Set(leads.map((l) => l.vertical)))];
  const statuses  = ["All", ...Array.from(new Set(leads.map((l) => l.status)))];

  const filtered = useMemo(() => {
    return leads
      .filter((l) => {
        const s = search.toLowerCase();
        const matchSearch =
          l.name.toLowerCase().includes(s) ||
          l.vertical.toLowerCase().includes(s) ||
          l.status.toLowerCase().includes(s) ||
          l.source.toLowerCase().includes(s);
        const matchV = verticalFilter === "All" || l.vertical === verticalFilter;
        const matchS = statusFilter  === "All" || l.status   === statusFilter;
        return matchSearch && matchV && matchS;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === "score") cmp = a.score - b.score;
        if (sortKey === "name")  cmp = a.name.localeCompare(b.name);
        if (sortKey === "created") cmp = 0; // kept in insert order
        return sortDir === "desc" ? -cmp : cmp;
      });
  }, [search, verticalFilter, statusFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <Minus size={10} className="text-slate-600" />;
    return sortDir === "desc"
      ? <ArrowDownRight size={10} className="text-emerald-400" />
      : <ArrowUpRight   size={10} className="text-emerald-400" />;
  }

  return (
    <>
      <TopBar
        title="Lead Pipeline"
        subtitle={`${leads.length} total · ${leads.filter((l) => l.score >= 90).length} hot`}
      />
      <div className="p-6 space-y-6">

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Leads"
            value="1,444"
            sub="+204 this week"
            trend="up"
            icon={Users}
            color="#10b981"
          />
          <MetricCard
            label="Appointments Set"
            value="89"
            sub="6.2% conv. rate"
            trend="up"
            icon={Calendar}
            color="#6366f1"
          />
          <MetricCard
            label="Avg Lead Score"
            value="72.4"
            sub="+3.1 this week"
            trend="up"
            icon={Target}
            color="#f59e0b"
          />
          <MetricCard
            label="Hot Leads (90+)"
            value="124"
            sub="8.6% of pipeline"
            icon={Zap}
            color="#ec4899"
          />
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-white mb-4">
              Leads by Source
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={sourceData}
                layout="vertical"
                barSize={16}
                margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="source"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Leads" radius={[0, 4, 4, 0]}>
                  {sourceData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-white mb-4">
              Pipeline by Status
            </h3>
            <div className="space-y-2.5">
              {statusCounts.map((s) => {
                const total = statusCounts.reduce((a, b) => a + b.count, 0);
                const pct   = Math.round((s.count / total) * 100);
                return (
                  <div key={s.status}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300">{s.status}</span>
                      <span className="text-slate-400">
                        {s.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%`, background: s.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ── Lead Table ── */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-semibold text-white">All Leads</h3>
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-2.5 top-2.5 text-slate-500"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg pl-7 pr-3 py-2 w-36 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              {/* Vertical filter */}
              <div className="relative">
                <select
                  value={verticalFilter}
                  onChange={(e) => setVertical(e.target.value)}
                  className="appearance-none bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg pl-3 pr-7 py-2 focus:outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
                >
                  {verticals.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
                <ChevronDown
                  size={11}
                  className="absolute right-2 top-2.5 text-slate-500 pointer-events-none"
                />
              </div>
              {/* Status filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatus(e.target.value)}
                  className="appearance-none bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg pl-3 pr-7 py-2 focus:outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
                >
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown
                  size={11}
                  className="absolute right-2 top-2.5 text-slate-500 pointer-events-none"
                />
              </div>
              <button className="border border-slate-700 text-slate-400 text-xs px-3 py-2 rounded-lg flex items-center gap-1 hover:border-slate-500 transition-colors">
                <Filter size={12} />
                More
              </button>
            </div>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-3 px-3 pb-2 border-b border-slate-800 text-xs text-slate-500">
            <div className="w-8 shrink-0" />
            <button
              className="flex-1 text-left flex items-center gap-1 hover:text-slate-300 transition-colors"
              onClick={() => toggleSort("name")}
            >
              Name <SortIcon col="name" />
            </button>
            <button
              className="w-10 text-center flex items-center justify-center gap-1 hover:text-slate-300 transition-colors shrink-0"
              onClick={() => toggleSort("score")}
            >
              Score <SortIcon col="score" />
            </button>
            <span className="hidden sm:block w-24 shrink-0">Vertical</span>
            <span className="hidden md:block w-20 shrink-0">Intent</span>
            <span className="hidden lg:block w-28 shrink-0">Status</span>
            <span className="hidden sm:block w-20 shrink-0">Source</span>
            <span className="w-24 shrink-0">Action</span>
          </div>

          {/* Rows */}
          <div className="space-y-0.5 mt-1">
            {filtered.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-10">
                No leads match your filters.
              </div>
            )}
            {filtered.map((l) => (
              <div key={l.id}>
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-900/50 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                  onClick={() => setExpanded(expanded === l.id ? null : l.id)}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0 select-none">
                    {l.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>

                  {/* Name + phone */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {l.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {l.phone} · {l.created}
                    </div>
                  </div>

                  {/* Score ring */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border-2 shrink-0"
                    style={{
                      borderColor: scoreColor(l.score),
                      color: scoreColor(l.score),
                    }}
                  >
                    {l.score}
                  </div>

                  {/* Vertical */}
                  <div className="hidden sm:block w-24 shrink-0">
                    <Badge color={verticalColor(l.vertical)}>
                      {l.vertical}
                    </Badge>
                  </div>

                  {/* Intent */}
                  <div className="hidden md:block w-20 shrink-0">
                    <Badge color={intentColor(l.intent)}>{l.intent}</Badge>
                  </div>

                  {/* Status */}
                  <div className="hidden lg:block w-28 shrink-0 text-xs text-slate-400 truncate">
                    {l.status}
                  </div>

                  {/* Source */}
                  <div className="hidden sm:block w-20 shrink-0 text-xs text-slate-500 truncate">
                    {l.source}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="w-24 shrink-0 bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/40 border border-slate-700 text-slate-300 text-xs px-2 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all text-center"
                  >
                    {l.action}
                  </button>
                </div>

                {/* Expanded detail */}
                {expanded === l.id && (
                  <div className="mx-2 mb-2 p-4 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      {[
                        ["Email",    l.email],
                        ["Vertical", l.vertical],
                        ["Source",   l.source],
                        ["Status",   l.status],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <div className="text-xs text-slate-500 mb-0.5">{k}</div>
                          <div className="text-xs text-white font-medium">{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Intent signals */}
                    <div className="mb-4">
                      <div className="text-xs text-slate-500 mb-2">
                        Intent Signals
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {l.signals.map((s, i) => (
                          <span
                            key={i}
                            className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex flex-wrap gap-2">
                      <button className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors">
                        <Phone size={11} />Call Now
                      </button>
                      <button className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors">
                        <MessageSquare size={11} />Send SMS
                      </button>
                      <button className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors">
                        <Mail size={11} />Send Email
                      </button>
                      <button className="flex items-center gap-1.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg transition-colors">
                        <Calendar size={11} />Book Appointment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filtered.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {filtered.length} of {leads.length} leads
              </span>
              <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Export CSV →
              </button>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

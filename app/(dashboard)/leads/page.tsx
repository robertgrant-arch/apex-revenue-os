"use client";
import { useState } from "react";
import { Search, ChevronUp, ChevronDown, X } from "lucide-react";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

const LEADS = [
  { id: 1, name: "Margaret Chen", email: "m.chen@email.com", phone: "(555) 201-4421", vertical: "Medicare", status: "hot", score: 94, value: 3200, agent: "ORACLE", source: "Facebook", created: "Mar 28", location: "Phoenix, AZ", notes: "Interested in Medicare Supplement Plan G. Turning 65 in June. High intent." },
  { id: 2, name: "Robert Williams", email: "rwilliams@gmail.com", phone: "(555) 384-9021", vertical: "Auto", status: "warm", score: 82, value: 1800, agent: "SIGNAL", source: "Google", created: "Mar 27", location: "Dallas, TX", notes: "Comparing rates for 2 vehicles. Currently with State Farm." },
  { id: 3, name: "Patricia Davis", email: "pdavis@outlook.com", phone: "(555) 112-7744", vertical: "Medicare", status: "hot", score: 91, value: 4100, agent: "ORACLE", source: "Referral", created: "Mar 27", location: "Tampa, FL", notes: "Referred by existing client. Very motivated. Prefers phone contact." },
  { id: 4, name: "James Thompson", email: "jthompson@yahoo.com", phone: "(555) 829-3301", vertical: "Home", status: "warm", score: 67, value: 2400, agent: "CONVERT", source: "Direct Mail", created: "Mar 26", location: "Atlanta, GA", notes: "New homeowner. Bundling opportunity with auto." },
  { id: 5, name: "Linda Garcia", email: "lgarcia@email.com", phone: "(555) 447-8812", vertical: "Life", status: "cold", score: 45, value: 1200, agent: "REACH", source: "Organic", created: "Mar 25", location: "Chicago, IL", notes: "Initial inquiry only. No follow-up response yet." },
  { id: 6, name: "Michael Brown", email: "mbrown@corp.com", phone: "(555) 993-2218", vertical: "Medicare", status: "hot", score: 88, value: 3900, agent: "ORACLE", source: "Facebook", created: "Mar 25", location: "Denver, CO", notes: "Aging-in. Very engaged with email sequence." },
  { id: 7, name: "Susan Martinez", email: "susan.m@email.com", phone: "(555) 674-0091", vertical: "Auto", status: "warm", score: 74, value: 1600, agent: "SIGNAL", source: "Google", created: "Mar 24", location: "Houston, TX", notes: "Multi-car household. Price sensitive." },
  { id: 8, name: "David Lee", email: "dlee@gmail.com", phone: "(555) 231-5588", vertical: "Life", status: "hot", score: 87, value: 5200, agent: "CONVERT", source: "Referral", created: "Mar 23", location: "Seattle, WA", notes: "Business owner seeking key-man coverage. High LTV." },
  { id: 9, name: "Barbara Wilson", email: "bwilson@net.com", phone: "(555) 908-3312", vertical: "Medicare", status: "cold", score: 38, value: 900, agent: "ORACLE", source: "Direct Mail", created: "Mar 22", location: "Miami, FL", notes: "Received mailer. Called in but hesitant. Follow-up in 30 days." },
  { id: 10, name: "Thomas Anderson", email: "tanderson@isp.net", phone: "(555) 552-7761", vertical: "Home", status: "warm", score: 71, value: 2100, agent: "ARCHITECT", source: "Organic", created: "Mar 21", location: "Portland, OR", notes: "Inherited property. First-time homeowner insurance." },
];

type SortKey = "name" | "score" | "value" | "created";
type SortDir = "asc" | "desc";

const statusColors: Record<string, string> = {
  hot: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  warm: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  cold: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [verticalFilter, setVerticalFilter] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedLead, setSelectedLead] = useState<typeof LEADS[0] | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const filtered = LEADS
    .filter(l => {
      const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || l.status === statusFilter;
      const matchVertical = verticalFilter === "All" || l.vertical === verticalFilter;
      return matchSearch && matchStatus && matchVertical;
    })
    .sort((a, b) => {
      let av: string | number = a[sortKey];
      let bv: string | number = b[sortKey];
      if (sortKey === "value") { av = a.value; bv = b.value; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp className={cn("w-2.5 h-2.5", sortKey === col && sortDir === "asc" ? "text-emerald-400" : "text-slate-600")} />
      <ChevronDown className={cn("w-2.5 h-2.5 -mt-1", sortKey === col && sortDir === "desc" ? "text-emerald-400" : "text-slate-600")} />
    </span>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-slate-400 text-sm mt-0.5">{LEADS.length} total leads · {LEADS.filter(l => l.status === "hot").length} hot</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" />
        </div>
        <div className="flex gap-1">
          {["All", "hot", "warm", "cold"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-2.5 py-2 text-xs rounded-lg font-medium capitalize transition-all border", statusFilter === s ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:text-white")}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {["All", "Medicare", "Auto", "Life", "Home"].map(v => (
            <button key={v} onClick={() => setVerticalFilter(v)} className={cn("px-2.5 py-2 text-xs rounded-lg font-medium transition-all border", verticalFilter === v ? "bg-violet-500/20 text-violet-400 border-violet-500/30" : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:text-white")}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 cursor-pointer select-none" onClick={() => handleSort("name")}>Name <SortIcon col="name" /></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Vertical</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 cursor-pointer select-none" onClick={() => handleSort("score")}>Score <SortIcon col="score" /></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 cursor-pointer select-none" onClick={() => handleSort("value")}>Value <SortIcon col="value" /></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Agent</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Source</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 cursor-pointer select-none" onClick={() => handleSort("created")}>Created <SortIcon col="created" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filtered.map(lead => (
                <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="hover:bg-slate-700/20 transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <p className="text-sm text-white font-medium">{lead.name}</p>
                    <p className="text-xs text-slate-500">{lead.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">{lead.vertical}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize border", statusColors[lead.status])}>{lead.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-16 bg-slate-700 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", lead.score >= 85 ? "bg-emerald-500" : lead.score >= 65 ? "bg-amber-500" : "bg-slate-500")} style={{ width: `${lead.score}%` }} />
                      </div>
                      <span className={cn("text-sm font-bold", lead.score >= 85 ? "text-emerald-400" : lead.score >= 65 ? "text-amber-400" : "text-slate-400")}>{lead.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">${lead.value.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">{lead.agent}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">{lead.source}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{lead.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!selectedLead} onClose={() => setSelectedLead(null)} title="Lead Detail" size="lg">
        {selectedLead && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedLead.name}</h3>
                <p className="text-sm text-slate-400">{selectedLead.location}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium capitalize border", statusColors[selectedLead.status])}>{selectedLead.status}</span>
                <span className={cn("text-lg font-bold", selectedLead.score >= 85 ? "text-emerald-400" : selectedLead.score >= 65 ? "text-amber-400" : "text-slate-400")}>{selectedLead.score}/100</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Email", value: selectedLead.email },
                { label: "Phone", value: selectedLead.phone },
                { label: "Vertical", value: selectedLead.vertical },
                { label: "Source", value: selectedLead.source },
                { label: "Assigned Agent", value: selectedLead.agent },
                { label: "Est. Value", value: `$${selectedLead.value.toLocaleString()}` },
              ].map(f => (
                <div key={f.label} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                  <p className="text-xs text-slate-500 mb-0.5">{f.label}</p>
                  <p className="text-sm text-white font-medium">{f.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
              <p className="text-xs text-slate-500 mb-1">Notes</p>
              <p className="text-sm text-slate-300">{selectedLead.notes}</p>
            </div>
            <div className="flex gap-2 pt-1">
              <button className="flex-1 py-2 text-sm rounded-lg font-medium bg-emerald-500 hover:bg-emerald-400 text-white transition-colors">Assign to Agent</button>
              <button className="flex-1 py-2 text-sm rounded-lg font-medium border border-slate-700 text-slate-400 hover:text-white transition-colors">Send Email</button>
              <button onClick={() => setSelectedLead(null)} className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
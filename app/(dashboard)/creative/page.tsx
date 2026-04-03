"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  BarChart3,
  Layers,
  Image as ImageIcon,
  Video,
  Type,
  MoreVertical,
  ExternalLink,
  RefreshCcw,
  Zap
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";
import { useCreatives } from "@/lib/hooks";

// --- Local Types ---
type CreativeStatus = 'Active' | 'Draft' | 'Archived' | 'Paused';
type ComplianceStatus = 'Passed' | 'Pending' | 'Flagged' | 'Failed';

interface Creative {
  id: string;
  name: string;
  type: 'Image' | 'Video' | 'Copy';
  vertical: string;
  status: CreativeStatus;
  compliance: ComplianceStatus;
  thumbnail: string;
  predicted_ctr: number;
  actual_ctr?: number;
  spend: string;
  conversions: number;
  lastUpdated: string;
  compliance_notes?: string;
}

// --- Constants & Mapping ---
const statusBadge: Record<CreativeStatus, string> = {
  Active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  Archived: "bg-zinc-800 text-zinc-500 border-zinc-700",
  Paused: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

const complianceBadge: Record<ComplianceStatus, { color: string; icon: React.ReactNode }> = {
  Passed: { color: "text-emerald-500", icon: <CheckCircle2 className="w-3 h-3" /> },
  Pending: { color: "text-amber-500", icon: <Clock className="w-3 h-3" /> },
  Flagged: { color: "text-orange-500", icon: <AlertCircle className="w-3 h-3" /> },
  Failed: { color: "text-rose-500", icon: <XCircle className="w-3 h-3" /> },
};

const typeIconMap = {
  Image: <ImageIcon className="w-4 h-4" />,
  Video: <Video className="w-4 h-4" />,
  Copy: <Type className="w-4 h-4" />,
};

// --- Sub-components ---

const CreativeSkeleton = () => (
  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden animate-pulse">
    <div className="aspect-video bg-zinc-800" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-zinc-800 rounded w-3/4" />
      <div className="flex justify-between">
        <div className="h-3 bg-zinc-800 rounded w-1/4" />
        <div className="h-3 bg-zinc-800 rounded w-1/4" />
      </div>
      <div className="pt-2 flex gap-2">
        <div className="h-6 bg-zinc-800 rounded-full w-16" />
        <div className="h-6 bg-zinc-800 rounded-full w-16" />
      </div>
    </div>
  </div>
);

export default function CreativePage() {
  const { data, isLoading, isError, error, refetch } = useCreatives();
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVertical, setSelectedVertical] = useState("All");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Derive data from hook
  const creatives = useMemo(() => {
    const rawData = data?.creatives ?? data?.data ?? data ?? [];
    return Array.isArray(rawData) ? (rawData as Creative[]) : [];
  }, [data]);

  // Dynamic Vertical List
  const verticals = useMemo(() => {
    return ['All', ...Array.from(new Set(creatives.map(c => c.vertical).filter(Boolean)))];
  }, [creatives]);

  // CTR Chart Data
  const ctrData = useMemo(() => {
    return creatives
      .filter(c => c.actual_ctr != null)
      .map(c => ({
        name: c.name.split(' ').slice(0, 2).join(' '),
        predicted: c.predicted_ctr,
        actual: c.actual_ctr ?? 0
      }))
      .slice(0, 8); // Top 8 for visual clarity
  }, [creatives]);

  // Filtering Logic
  const filteredCreatives = useMemo(() => {
    return creatives.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVertical = selectedVertical === "All" || item.vertical === selectedVertical;
      const matchesTab = activeTab === "All" || item.status === activeTab;
      return matchesSearch && matchesVertical && matchesTab;
    });
  }, [creatives, searchQuery, selectedVertical, activeTab]);

  const selectedCreative = useMemo(() => 
    creatives.find(c => c.id === selectedId), [creatives, selectedId]
  );

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-full">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white">Failed to load creatives</h3>
          <p className="text-zinc-400 text-sm">{(error as any)?.message || "An unexpected error occurred."}</p>
        </div>
        <button 
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors border border-zinc-700"
        >
          <RefreshCcw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Creative Intelligence</h1>
          <p className="text-zinc-400 mt-1">Manage and optimize AI-generated revenue assets.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-all">
            <Filter className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4" />
            Generate New
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-white">CTR Performance: Predicted vs. Actual</h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-indigo-500/30 rounded-sm" />
                <span className="text-zinc-400">Predicted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-indigo-500 rounded-sm" />
                <span className="text-zinc-400">Actual</span>
              </div>
            </div>
          </div>
          <div className="h-[240px] w-full">
            {isLoading ? (
              <div className="w-full h-full bg-zinc-800/50 animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ctrData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 11 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 11 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#27272a' }}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                  />
                  <Bar dataKey="predicted" fill="#6366f1" fillOpacity={0.3} radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="actual" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">Compliance Health</h3>
            </div>
            <div className="space-y-4">
              {['Passed', 'Pending', 'Flagged'].map((status) => {
                const count = creatives.filter(c => c.compliance === status).length;
                const percentage = (count / (creatives.length || 1)) * 100;
                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">{status}</span>
                      <span className="text-white font-medium">{count} Assets</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          status === 'Passed' ? 'bg-emerald-500' : 
                          status === 'Pending' ? 'bg-amber-500' : 'bg-orange-500'
                        }`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button className="w-full mt-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-xl transition-colors border border-zinc-700">
            Run Batch Audit
          </button>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 gap-1">
              {['All', 'Active', 'Draft', 'Paused'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab 
                      ? "bg-zinc-800 text-white shadow-sm" 
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 grow md:grow-0">
              <div className="relative grow md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <select 
                value={selectedVertical}
                onChange={(e) => setSelectedVertical(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-sm text-zinc-200 focus:outline-none appearance-none cursor-pointer"
              >
                {verticals.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => <CreativeSkeleton key={i} />)
            ) : filteredCreatives.length > 0 ? (
              filteredCreatives.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`group relative bg-zinc-900/40 border transition-all duration-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-black/50 ${
                    selectedId === item.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-zinc-800'
                  }`}
                >
                  <div className="aspect-video relative overflow-hidden bg-zinc-950">
                    <img 
                      src={item.thumbnail} 
                      alt={item.name} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${statusBadge[item.status]}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] text-zinc-300 border border-white/10 flex items-center gap-1.5">
                        {typeIconMap[item.type]}
                        {item.type}
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-zinc-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-xs text-zinc-500 mt-1">{item.vertical}</p>
                      </div>
                      <button className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-zinc-800/50">
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Predicted CTR</p>
                        <p className="text-sm font-bold text-zinc-200">{item.predicted_ctr}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Actual CTR</p>
                        <p className={`text-sm font-bold ${item.actual_ctr && item.actual_ctr >= item.predicted_ctr ? 'text-emerald-500' : 'text-zinc-400'}`}>
                          {item.actual_ctr ? `${item.actual_ctr}%` : '--'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${complianceBadge[item.compliance].color}`}>
                        {complianceBadge[item.compliance].icon}
                        {item.compliance}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                        <Clock className="w-3 h-3" />
                        {item.lastUpdated}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
                <Layers className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-zinc-300 font-medium">No assets found</h3>
                <p className="text-zinc-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Detail Panel */}
        {selectedCreative && (
          <div className="w-full lg:w-96 space-y-6">
            <div className="sticky top-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white text-lg">Asset Insights</h3>
                  <button onClick={() => setSelectedId(null)} className="text-zinc-500 hover:text-white">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="aspect-square rounded-2xl overflow-hidden mb-6 bg-zinc-950 border border-zinc-800">
                  <img src={selectedCreative.thumbnail} className="w-full h-full object-contain" alt="Preview" />
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">{selectedCreative.name}</h2>
                    <ExternalLink className="w-4 h-4 text-zinc-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Spend</p>
                      <p className="text-lg font-bold text-white">{selectedCreative.spend}</p>
                    </div>
                    <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Conversions</p>
                      <p className="text-lg font-bold text-white">{selectedCreative.conversions}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-zinc-300">Compliance Audit</h4>
                    <div className={`p-4 rounded-2xl border ${
                      selectedCreative.compliance === 'Passed' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'
                    }`}>
                      <p className="text-xs leading-relaxed text-zinc-400 italic">
                        {selectedCreative.compliance_notes || "All revenue triggers and brand guidelines have been met for this asset."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
                      Optimize Asset
                    </button>
                    <button className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl border border-zinc-700">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// app/(dashboard)/leads/page.tsx
"use client";

import { useState, useCallback } from "react";
import {
  useLeads,
  useDeleteLead,
  useUpdateLead,
  type LeadParams,
} from "@/lib/hooks";
import Card from "@/components/ui/Card";
import StatusDot from "@/components/ui/StatusDot";
import TopBar from "@/components/layout/TopBar";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-800 ${className}`} />
  );
}

function LeadRowSkeleton() {
  return (
    <tr className="border-b border-slate-800/50">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-9 w-9 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <SkeletonBlock className="h-3.5 w-28" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <SkeletonBlock className="h-3.5 w-20" />
      </td>
      <td className="px-4 py-3.5">
        <SkeletonBlock className="h-5 w-28 rounded-full" />
      </td>
      <td className="px-4 py-3.5">
        <SkeletonBlock className="h-5 w-16 rounded" />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-1.5 w-16 rounded-full" />
          <SkeletonBlock className="h-3 w-6" />
        </div>
      </td>
      <td className="px-4 py-3.5">
        <SkeletonBlock className="h-3.5 w-20" />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1">
          <SkeletonBlock className="h-7 w-7 rounded-md" />
          <SkeletonBlock className="h-7 w-7 rounded-md" />
        </div>
      </td>
    </tr>
  );
}

const STATUSES = [
  "ALL",
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "APPOINTMENT_SET",
  "PROPOSAL_SENT",
  "WON",
  "LOST",
  "DISQUALIFIED",
];

const VERTICALS = ["ALL", "SOLAR", "INSURANCE", "MORTGAGE", "LEGAL"];

const statusStyles: Record<string, string> = {
  NEW: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  CONTACTED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  QUALIFIED: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  APPOINTMENT_SET: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  PROPOSAL_SENT: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  WON: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  LOST: "bg-red-500/20 text-red-300 border-red-500/30",
  DISQUALIFIED: "bg-slate-700/40 text-slate-500 border-slate-600/30",
};

const verticalColors: Record<string, string> = {
  SOLAR: "bg-amber-500/20 text-amber-300",
  INSURANCE: "bg-blue-500/20 text-blue-300",
  MORTGAGE: "bg-emerald-500/20 text-emerald-300",
  LEGAL: "bg-violet-500/20 text-violet-300",
};

const avatarPalette = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-pink-500",
];

function getAvatarColor(id: string): string {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return avatarPalette[sum % avatarPalette.length];
}

function getInitials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function SortIcon({
  field,
  sortBy,
  sortOrder,
}: {
  field: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) {
  if (sortBy !== field) {
    return (
      <svg
        className="w-3.5 h-3.5 text-slate-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    );
  }
  return sortOrder === "desc" ? (
    <svg
      className="w-3.5 h-3.5 text-violet-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  ) : (
    <svg
      className="w-3.5 h-3.5 text-violet-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15l7-7 7 7"
      />
    </svg>
  );
}

const QUICK_STATUSES = [
  "CONTACTED",
  "QUALIFIED",
  "APPOINTMENT_SET",
  "PROPOSAL_SENT",
  "WON",
  "DISQUALIFIED",
];

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<ReturnType
    typeof setTimeout
  > | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [verticalFilter, setVerticalFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      if (debounceTimer) clearTimeout(debounceTimer);
      const t = setTimeout(() => {
        setDebouncedSearch(value);
        setPage(1);
      }, 400);
      setDebounceTimer(t);
    },
    [debounceTimer]
  );

  const params: LeadParams = {
    page,
    limit: 20,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter !== "ALL" && { status: statusFilter }),
    ...(verticalFilter !== "ALL" && { vertical: verticalFilter }),
    sortBy,
    sortOrder,
  };

  const { data, isLoading, isError, error } = useLeads(params);
  const deleteMutation = useDeleteLead();
  const updateMutation = useUpdateLead();

  const leads: any[] = data?.leads ?? data?.data ?? [];
  const total: number = data?.total ?? data?.pagination?.total ?? 0;
  const totalPages: number =
    data?.totalPages ?? data?.pagination?.totalPages ?? 1;

  const handleSort = useCallback(
    (field: string) => {
      if (sortBy === field) {
        setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(field);
        setSortOrder("desc");
      }
      setPage(1);
    },
    [sortBy]
  );

  const handleStatusFilter = (s: string) => {
    setStatusFilter(s);
    setPage(1);
  };

  const handleVerticalFilter = (v: string) => {
    setVerticalFilter(v);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("ALL");
    setVerticalFilter("ALL");
    setPage(1);
  };

  const hasFilters =
    search || statusFilter !== "ALL" || verticalFilter !== "ALL";

  const columns: { label: string; field: string; sortable: boolean }[] = [
    { label: "Lead", field: "lastName", sortable: true },
    { label: "Source", field: "source", sortable: false },
    { label: "Status", field: "status", sortable: true },
    { label: "Vertical", field: "vertical", sortable: true },
    { label: "Score", field: "score", sortable: true },
    { label: "Created", field: "createdAt", sortable: true },
    { label: "", field: "", sortable: false },
  ];

  const paginationStart = Math.max(
    1,
    Math.min(page - 2, totalPages - 4)
  );
  const paginationPages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => paginationStart + i
  ).filter((p) => p >= 1 && p <= totalPages);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <TopBar title="Leads" />

      <main className="flex-1 p-6 space-y-5">
        {/* ── Toolbar ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, phone…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-lg pl-9 pr-8 py-2 text-sm outline-none focus:border-violet-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Vertical filter */}
            <select
              value={verticalFilter}
              onChange={(e) => handleVerticalFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500 transition-colors"
            >
              {VERTICALS.map((v) => (
                <option key={v} value={v}>
                  {v === "ALL" ? "All Verticals" : v}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500 transition-colors"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Statuses" : s.replace(/_/g, " ")}
                </option>
              ))}
            </select>

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}

            {/* Total count */}
            {!isLoading && !isError && (
              <span className="text-xs text-slate-500">
                {total.toLocaleString()} lead{total !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* ── Error ────────────────────────────────────────────────── */}
        {isError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
            <svg
              className="w-8 h-8 text-red-400 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-400 font-medium text-sm">
              Failed to load leads
            </p>
            <p className="text-slate-500 text-xs mt-1">
              {(error as Error)?.message ?? "An unexpected error occurred"}
            </p>
          </div>
        )}

        {/* ── Table ────────────────────────────────────────────────── */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {columns.map(({ label, field, sortable }) => (
                    <th
                      key={`${label}-${field}`}
                      className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {sortable && field ? (
                        <button
                          onClick={() => handleSort(field)}
                          className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
                        >
                          {label}
                          <SortIcon
                            field={field}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                          />
                        </button>
                      ) : (
                        label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <LeadRowSkeleton key={i} />
                  ))
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg
                          className="w-12 h-12 text-slate-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <p className="text-slate-500 text-sm">No leads found</p>
                        {hasFilters && (
                          <button
                            onClick={clearFilters}
                            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                          >
                            Clear filters to see all leads
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead: any) => {
                    const scoreVal = lead.score ?? 0;
                    const scoreColor =
                      scoreVal >= 80
                        ? "bg-emerald-500"
                        : scoreVal >= 60
                        ? "bg-amber-500"
                        : "bg-red-500";

                    return (
                      <tr
                        key={lead.id}
                        className="border-b border-slate-800/50 hover:bg-slate-900/60 transition-colors"
                      >
                        {/* Name + contact */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-9 w-9 rounded-full ${getAvatarColor(
                                lead.id
                              )} flex items-center justify-center text-white text-xs font-semibold shrink-0`}
                            >
                              {getInitials(lead.firstName, lead.lastName)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-medium leading-tight truncate">
                                {lead.firstName} {lead.lastName}
                              </p>
                              <p className="text-slate-500 text-xs mt-0.5 truncate">
                                {lead.email ?? lead.phone ?? "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Source */}
                        <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                          {lead.source?.replace(/_/g, " ") ?? "—"}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
                              statusStyles[lead.status] ??
                              "bg-slate-700 text-slate-300 border-slate-600"
                            }`}
                          >
                            <StatusDot status={lead.status} />
                            {lead.status?.replace(/_/g, " ") ?? "—"}
                          </span>
                        </td>

                        {/* Vertical */}
                        <td className="px-4 py-3.5">
                          {lead.vertical ? (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                verticalColors[lead.vertical] ??
                                "bg-slate-700 text-slate-300"
                              }`}
                            >
                              {lead.vertical}
                            </span>
                          ) : (
                            <span className="text-slate-600 text-xs">—</span>
                          )}
                        </td>

                        {/* Score */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-slate-800 overflow-hidden shrink-0">
                              <div
                                className={`h-full rounded-full transition-all ${scoreColor}`}
                                style={{ width: `${scoreVal}%` }}
                              />
                            </div>
                            <span className="text-slate-400 text-xs font-mono w-6 text-right">
                              {scoreVal}
                            </span>
                          </div>
                        </td>

                        {/* Created */}
                        <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                          {lead.createdAt
                            ? new Date(lead.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "2-digit",
                                }
                              )
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedLead(lead);
                                setShowDetail(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                              title="View details"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Delete ${lead.firstName} ${lead.lastName}? This cannot be undone.`
                                  )
                                ) {
                                  deleteMutation.mutate(lead.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Delete lead"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ─────────────────────────────────────────── */}
          {!isLoading && !isError && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
              <p className="text-xs text-slate-500">
                Page {page} of {totalPages} &middot;{" "}
                {total.toLocaleString()} total
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                {paginationPages.map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 text-xs rounded-md transition-colors ${
                      pg === page
                        ? "bg-violet-600 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      </main>

      {/* ── Detail Drawer ─────────────────────────────────────────── */}
      {showDetail && selectedLead && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDetail(false)}
          />

          {/* Panel */}
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
            {/* Panel header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <h2 className="text-base font-semibold text-white">
                Lead Details
              </h2>
              <button
                onClick={() => setShowDetail(false)}
                className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div
                  className={`h-14 w-14 rounded-full ${getAvatarColor(
                    selectedLead.id
                  )} flex items-center justify-center text-white font-bold text-xl shrink-0`}
                >
                  {getInitials(
                    selectedLead.firstName,
                    selectedLead.lastName
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-lg leading-tight">
                    {selectedLead.firstName} {selectedLead.lastName}
                  </h3>
                  {selectedLead.company && (
                    <p className="text-slate-400 text-sm mt-0.5">
                      {selectedLead.company}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
                        statusStyles[selectedLead.status] ??
                        "bg-slate-700 text-slate-300 border-slate-600"
                      }`}
                    >
                      <StatusDot status={selectedLead.status} />
                      {selectedLead.status?.replace(/_/g, " ") ?? "—"}
                    </span>
                    {selectedLead.vertical && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          verticalColors[selectedLead.vertical] ??
                          "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {selectedLead.vertical}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Score bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">
                    Lead Score
                  </span>
                  <span
                    className={`text-sm font-semibold font-mono ${
                      (selectedLead.score ?? 0) >= 80
                        ? "text-emerald-400"
                        : (selectedLead.score ?? 0) >= 60
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {selectedLead.score ?? 0} / 100
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      (selectedLead.score ?? 0) >= 80
                        ? "bg-emerald-500"
                        : (selectedLead.score ?? 0) >= 60
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${selectedLead.score ?? 0}%` }}
                  />
                </div>
              </div>

              {/* Contact info */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Contact Information
                </h4>
                <div className="space-y-2.5">
                  {[
                    {
                      label: "Email",
                      value: selectedLead.email,
                      icon: (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      ),
                    },
                    {
                      label: "Phone",
                      value: selectedLead.phone,
                      icon: (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      ),
                    },
                  ].map(({ label, value, icon }) =>
                    value ? (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-slate-600 shrink-0">{icon}</span>
                        <div>
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className="text-slate-200 text-sm">{value}</p>
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              </div>

              {/* Lead details */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Lead Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Source",
                      value: selectedLead.source?.replace(/_/g, " "),
                    },
                    { label: "Vertical", value: selectedLead.vertical },
                    {
                      label: "Created",
                      value: selectedLead.createdAt
                        ? new Date(selectedLead.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : null,
                    },
                    {
                      label: "Updated",
                      value: selectedLead.updatedAt
                        ? new Date(selectedLead.updatedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : null,
                    },
                  ].map(({ label, value }) =>
                    value ? (
                      <div
                        key={label}
                        className="rounded-lg bg-slate-800/60 px-3 py-2.5"
                      >
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className="text-slate-200 text-sm font-medium mt-0.5">
                          {value}
                        </p>
                      </div>
                    ) : null
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedLead.notes && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Notes
                  </h4>
                  <div className="rounded-lg bg-slate-800/40 border border-slate-800 px-4 py-3">
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {selectedLead.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Quick status update */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Update Status
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_STATUSES.map((s) => {
                    const isActive = selectedLead.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => {
                          if (!isActive) {
                            updateMutation.mutate(
                              { id: selectedLead.id, status: s },
                              {
                                onSuccess: () => {
                                  setSelectedLead((prev: any) =>
                                    prev ? { ...prev, status: s } : prev
                                  );
                                },
                              }
                            );
                          }
                        }}
                        disabled={updateMutation.isPending || isActive}
                        className={`px-3 py-2 text-xs rounded-lg border transition-colors disabled:cursor-not-allowed ${
                          isActive
                            ? "bg-violet-600 border-violet-500 text-white opacity-100"
                            : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white disabled:opacity-40"
                        }`}
                      >
                        {updateMutation.isPending && !isActive ? (
                          <span className="flex items-center justify-center gap-1">
                            <svg
                              className="w-3 h-3 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                            {s.replace(/_/g, " ")}
                          </span>
                        ) : (
                          s.replace(/_/g, " ")
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Danger zone */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `Permanently delete ${selectedLead.firstName} ${selectedLead.lastName}? This cannot be undone.`
                      )
                    ) {
                      deleteMutation.mutate(selectedLead.id, {
                        onSuccess: () => setShowDetail(false),
                      });
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deleteMutation.isPending ? (
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                  Delete Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// lib/store.ts
"use client";

const STORE_EVENT = "apex-store-update";

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(STORE_EVENT));
  }
}

function getCollection<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function setCollection<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
  emit();
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vertical: string;
  score: number;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  value: number;
  agent: string;
  source: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  vertical: string;
  status: "active" | "paused" | "draft" | "completed";
  spend: number;
  pipeline: number;
  leads: number;
  cpl: number;
  roas: number;
  agent: string;
  start: string;
  end: string;
  createdAt: string;
}

export interface Creative {
  id: string;
  name: string;
  type: "email" | "sms" | "ad" | "landing" | "script";
  status: "draft" | "active" | "archived";
  vertical: string;
  campaign: string;
  content: string;
  createdAt: string;
}

export interface AgentLog {
  id: string;
  agentId: string;
  action: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
}

export interface ComplianceCheck {
  id: string;
  content: string;
  status: "pass" | "fail" | "warning";
  score: number;
  issues: string[];
  checkedAt: string;
}

export type SettingKey =
  | "openai_api_key"
  | "company_name"
  | "default_vertical"
  | "notif_email"
  | "notif_slack"
  | "notif_sms";

// ─── LEADS ───────────────────────────────────────────────────────────────────

const LEADS_KEY = "apex_leads";

export const leadsStore = {
  getAll: (): Lead[] => getCollection<Lead>(LEADS_KEY),
  getById: (id: string): Lead | undefined =>
    getCollection<Lead>(LEADS_KEY).find((l) => l.id === id),
  create: (data: Omit<Lead, "id" | "createdAt">): Lead => {
    const leads = getCollection<Lead>(LEADS_KEY);
    const item: Lead = { ...data, id: uid(), createdAt: new Date().toISOString() };
    setCollection(LEADS_KEY, [...leads, item]);
    return item;
  },
  update: (id: string, data: Partial<Lead>): Lead | null => {
    const leads = getCollection<Lead>(LEADS_KEY);
    const idx = leads.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    leads[idx] = { ...leads[idx], ...data };
    setCollection(LEADS_KEY, leads);
    return leads[idx];
  },
  delete: (id: string) => {
    const leads = getCollection<Lead>(LEADS_KEY).filter((l) => l.id !== id);
    setCollection(LEADS_KEY, leads);
  },
};

// ─── CAMPAIGNS ───────────────────────────────────────────────────────────────

const CAMPAIGNS_KEY = "apex_campaigns";

export const campaignsStore = {
  getAll: (): Campaign[] => getCollection<Campaign>(CAMPAIGNS_KEY),
  getById: (id: string): Campaign | undefined =>
    getCollection<Campaign>(CAMPAIGNS_KEY).find((c) => c.id === id),
  create: (data: Omit<Campaign, "id" | "createdAt">): Campaign => {
    const campaigns = getCollection<Campaign>(CAMPAIGNS_KEY);
    const item: Campaign = { ...data, id: uid(), createdAt: new Date().toISOString() };
    setCollection(CAMPAIGNS_KEY, [...campaigns, item]);
    return item;
  },
  update: (id: string, data: Partial<Campaign>): Campaign | null => {
    const campaigns = getCollection<Campaign>(CAMPAIGNS_KEY);
    const idx = campaigns.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    campaigns[idx] = { ...campaigns[idx], ...data };
    setCollection(CAMPAIGNS_KEY, campaigns);
    return campaigns[idx];
  },
  delete: (id: string) => {
    const campaigns = getCollection<Campaign>(CAMPAIGNS_KEY).filter((c) => c.id !== id);
    setCollection(CAMPAIGNS_KEY, campaigns);
  },
};

// ─── CREATIVES ────────────────────────────────────────────────────────────────

const CREATIVES_KEY = "apex_creatives";

export const creativesStore = {
  getAll: (): Creative[] => getCollection<Creative>(CREATIVES_KEY),
  getById: (id: string): Creative | undefined =>
    getCollection<Creative>(CREATIVES_KEY).find((c) => c.id === id),
  create: (data: Omit<Creative, "id" | "createdAt">): Creative => {
    const creatives = getCollection<Creative>(CREATIVES_KEY);
    const item: Creative = { ...data, id: uid(), createdAt: new Date().toISOString() };
    setCollection(CREATIVES_KEY, [...creatives, item]);
    return item;
  },
  update: (id: string, data: Partial<Creative>): Creative | null => {
    const creatives = getCollection<Creative>(CREATIVES_KEY);
    const idx = creatives.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    creatives[idx] = { ...creatives[idx], ...data };
    setCollection(CREATIVES_KEY, creatives);
    return creatives[idx];
  },
  delete: (id: string) => {
    const creatives = getCollection<Creative>(CREATIVES_KEY).filter((c) => c.id !== id);
    setCollection(CREATIVES_KEY, creatives);
  },
};

// ─── AGENT LOGS ──────────────────────────────────────────────────────────────

const AGENT_LOGS_KEY = "apex_agent_logs";

export const agentLogsStore = {
  getAll: (): AgentLog[] => getCollection<AgentLog>(AGENT_LOGS_KEY),
  getById: (id: string): AgentLog | undefined =>
    getCollection<AgentLog>(AGENT_LOGS_KEY).find((l) => l.id === id),
  create: (data: Omit<AgentLog, "id" | "timestamp">): AgentLog => {
    const logs = getCollection<AgentLog>(AGENT_LOGS_KEY);
    const item: AgentLog = { ...data, id: uid(), timestamp: new Date().toISOString() };
    setCollection(AGENT_LOGS_KEY, [...logs, item]);
    return item;
  },
  update: (id: string, data: Partial<AgentLog>): AgentLog | null => {
    const logs = getCollection<AgentLog>(AGENT_LOGS_KEY);
    const idx = logs.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    logs[idx] = { ...logs[idx], ...data };
    setCollection(AGENT_LOGS_KEY, logs);
    return logs[idx];
  },
  delete: (id: string) => {
    const logs = getCollection<AgentLog>(AGENT_LOGS_KEY).filter((l) => l.id !== id);
    setCollection(AGENT_LOGS_KEY, logs);
  },
};

// ─── COMPLIANCE ───────────────────────────────────────────────────────────────

const COMPLIANCE_KEY = "apex_compliance";

export const complianceStore = {
  getAll: (): ComplianceCheck[] => getCollection<ComplianceCheck>(COMPLIANCE_KEY),
  getById: (id: string): ComplianceCheck | undefined =>
    getCollection<ComplianceCheck>(COMPLIANCE_KEY).find((c) => c.id === id),
  create: (data: Omit<ComplianceCheck, "id" | "checkedAt">): ComplianceCheck => {
    const checks = getCollection<ComplianceCheck>(COMPLIANCE_KEY);
    const item: ComplianceCheck = { ...data, id: uid(), checkedAt: new Date().toISOString() };
    setCollection(COMPLIANCE_KEY, [...checks, item]);
    return item;
  },
  update: (id: string, data: Partial<ComplianceCheck>): ComplianceCheck | null => {
    const checks = getCollection<ComplianceCheck>(COMPLIANCE_KEY);
    const idx = checks.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    checks[idx] = { ...checks[idx], ...data };
    setCollection(COMPLIANCE_KEY, checks);
    return checks[idx];
  },
  delete: (id: string) => {
    const checks = getCollection<ComplianceCheck>(COMPLIANCE_KEY).filter((c) => c.id !== id);
    setCollection(COMPLIANCE_KEY, checks);
  },
};

// ─── SETTINGS ────────────────────────────────────────────────────────────────

const SETTINGS_KEY = "apex_settings";

function getSettings(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
  } catch {
    return {};
  }
}

export const settingsStore = {
  get: (key: SettingKey): string => getSettings()[key] ?? "",
  set: (key: SettingKey, value: string) => {
    const s = getSettings();
    s[key] = value;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    emit();
  },
  getAll: (): Record<string, string> => getSettings(),
  clear: () => {
    localStorage.setItem(SETTINGS_KEY, "{}");
    emit();
  },
};

// ─── REACT HOOKS ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";

function useStoreCollection<T>(fetcher: () => T[]): T[] {
  const [data, setData] = useState<T[]>([]);

  const refresh = useCallback(() => setData(fetcher()), []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener(STORE_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(STORE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);

  return data;
}

export function useLeads(): Lead[] {
  return useStoreCollection(leadsStore.getAll);
}

export function useCampaigns(): Campaign[] {
  return useStoreCollection(campaignsStore.getAll);
}

export function useCreatives(): Creative[] {
  return useStoreCollection(creativesStore.getAll);
}

export function useAgentLogs(): AgentLog[] {
  return useStoreCollection(agentLogsStore.getAll);
}

export function useComplianceChecks(): ComplianceCheck[] {
  return useStoreCollection(complianceStore.getAll);
}

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  const refresh = useCallback(() => setSettings(settingsStore.getAll()), []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener(STORE_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(STORE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);

  const set = useCallback((key: SettingKey, value: string) => {
    settingsStore.set(key, value);
  }, []);

  return { settings, set };
}

// ─── DATA MANAGEMENT ─────────────────────────────────────────────────────────

export function exportAllData(): string {
  return JSON.stringify(
    {
      leads: leadsStore.getAll(),
      campaigns: campaignsStore.getAll(),
      creatives: creativesStore.getAll(),
      agentLogs: agentLogsStore.getAll(),
      complianceChecks: complianceStore.getAll(),
      settings: settingsStore.getAll(),
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
}

export function importAllData(json: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(json);
    if (data.leads) setCollection(LEADS_KEY, data.leads);
    if (data.campaigns) setCollection(CAMPAIGNS_KEY, data.campaigns);
    if (data.creatives) setCollection(CREATIVES_KEY, data.creatives);
    if (data.agentLogs) setCollection(AGENT_LOGS_KEY, data.agentLogs);
    if (data.complianceChecks) setCollection(COMPLIANCE_KEY, data.complianceChecks);
    if (data.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
    emit();
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export function clearAllData() {
  [LEADS_KEY, CAMPAIGNS_KEY, CREATIVES_KEY, AGENT_LOGS_KEY, COMPLIANCE_KEY, SETTINGS_KEY].forEach(
    (k) => localStorage.removeItem(k)
  );
  emit();
}

// Convenience aliases used by page components
export function getAll<T>(key: string): T[] {
  return getCollection<T>(key);
}

export function create<T extends { id?: string }>(key: string, item: Omit<T, 'id'>): T {
  const items = getCollection<T>(key);
  const newItem = { ...item, id: uid() } as T;
  setCollection(key, [...items, newItem]);
  return newItem;
}

export function update<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null {
  const items = getCollection<T>(key);
  const idx = items.findIndex((i: any) => i.id === id);
  if (idx === -1) return null;
  const updated = { ...items[idx], ...updates } as T;
  items[idx] = updated;
  setCollection(key, items);
  return updated;
}

export function remove(key: string, id: string): boolean {
  const items = getCollection<any>(key);
  const filtered = items.filter((i: any) => i.id !== id);
  if (filtered.length === items.length) return false;
  setCollection(key, filtered);
  return true;
}

export function getOne<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export function setOne(key: string, value: any): void {
  localStorage.setItem(key, JSON.stringify(value));
  emit();
}
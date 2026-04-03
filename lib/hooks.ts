import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "./api-client";

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const queryKeys = {
  dashboardStats: ["dashboard", "stats"] as const,
  leads: (params?: Record<string, unknown>) =>
    params ? (["leads", params] as const) : (["leads"] as const),
  lead: (id: string) => ["leads", id] as const,
  campaigns: (params?: Record<string, unknown>) =>
    params ? (["campaigns", params] as const) : (["campaigns"] as const),
  campaign: (id: string) => ["campaigns", id] as const,
  creatives: (params?: Record<string, unknown>) =>
    params ? (["creatives", params] as const) : (["creatives"] as const),
  agents: (params?: Record<string, unknown>) =>
    params ? (["agents", params] as const) : (["agents"] as const),
};

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface LeadParams extends PaginationParams {
  status?: string;
  vertical?: string;
  campaignId?: string;
  assignedTo?: string;
  score?: number;
}

export interface CampaignParams extends PaginationParams {
  status?: string;
  type?: string;
}

export interface CreativeParams extends PaginationParams {
  type?: string;
  status?: string;
  campaignId?: string;
}

export interface AgentParams extends PaginationParams {
  status?: string;
  type?: string;
}

export interface CreateLeadInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  vertical?: string;
  source?: string;
  status?: string;
  score?: number;
  notes?: string;
  campaignId?: string;
  assignedTo?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateLeadInput extends Partial<CreateLeadInput> {
  id: string;
}

export interface CreateCampaignInput {
  name: string;
  description?: string;
  type: string;
  status?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  targetVertical?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateCampaignInput extends Partial<CreateCampaignInput> {
  id: string;
}

export interface CreateAgentInput {
  name: string;
  type: string;
  description?: string;
  status?: string;
  config?: Record<string, unknown>;
  systemPrompt?: string;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export function useDashboardStats(
  options?: Omit<UseQueryOptions, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: () => apiClient.get("/api/dashboard/stats"),
    ...options,
  });
}

// ─── Leads ─────────────────────────────────────────────────────────────────────

export function useLeads(params?: LeadParams) {
  return useQuery({
    queryKey: queryKeys.leads(params as Record<string, unknown>),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.set(key, String(value));
          }
        });
      }
      const query = searchParams.toString();
      return apiClient.get(`/api/leads${query ? `?${query}` : ""}`);
    },
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: queryKeys.lead(id),
    queryFn: () => apiClient.get(`/api/leads/${id}`),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeadInput) => apiClient.post("/api/leads", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboardStats });
      toast.success("Lead created successfully");
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to create lead");
    },
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateLeadInput) =>
      apiClient.patch(`/api/leads/${id}`, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: queryKeys.lead(variables.id) });
      qc.invalidateQueries({ queryKey: queryKeys.dashboardStats });
      toast.success("Lead updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to update lead");
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.del(`/api/leads/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboardStats });
      toast.success("Lead deleted successfully");
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to delete lead");
    },
  });
}

// ─── Campaigns ─────────────────────────────────────────────────────────────────

export function useCampaigns(params?: CampaignParams) {
  return useQuery({
    queryKey: queryKeys.campaigns(params as Record<string, unknown>),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.set(key, String(value));
          }
        });
      }
      const query = searchParams.toString();
      return apiClient.get(`/api/campaigns${query ? `?${query}` : ""}`);
    },
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: queryKeys.campaign(id),
    queryFn: () => apiClient.get(`/api/campaigns/${id}`),
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCampaignInput) =>
      apiClient.post("/api/campaigns", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboardStats });
      toast.success("Campaign created successfully");
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to create campaign");
    },
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateCampaignInput) =>
      apiClient.patch(`/api/campaigns/${id}`, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: queryKeys.campaign(variables.id) });
      toast.success("Campaign updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to update campaign");
    },
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.del(`/api/campaigns/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboardStats });
      toast.success("Campaign deleted successfully");
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to delete campaign");
    },
  });
}

// ─── Creatives ─────────────────────────────────────────────────────────────────

export function useCreatives(params?: CreativeParams) {
  return useQuery({
    queryKey: queryKeys.creatives(params as Record<string, unknown>),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.set(key, String(value));
          }
        });
      }
      const query = searchParams.toString();
      return apiClient.get(`/api/creatives${query ? `?${query}` : ""}`);
    },
  });
}

// ─── Agents ────────────────────────────────────────────────────────────────────

export function useAgents(params?: AgentParams) {
  return useQuery({
    queryKey: queryKeys.agents(params as Record<string, unknown>),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.set(key, String(value));
          }
        });
      }
      const query = searchParams.toString();
      return apiClient.get(`/api/agents${query ? `?${query}` : ""}`);
    },
  });
}

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAgentInput) => apiClient.post("/api/agents", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent created successfully");
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to create agent");
    },
  });
}

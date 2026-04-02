import { z } from "zod";
import {
  Vertical,
  IntentLevel,
  LeadStatus,
  LeadSource,
  CampaignStatus,
  CreativeType,
  CreativeStatus,
  AgentType,
  AgentStatus,
  WorkflowStatus,
  FlagStatus,
} from "@prisma/client";

const cuidSchema = z.string().cuid();

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

// Lead schemas
export const createLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100).trim(),
  lastName: z.string().min(1, "Last name is required").max(100).trim(),
  email: z.string().email("Must be a valid email").toLowerCase().trim().optional().or(z.literal("")),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, "Must be a valid phone number").optional().or(z.literal("")),
  score: z.number().int().min(0).max(100).default(0),
  vertical: z.nativeEnum(Vertical),
  intent: z.nativeEnum(IntentLevel).default(IntentLevel.LOW),
  status: z.nativeEnum(LeadStatus).default(LeadStatus.NEW_LEAD),
  source: z.nativeEnum(LeadSource),
  notes: z.string().max(5000).optional(),
  assignedToId: cuidSchema.optional().nullable(),
  metadata: z.record(z.unknown()).default({}),
});

export const updateLeadSchema = createLeadSchema.partial().extend({ id: cuidSchema });

export const listLeadsSchema = paginationSchema.extend({
  search: z.string().trim().optional(),
  vertical: z.nativeEnum(Vertical).optional(),
  intent: z.nativeEnum(IntentLevel).optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  source: z.nativeEnum(LeadSource).optional(),
  assignedToId: cuidSchema.optional(),
  scoreMin: z.coerce.number().int().min(0).max(100).optional(),
  scoreMax: z.coerce.number().int().min(0).max(100).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "score", "firstName", "lastName"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Campaign schemas
export const createCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(200).trim(),
  status: z.nativeEnum(CampaignStatus).default(CampaignStatus.DRAFT),
  channel: z.string().min(1, "Channel is required").max(100).trim(),
  budget: z.number({ required_error: "Budget is required" }).positive().max(10_000_000),
  spend: z.number().min(0).default(0),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) return data.endDate > data.startDate;
    return true;
  },
  { message: "End date must be after start date", path: ["endDate"] }
);

export const updateCampaignSchema = createCampaignSchema.partial().extend({ id: cuidSchema });

// Creative schemas
export const createCreativeSchema = z.object({
  name: z.string().min(1, "Creative name is required").max(200).trim(),
  type: z.nativeEnum(CreativeType),
  status: z.nativeEnum(CreativeStatus).default(CreativeStatus.DRAFT),
  channel: z.string().min(1, "Channel is required").max(100).trim(),
  headline: z.string().max(255).optional(),
  body: z.string().max(10_000).optional(),
  ctaText: z.string().max(100).optional(),
  predictedCtr: z.number().min(0).max(1).optional().nullable(),
  campaignId: cuidSchema.optional().nullable(),
});

export const updateCreativeSchema = createCreativeSchema.partial().extend({ id: cuidSchema });

// Agent schemas
export const createAgentSchema = z.object({
  name: z.string().min(1, "Agent name is required").max(200).trim(),
  type: z.nativeEnum(AgentType),
  status: z.nativeEnum(AgentStatus).default(AgentStatus.TRAINING),
  description: z.string().max(2000).optional(),
  config: z.record(z.unknown()).default({}),
});

export const updateAgentSchema = createAgentSchema.partial().extend({ id: cuidSchema });

// Workflow schemas
const workflowStepSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  label: z.string().min(1).max(200),
  config: z.record(z.unknown()).default({}),
  nextStepId: z.string().optional().nullable(),
});

export const createWorkflowSchema = z.object({
  name: z.string().min(1, "Workflow name is required").max(200).trim(),
  trigger: z.string().min(1, "Trigger is required").max(200).trim(),
  steps: z.array(workflowStepSchema).min(1, "A workflow must have at least one step").default([]),
  status: z.nativeEnum(WorkflowStatus).default(WorkflowStatus.DRAFT),
});

export const updateWorkflowSchema = createWorkflowSchema.partial().extend({ id: cuidSchema });

// Compliance flag schemas
export const resolveComplianceFlagSchema = z.object({
  id: cuidSchema,
  status: z.enum([FlagStatus.RESOLVED, FlagStatus.DISMISSED]),
  resolutionNote: z.string().max(1000).optional(),
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Must be a valid email").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email("Must be a valid email").toLowerCase().trim(),
  password: z.string().min(8).max(100)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string(),
  orgName: z.string().min(2).max(200).trim(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Inferred types
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ListLeadsInput = z.infer<typeof listLeadsSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type CreateCreativeInput = z.infer<typeof createCreativeSchema>;
export type UpdateCreativeInput = z.infer<typeof updateCreativeSchema>;
export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;
export type ResolveComplianceFlagInput = z.infer<typeof resolveComplianceFlagSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

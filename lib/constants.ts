import {
  Vertical, IntentLevel, LeadStatus, LeadSource,
  CampaignStatus, CreativeType, CreativeStatus, ComplianceStatus,
  AgentType, AgentStatus, FlagSeverity,
} from "@prisma/client";

// Label maps
export const VERTICAL_LABELS: Record<Vertical, string> = {
  MEDICARE: "Medicare", AUTO: "Auto", HOME_SERVICES: "Home Services",
  INSURANCE: "Insurance", LEGAL: "Legal",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW_LEAD: "New Lead", IN_SEQUENCE: "In Sequence", NURTURE: "Nurture",
  APPOINTMENT_SET: "Appointment Set", CLOSED_WON: "Closed Won", DISQUALIFIED: "Disqualified",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  FACEBOOK: "Facebook", GOOGLE: "Google", TIKTOK: "TikTok",
  EMAIL: "Email", REFERRAL: "Referral", LINKEDIN: "LinkedIn",
};

export const INTENT_LABELS: Record<IntentLevel, string> = {
  LOW: "Low", MEDIUM: "Medium", HIGH: "High", VERY_HIGH: "Very High",
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  DRAFT: "Draft", ACTIVE: "Active", PAUSED: "Paused", COMPLETED: "Completed",
};

export const CREATIVE_TYPE_LABELS: Record<CreativeType, string> = {
  IMAGE: "Image", VIDEO: "Video", COPY: "Copy", LANDING_PAGE: "Landing Page",
};

export const CREATIVE_STATUS_LABELS: Record<CreativeStatus, string> = {
  DRAFT: "Draft", IN_REVIEW: "In Review", APPROVED: "Approved",
  REJECTED: "Rejected", LIVE: "Live",
};

export const COMPLIANCE_STATUS_LABELS: Record<ComplianceStatus, string> = {
  PENDING: "Pending", PASSED: "Passed", FLAGGED: "Flagged", BLOCKED: "Blocked",
};

export const AGENT_TYPE_LABELS: Record<AgentType, string> = {
  LEAD_QUALIFIER: "Lead Qualifier", APPOINTMENT_SETTER: "Appointment Setter",
  FOLLOW_UP: "Follow Up", COMPLIANCE_REVIEWER: "Compliance Reviewer",
  CREATIVE_GENERATOR: "Creative Generator",
};

export const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  ACTIVE: "Active", PAUSED: "Paused", TRAINING: "Training",
};

export const FLAG_SEVERITY_LABELS: Record<FlagSeverity, string> = {
  LOW: "Low", MEDIUM: "Medium", HIGH: "High", CRITICAL: "Critical",
};

// Color maps (Tailwind classes)
type ColorSet = { bg: string; text: string; border: string; dot: string };

export const LEAD_STATUS_COLORS: Record<LeadStatus, ColorSet> = {
  NEW_LEAD: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  IN_SEQUENCE: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-500" },
  NURTURE: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  APPOINTMENT_SET: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", dot: "bg-cyan-500" },
  CLOSED_WON: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  DISQUALIFIED: { bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-200", dot: "bg-slate-400" },
};

export const INTENT_COLORS: Record<IntentLevel, ColorSet> = {
  LOW: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" },
  MEDIUM: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", dot: "bg-yellow-500" },
  HIGH: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
  VERY_HIGH: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
};

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, ColorSet> = {
  DRAFT: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" },
  ACTIVE: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  PAUSED: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  COMPLETED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
};

export const CREATIVE_STATUS_COLORS: Record<CreativeStatus, ColorSet> = {
  DRAFT: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" },
  IN_REVIEW: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", dot: "bg-yellow-500" },
  APPROVED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  REJECTED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
  LIVE: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-500" },
};

export const COMPLIANCE_STATUS_COLORS: Record<ComplianceStatus, ColorSet> = {
  PENDING: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" },
  PASSED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  FLAGGED: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  BLOCKED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
};

export const SEVERITY_COLORS: Record<FlagSeverity, ColorSet & { icon: string }> = {
  LOW: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400", icon: "text-slate-400" },
  MEDIUM: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", dot: "bg-yellow-500", icon: "text-yellow-500" },
  HIGH: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500", icon: "text-orange-500" },
  CRITICAL: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-600", icon: "text-red-600" },
};

export const AGENT_STATUS_COLORS: Record<AgentStatus, ColorSet> = {
  ACTIVE: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  PAUSED: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  TRAINING: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
};

// Misc constants
export const APP_NAME = "APEX AI Revenue OS" as const;
export const ITEMS_PER_PAGE = 25 as const;
export const MAX_SCORE = 100 as const;

export const SCORE_THRESHOLDS = { HOT: 80, WARM: 50, COLD: 20 } as const;

export const SCORE_COLORS = (score: number): string => {
  if (score >= SCORE_THRESHOLDS.HOT) return "text-red-600";
  if (score >= SCORE_THRESHOLDS.WARM) return "text-amber-600";
  if (score >= SCORE_THRESHOLDS.COLD) return "text-blue-600";
  return "text-slate-500";
};

export const SCORE_BG_COLORS = (score: number): string => {
  if (score >= SCORE_THRESHOLDS.HOT) return "bg-red-500";
  if (score >= SCORE_THRESHOLDS.WARM) return "bg-amber-500";
  if (score >= SCORE_THRESHOLDS.COLD) return "bg-blue-500";
  return "bg-slate-400";
};

export const CHART_COLORS = {
  primary: "#6366f1", secondary: "#8b5cf6", success: "#10b981",
  warning: "#f59e0b", danger: "#ef4444", info: "#06b6d4",
  muted: "#94a3b8", grid: "#e2e8f0",
} as const;

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Leads", href: "/dashboard/leads", icon: "Users" },
  { label: "Campaigns", href: "/dashboard/campaigns", icon: "Megaphone" },
  { label: "Creatives", href: "/dashboard/creatives", icon: "Paintbrush" },
  { label: "AI Agents", href: "/dashboard/agents", icon: "Bot" },
  { label: "Workflows", href: "/dashboard/workflows", icon: "GitBranch" },
  { label: "Appointments", href: "/dashboard/appointments", icon: "Calendar" },
  { label: "Compliance", href: "/dashboard/compliance", icon: "ShieldCheck" },
  { label: "Experiments", href: "/dashboard/experiments", icon: "FlaskConical" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
] as const;

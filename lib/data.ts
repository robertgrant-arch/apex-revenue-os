import {
  Eye,
  FlaskConical,
  Brush,
  Radio,
  Mail,
  Calendar,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

// ─── Agent types ────────────────────────────────────────────────────────────

export type AgentStatus = "active" | "processing" | "paused" | "error";

export interface Agent {
  id: string;
  name: string;
  role: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  status: AgentStatus;
  confidence: number;
  lastAction: string;
  actions: number;
  desc: string;
  promptTemplate: string;
}

export const AGENTS: Agent[] = [
  {
    id: "oracle",
    name: "ORACLE",
    role: "Research & Intelligence",
    icon: Eye,
    color: "#6366f1",
    bg: "#1e1b4b",
    status: "active",
    confidence: 94,
    lastAction: "Analyzed 847 competitor ad sets",
    actions: 2341,
    desc: "Deep market intelligence, competitor monitoring, ICP refinement, and intent signal aggregation across 40+ data sources.",
    promptTemplate: `You are ORACLE, the Research & Intelligence agent in the APEX Revenue Operating System.

Your core objective: Deep market intelligence, competitor monitoring, ICP refinement, and intent signal aggregation across 40+ data sources.

Context inputs:
- Current vertical: {{vertical}}
- Campaign: {{campaign_name}}
- Performance data: {{metrics_json}}
- Historical decisions: {{decision_log}}

Decision framework:
1. Analyze current state vs benchmark
2. Identify highest-leverage action
3. Estimate confidence (0-100)
4. State expected impact
5. Flag any compliance considerations

Output format: JSON with keys: action, rationale, confidence, impact, compliance_notes`,
  },
  {
    id: "architect",
    name: "ARCHITECT",
    role: "Experiment Design",
    icon: FlaskConical,
    color: "#8b5cf6",
    bg: "#2e1065",
    status: "active",
    confidence: 89,
    lastAction: "Designed 3 new A/B variants",
    actions: 891,
    desc: "Statistical experiment design, hypothesis generation, variable isolation, and significance testing for all campaign elements.",
    promptTemplate: `You are ARCHITECT, the Experiment Design agent in the APEX Revenue Operating System.

Your core objective: Statistical experiment design, hypothesis generation, variable isolation, and significance testing.

Context inputs:
- Current vertical: {{vertical}}
- Campaign: {{campaign_name}}
- Active experiments: {{experiments_json}}
- Significance thresholds: {{thresholds}}

Decision framework:
1. Identify testable hypotheses from performance data
2. Design statistically valid experiment structure
3. Estimate required sample sizes
4. Isolate single variables per test
5. Define success metrics and stop conditions

Output format: JSON with keys: hypothesis, variable, control, variant, sample_size, duration_days, success_metric`,
  },
  {
    id: "creator",
    name: "CREATOR",
    role: "Creative Generation",
    icon: Brush,
    color: "#ec4899",
    bg: "#500724",
    status: "active",
    confidence: 91,
    lastAction: "Generated 12 ad variants",
    actions: 3102,
    desc: "Multi-modal creative generation for ads, landing pages, emails, and video scripts with vertical-specific compliance guardrails.",
    promptTemplate: `You are CREATOR, the Creative Generation agent in the APEX Revenue Operating System.

Your core objective: Multi-modal creative generation for ads, landing pages, emails, and video scripts with compliance guardrails.

Context inputs:
- Vertical: {{vertical}}
- Compliance rules: {{compliance_rules}}
- Top-performing creatives: {{top_creatives}}
- Brand guidelines: {{brand_json}}

Decision framework:
1. Analyze top performers for patterns
2. Generate variants testing angle/hook/CTA
3. Apply vertical compliance rules
4. Predict CTR and CPA vs benchmark
5. Flag any compliance concerns pre-launch

Output format: JSON with keys: headline, body, cta, visual_direction, predicted_ctr, compliance_status, flags`,
  },
  {
    id: "signal",
    name: "SIGNAL",
    role: "Audience Intelligence",
    icon: Radio,
    color: "#f59e0b",
    bg: "#451a03",
    status: "active",
    confidence: 96,
    lastAction: "Scored 1,204 new leads",
    actions: 18420,
    desc: "Real-time audience segmentation, lookalike modeling, intent scoring, and suppression list management across all ad platforms.",
    promptTemplate: `You are SIGNAL, the Audience Intelligence agent in the APEX Revenue Operating System.

Your core objective: Real-time audience segmentation, lookalike modeling, intent scoring, and suppression list management.

Context inputs:
- Lead data: {{lead_batch_json}}
- Historical conversion data: {{conversion_history}}
- Platform audience data: {{platform_audiences}}

Decision framework:
1. Score each lead 0-100 on conversion probability
2. Segment by intent tier (hot/warm/cold)
3. Identify suppression candidates
4. Generate lookalike seeds from top converters
5. Recommend bid multipliers per segment

Output format: JSON with keys: lead_scores[], suppression_list[], lookalike_seeds[], bid_multipliers{}`,
  },
  {
    id: "reach",
    name: "REACH",
    role: "Multi-Channel Outreach",
    icon: Mail,
    color: "#10b981",
    bg: "#022c22",
    status: "processing",
    confidence: 87,
    lastAction: "Launched Medicare email seq.",
    actions: 5671,
    desc: "Automated multi-channel sequences across email, SMS, LinkedIn, and direct mail with dynamic personalization at scale.",
    promptTemplate: `You are REACH, the Multi-Channel Outreach agent in the APEX Revenue Operating System.

Your core objective: Automated multi-channel sequences across email, SMS, LinkedIn, and direct mail with dynamic personalization.

Context inputs:
- Lead segment: {{segment}}
- Channel preferences: {{channel_data}}
- Previous touches: {{touch_history}}
- Vertical compliance: {{compliance_rules}}

Decision framework:
1. Select optimal next channel based on response history
2. Personalize message using lead context
3. Apply compliance guardrails per channel
4. Schedule within optimal send windows
5. Set follow-up triggers based on engagement

Output format: JSON with keys: channel, message, send_time, follow_up_trigger, personalization_tokens{}`,
  },
  {
    id: "convert",
    name: "CONVERT",
    role: "Appointment Booking",
    icon: Calendar,
    color: "#3b82f6",
    bg: "#172554",
    status: "active",
    confidence: 93,
    lastAction: "Booked 14 appointments today",
    actions: 2890,
    desc: "AI-driven appointment setting with objection handling, qualification scoring, and calendar orchestration across team members.",
    promptTemplate: `You are CONVERT, the Appointment Booking agent in the APEX Revenue Operating System.

Your core objective: AI-driven appointment setting with objection handling, qualification scoring, and calendar orchestration.

Context inputs:
- Lead profile: {{lead_json}}
- Calendar availability: {{calendar_data}}
- Qualification criteria: {{qualification_rules}}
- Objection library: {{objections_json}}

Decision framework:
1. Qualify lead against ICP criteria
2. Select best-fit rep based on vertical expertise
3. Offer 3 time slots within optimal booking window
4. Handle objections using trained response library
5. Send confirmation + reminder sequence

Output format: JSON with keys: qualified, assigned_rep, offered_slots[], confirmation_sent, reminder_schedule[]`,
  },
  {
    id: "loop",
    name: "LOOP",
    role: "Continuous Learning",
    icon: RefreshCw,
    color: "#06b6d4",
    bg: "#083344",
    status: "active",
    confidence: 98,
    lastAction: "Updated 23 model weights",
    actions: 44201,
    desc: "Closed-loop learning that continuously refines all other agents based on conversion outcomes, revenue attribution, and market shifts.",
    promptTemplate: `You are LOOP, the Continuous Learning agent in the APEX Revenue Operating System.

Your core objective: Closed-loop learning that continuously refines all other agents based on conversion outcomes and revenue attribution.

Context inputs:
- Agent performance deltas: {{agent_metrics}}
- Conversion outcomes: {{conversion_outcomes}}
- Market shift signals: {{market_signals}}
- Model weight history: {{weight_history}}

Decision framework:
1. Attribute revenue to agent decisions
2. Identify highest-impact model updates
3. Adjust confidence thresholds per agent
4. Propagate learnings to relevant agents
5. Flag systematic errors for human review

Output format: JSON with keys: weight_updates{}, agent_adjustments{}, flagged_errors[], estimated_impact`,
  },
];

// ─── Revenue chart data ──────────────────────────────────────────────────────

export const revenueData = [
  { month: "Sep", pipeline: 420, closed: 180, appointments: 34 },
  { month: "Oct", pipeline: 580, closed: 240, appointments: 41 },
  { month: "Nov", pipeline: 510, closed: 210, appointments: 38 },
  { month: "Dec", pipeline: 720, closed: 310, appointments: 52 },
  { month: "Jan", pipeline: 890, closed: 380, appointments: 61 },
  { month: "Feb", pipeline: 1040, closed: 450, appointments: 74 },
  { month: "Mar", pipeline: 1280, closed: 540, appointments: 89 },
];

export const appointmentData = [
  { day: "Mon", booked: 12, showed: 10, closed: 4 },
  { day: "Tue", booked: 18, showed: 14, closed: 7 },
  { day: "Wed", booked: 15, showed: 13, closed: 5 },
  { day: "Thu", booked: 21, showed: 17, closed: 9 },
  { day: "Fri", booked: 14, showed: 11, closed: 4 },
  { day: "Sat", booked: 8,  showed: 7,  closed: 3 },
  { day: "Sun", booked: 4,  showed: 4,  closed: 2 },
];

export const leadScoreData = [
  { score: "90-100", count: 124, fill: "#10b981" },
  { score: "70-89",  count: 341, fill: "#6366f1" },
  { score: "50-69",  count: 512, fill: "#f59e0b" },
  { score: "30-49",  count: 289, fill: "#f97316" },
  { score: "0-29",   count: 178, fill: "#ef4444" },
];

// ─── Campaign types ──────────────────────────────────────────────────────────

export type CampaignStatus = "active" | "paused" | "draft" | "completed";
export type Vertical = "Medicare" | "Insurance" | "Legal" | "Home Services" | "Auto" | "Finance";

export interface Campaign {
  id: number;
  name: string;
  vertical: Vertical;
  status: CampaignStatus;
  spend: number;
  pipeline: number;
  roas: number;
  leads: number;
  appts: number;
  cpl: number;
  cpa: number;
  experiments: number;
}

export const campaigns: Campaign[] = [
  { id: 1, name: "Medicare Advantage Q2 2025",    vertical: "Medicare",      status: "active",  spend: 48200, pipeline: 284000, roas: 5.89, leads: 1204, appts: 89, cpl: 40, cpa: 542, experiments: 7 },
  { id: 2, name: "Auto Insurance – Midwest",       vertical: "Auto",          status: "active",  spend: 31400, pipeline: 198000, roas: 6.30, leads: 892,  appts: 67, cpl: 35, cpa: 468, experiments: 5 },
  { id: 3, name: "Personal Injury – Texas",        vertical: "Legal",         status: "paused",  spend: 22100, pipeline: 410000, roas: 18.55,leads: 312,  appts: 28, cpl: 71, cpa: 789, experiments: 3 },
  { id: 4, name: "HVAC Summer Push",               vertical: "Home Services", status: "active",  spend: 18900, pipeline: 94000,  roas: 4.97, leads: 634,  appts: 51, cpl: 30, cpa: 370, experiments: 4 },
  { id: 5, name: "Debt Settlement – National",     vertical: "Finance",       status: "draft",   spend: 0,     pipeline: 0,      roas: 0,    leads: 0,    appts: 0,  cpl: 0,  cpa: 0,   experiments: 2 },
];

export interface Experiment {
  id: number;
  campaign: string;
  hypothesis: string;
  variable: string;
  status: "running" | "completed" | "paused";
  winner: string | null;
  lifts: [number, number];
  significance: number;
}

export const experiments: Experiment[] = [
  { id: 1, campaign: "Medicare AEP Q2",    hypothesis: "Urgency-based creative will outperform benefit-focused by >15% CTR",       variable: "Creative angle",  status: "running",   winner: null,         lifts: [1.0, 1.18], significance: 78 },
  { id: 2, campaign: "Auto Ins. Midwest",  hypothesis: "Headline with price anchor ($29/mo) vs. generic 'save money' CTA",          variable: "Headline copy",   status: "completed", winner: "Variant B",  lifts: [1.0, 1.34], significance: 97 },
  { id: 3, campaign: "PI Law – Texas",     hypothesis: "Social proof (case results) vs. empathy-based headline",                    variable: "Value prop",      status: "running",   winner: null,         lifts: [1.0, 1.09], significance: 61 },
  { id: 4, campaign: "HVAC Summer",        hypothesis: "Same-day service vs. lowest price as primary hook",                         variable: "Primary offer",   status: "completed", winner: "Variant A",  lifts: [1.41, 1.0], significance: 95 },
  { id: 5, campaign: "Medicare AEP Q2",    hypothesis: "Carousel format outperforms single image for benefit showcase",              variable: "Ad format",       status: "running",   winner: null,         lifts: [1.0, 1.06], significance: 44 },
  { id: 6, campaign: "Auto Ins. Midwest",  hypothesis: "Fear-of-loss framing vs. aspiration framing in email subject lines",        variable: "Email framing",   status: "completed", winner: "Variant A",  lifts: [1.28, 1.0], significance: 91 },
];

// ─── Lead types ──────────────────────────────────────────────────────────────

export type LeadStatus = "Appointment Set" | "In Sequence" | "New Lead" | "Nurture" | "Closed Won" | "Disqualified";
export type IntentLevel = "Very High" | "High" | "Medium" | "Low";

export interface Lead {
  id: number;
  name: string;
  score: number;
  intent: IntentLevel;
  vertical: Vertical;
  source: string;
  status: LeadStatus;
  action: string;
  created: string;
  phone: string;
  email: string;
  signals: string[];
}

export const leads: Lead[] = [
  { id: 1, name: "Margaret Chen",    score: 94, intent: "High",      vertical: "Medicare",      source: "Facebook", status: "Appointment Set", action: "Confirm call",    created: "2h ago",  phone: "+1 (512) 445-8821", email: "mchen@email.com",      signals: ["Visited pricing page 3x", "Opened 4 emails", "Clicked CTA"] },
  { id: 2, name: "Robert Stanton",   score: 88, intent: "High",      vertical: "Auto",          source: "Google",   status: "In Sequence",     action: "Follow-up SMS",   created: "4h ago",  phone: "+1 (713) 229-4412", email: "rstanton@gmail.com",   signals: ["High search intent", "Mid-funnel page visit"] },
  { id: 3, name: "Patricia Wells",   score: 76, intent: "Medium",    vertical: "Legal",         source: "TikTok",   status: "New Lead",        action: "Qualify call",    created: "6h ago",  phone: "+1 (214) 887-3301", email: "pwells@yahoo.com",     signals: ["Video 75% completion", "Landing page visit"] },
  { id: 4, name: "James Okoye",      score: 91, intent: "High",      vertical: "Medicare",      source: "Email",    status: "Appointment Set", action: "Send reminder",   created: "1h ago",  phone: "+1 (404) 556-7789", email: "jokoye@gmail.com",     signals: ["Clicked 5 emails", "Referred by friend", "Age-qualified"] },
  { id: 5, name: "Susan Alvarez",    score: 62, intent: "Medium",    vertical: "Home Services", source: "Facebook", status: "Nurture",         action: "Drip email",      created: "1d ago",  phone: "+1 (602) 334-9920", email: "salvarez@hotmail.com", signals: ["Browsed service pages", "Downloaded guide"] },
  { id: 6, name: "David Kim",        score: 83, intent: "High",      vertical: "Insurance",     source: "Google",   status: "In Sequence",     action: "LinkedIn DM",     created: "3h ago",  phone: "+1 (415) 773-0011", email: "dkim@company.com",     signals: ["Quote request form", "High LTV company"] },
  { id: 7, name: "Linda Foster",     score: 71, intent: "Medium",    vertical: "Legal",         source: "TikTok",   status: "New Lead",        action: "Qualify call",    created: "8h ago",  phone: "+1 (305) 448-2234", email: "lfoster@icloud.com",   signals: ["Video completion", "State match: TX"] },
  { id: 8, name: "Michael Torres",   score: 97, intent: "Very High", vertical: "Medicare",      source: "Referral", status: "Closed Won",      action: "Upsell review",   created: "5d ago",  phone: "+1 (617) 892-4456", email: "mtorres@gmail.com",    signals: ["Referral source", "AEP window active", "Phone match"] },
  { id: 9, name: "Brenda Wallace",   score: 58, intent: "Medium",    vertical: "Auto",          source: "Facebook", status: "Nurture",         action: "Retarget ad",     created: "2d ago",  phone: "+1 (773) 201-9934", email: "bwallace@gmail.com",   signals: ["Ad click", "Bounced landing page"] },
  { id: 10,name: "Carlos Mendez",    score: 85, intent: "High",      vertical: "Home Services", source: "Google",   status: "In Sequence",     action: "Call attempt 2",  created: "5h ago",  phone: "+1 (832) 667-1145", email: "cmendez@email.com",    signals: ["Form fill", "Service area match", "Summer timing"] },
];

// ─── Compliance types ────────────────────────────────────────────────────────

export interface ComplianceRule {
  id: number;
  name: string;
  vertical: Vertical | "All";
  tier: 1 | 2 | 3;
  status: "active" | "warning" | "inactive";
  assets: number;
  score: number;
  description: string;
}

export const complianceRules: ComplianceRule[] = [
  { id: 1, name: "Medicare TCPA Consent",          vertical: "Medicare",      tier: 1, status: "active",  assets: 124, score: 98, description: "All Medicare leads must provide express written consent before automated calls or texts." },
  { id: 2, name: "Insurance Disclosure Language",  vertical: "Insurance",     tier: 2, status: "active",  assets: 89,  score: 94, description: "All insurance ads must include state-specific disclosure language and license numbers." },
  { id: 3, name: "Legal 'No Guarantee' Disclaimer",vertical: "Legal",         tier: 1, status: "active",  assets: 56,  score: 100,description: "Legal ads may not guarantee outcomes. 'Results may vary' language required." },
  { id: 4, name: "Home Services License Display",  vertical: "Home Services", tier: 3, status: "active",  assets: 201, score: 91, description: "Contractor license numbers must be visible on all ads and landing pages." },
  { id: 5, name: "Auto Insurance State Restrictions",vertical: "Auto",        tier: 2, status: "warning", assets: 44,  score: 73, description: "Certain states restrict auto insurance ad language and pricing claims. 12 assets need review." },
  { id: 6, name: "HIPAA Safe Harbor Language",     vertical: "Medicare",      tier: 1, status: "active",  assets: 88,  score: 99, description: "Health-related ad copy must not imply diagnosis or treatment. Safe harbor language required." },
  { id: 7, name: "CAN-SPAM Compliance",            vertical: "All",           tier: 2, status: "active",  assets: 312, score: 97, description: "All email campaigns must include physical address, opt-out mechanism, and honest subject lines." },
  { id: 8, name: "FTC Endorsement Guidelines",     vertical: "All",           tier: 3, status: "active",  assets: 67,  score: 88, description: "Testimonials and endorsements must reflect typical results or include clear disclosure." },
];

export interface ApprovalItem {
  id: number;
  asset: string;
  type: string;
  tier: 1 | 2 | 3;
  status: "pending" | "approved" | "flagged" | "rejected";
  submitted: string;
  submittedBy: string;
  flags: string[];
}

export const approvalQueue: ApprovalItem[] = [
  { id: 1, asset: "Medicare AEP Hero Video",         type: "Video Ad",     tier: 1, status: "pending",  submitted: "1h ago",  submittedBy: "CREATOR Agent",  flags: ["Benefit claims require source citation", "CTA language needs legal review"] },
  { id: 2, asset: "PI Law Firm Facebook Static",     type: "Image Ad",     tier: 2, status: "approved", submitted: "3h ago",  submittedBy: "CREATOR Agent",  flags: [] },
  { id: 3, asset: "Auto Ins. Email Subject Lines",   type: "Email",        tier: 3, status: "pending",  submitted: "30m ago", submittedBy: "REACH Agent",    flags: ["State restriction check required"] },
  { id: 4, asset: "HVAC Landing Page Copy",          type: "Landing Page", tier: 3, status: "approved", submitted: "5h ago",  submittedBy: "CREATOR Agent",  flags: [] },
  { id: 5, asset: "Medicare SMS Sequence v3",        type: "SMS",          tier: 1, status: "flagged",  submitted: "2h ago",  submittedBy: "REACH Agent",    flags: ["TCPA opt-in language missing", "Opt-out instructions required", "Sending number must be disclosed"] },
  { id: 6, asset: "Debt Settlement Facebook Carousel",type: "Carousel Ad", tier: 2, status: "pending",  submitted: "20m ago", submittedBy: "CREATOR Agent",  flags: ["FTC debt disclosure required"] },
];

// ─── Creative types ──────────────────────────────────────────────────────────

export type ComplianceStatus = "approved" | "pending" | "flagged" | "rejected";
export type CreativeStatus   = "live" | "testing" | "review" | "blocked" | "draft";

export interface Creative {
  id: number;
  name: string;
  type: string;
  predicted_ctr: number;
  predicted_cpa: number;
  compliance: ComplianceStatus;
  variant_of: number | null;
  status: CreativeStatus;
  vertical: Vertical;
  created: string;
  impressions: number;
  actual_ctr: number | null;
}

export const creatives: Creative[] = [
  { id: 1, name: "Medicare AEP Hero v4",             type: "Facebook Static",  predicted_ctr: 3.8, predicted_cpa: 41, compliance: "approved", variant_of: null, status: "live",    vertical: "Medicare",      created: "3d ago",  impressions: 48200, actual_ctr: 3.6  },
  { id: 2, name: "Medicare AEP Hero v4-B",           type: "Facebook Static",  predicted_ctr: 4.1, predicted_cpa: 38, compliance: "approved", variant_of: 1,    status: "testing", vertical: "Medicare",      created: "1d ago",  impressions: 12400, actual_ctr: 4.0  },
  { id: 3, name: "Auto Ins. Midwest Video 15s",      type: "Video Ad",         predicted_ctr: 2.9, predicted_cpa: 52, compliance: "approved", variant_of: null, status: "live",    vertical: "Auto",          created: "5d ago",  impressions: 91000, actual_ctr: 2.7  },
  { id: 4, name: "PI Law – Fear Appeal Static",      type: "Facebook Static",  predicted_ctr: 5.2, predicted_cpa: 71, compliance: "pending",  variant_of: null, status: "review",  vertical: "Legal",         created: "12h ago", impressions: 0,     actual_ctr: null },
  { id: 5, name: "HVAC Summer Urgency Email",        type: "Email",            predicted_ctr: 6.8, predicted_cpa: 29, compliance: "approved", variant_of: null, status: "live",    vertical: "Home Services", created: "2d ago",  impressions: 8400,  actual_ctr: 7.1  },
  { id: 6, name: "Medicare Carousel – Benefits",     type: "Carousel Ad",      predicted_ctr: 3.4, predicted_cpa: 44, compliance: "flagged",  variant_of: null, status: "blocked", vertical: "Medicare",      created: "6h ago",  impressions: 0,     actual_ctr: null },
  { id: 7, name: "Auto Ins. Google RSA v2",          type: "Search Ad",        predicted_ctr: 8.1, predicted_cpa: 61, compliance: "approved", variant_of: null, status: "live",    vertical: "Auto",          created: "4d ago",  impressions: 22100, actual_ctr: 7.8  },
  { id: 8, name: "HVAC Retargeting Banner",          type: "Display Ad",       predicted_ctr: 1.2, predicted_cpa: 34, compliance: "approved", variant_of: null, status: "testing", vertical: "Home Services", created: "2d ago",  impressions: 5600,  actual_ctr: 0.9  },
];

// ─── Decision Audit Log ──────────────────────────────────────────────────────

export interface AuditEntry {
  id: number;
  agent: string;
  decision: string;
  confidence: number;
  time: string;
  impact: string;
  category: "optimization" | "suppression" | "creative" | "budget" | "intelligence";
}

export const auditLog: AuditEntry[] = [
  { id: 1, agent: "SIGNAL",    decision: "Suppressed 340 leads below score 45 from Medicare email sequence", confidence: 97, time: "4m ago",  impact: "+$2,100 projected CPA savings",          category: "suppression"  },
  { id: 2, agent: "ARCHITECT", decision: "Paused underperforming ad set #4421 — CTR 0.8% vs 2.1% benchmark", confidence: 92, time: "18m ago", impact: "-$340/day spend reduction",              category: "optimization" },
  { id: 3, agent: "LOOP",      decision: "Increased bid multiplier 15% for Saturday evening Medicare segment", confidence: 88, time: "1h ago",  impact: "+12% predicted appointment rate",        category: "optimization" },
  { id: 4, agent: "CONVERT",   decision: "Rescheduled 7 no-show leads to alternative time slots",             confidence: 95, time: "2h ago",  impact: "+7 recovered appointments",              category: "optimization" },
  { id: 5, agent: "ORACLE",    decision: "Identified new competitor offer: $0 premium Medicare plan in TX/FL", confidence: 99, time: "3h ago",  impact: "Triggering counter-creative generation", category: "intelligence" },
  { id: 6, agent: "CREATOR",   decision: "Generated 3 urgency variants for HVAC campaign ahead of heat wave",  confidence: 91, time: "4h ago",  impact: "+18% predicted CTR lift",                category: "creative"     },
  { id: 7, agent: "SIGNAL",    decision: "Added 1,204 new leads to Medicare lookalike audience on Meta",        confidence: 94, time: "5h ago",  impact: "-$8 predicted CPL reduction",            category: "optimization" },
  { id: 8, agent: "REACH",     decision: "Switched channel from email to SMS for 89 unresponsive Medicare leads",confidence:85, time: "6h ago",  impact: "+22% expected open rate",                category: "optimization" },
];

// ─── Integrations ────────────────────────────────────────────────────────────

export type IntegrationStatus = "connected" | "disconnected" | "warning" | "error";

export interface Integration {
  name: string;
  category: string;
  status: IntegrationStatus;
  lastSync: string;
  description: string;
}

export const integrations: Integration[] = [
  { name: "Salesforce CRM",    category: "CRM",            status: "connected",    lastSync: "2m ago",    description: "Bi-directional lead and opportunity sync" },
  { name: "Google Ads",        category: "Ad Platform",    status: "connected",    lastSync: "5m ago",    description: "Campaign management and conversion import" },
  { name: "Meta Ads",          category: "Ad Platform",    status: "connected",    lastSync: "5m ago",    description: "Facebook & Instagram campaign management" },
  { name: "Twilio",            category: "Communications", status: "connected",    lastSync: "Real-time", description: "SMS and voice outreach infrastructure" },
  { name: "HubSpot",           category: "CRM",            status: "disconnected", lastSync: "Never",     description: "Alternative CRM sync (not configured)" },
  { name: "Calendly",          category: "Calendar",       status: "connected",    lastSync: "1m ago",    description: "Appointment booking and availability sync" },
  { name: "TikTok Ads",        category: "Ad Platform",    status: "connected",    lastSync: "10m ago",   description: "TikTok campaign management and tracking" },
  { name: "Figma",             category: "Creative",       status: "connected",    lastSync: "Real-time", description: "Design asset handoff and approval workflow" },
  { name: "Stripe",            category: "Revenue",        status: "connected",    lastSync: "Real-time", description: "Revenue attribution and close tracking" },
  { name: "LinkedIn Ads",      category: "Ad Platform",    status: "warning",      lastSync: "2h ago",    description: "B2B targeting — token refresh required" },
  { name: "Google Calendar",   category: "Calendar",       status: "connected",    lastSync: "Real-time", description: "Rep calendar availability sync" },
  { name: "Slack",             category: "Notifications",  status: "connected",    lastSync: "Real-time", description: "Agent decision alerts and daily digests" },
];

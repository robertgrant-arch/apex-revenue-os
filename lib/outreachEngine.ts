// lib/outreachEngine.ts

export type MessageChannel = 'sms' | 'voice';
export type MessageCategory = 'transactional' | 'educational' | 'marketing';
export type ConsentStatus = 'opted_in' | 'opted_out' | 'pending' | 'unknown';
export type SequenceStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export type StepStatus = 'pending' | 'sent' | 'failed' | 'skipped' | 'blocked';

export interface MessageTemplate {
  templateId: string;
  name: string;
  channel: MessageChannel;
  category: MessageCategory;
  approvedAt: string;
  approvedBy: string;
  body: string; // Use {{variable}} for safe merge fields only
  allowedMergeFields: string[]; // Only these fields can be dynamically inserted
  requiredDisclaimers: string[];
  isApproved: boolean;
  version: number;
}

export interface ConsentRecord {
  contactId: string;
  channel: MessageChannel;
  status: ConsentStatus;
  consentMethod?: string; // e.g., 'web_form', 'verbal', 'sms_keyword'
  consentTimestamp?: string;
  optOutTimestamp?: string;
  optOutMethod?: string;
  lastUpdated: string;
}

export interface SequenceStep {
  stepId: string;
  stepOrder: number;
  templateId: string;
  channel: MessageChannel;
  delayHours: number; // delay from previous step
  category: MessageCategory;
  status: StepStatus;
  scheduledAt?: string;
  sentAt?: string;
  failureReason?: string;
  renderedMessage?: string; // exact text that was/will be sent — audit record
  mergeData?: Record<string, string>; // approved merge fields only
}

export interface OutreachSequence {
  sequenceId: string;
  name: string;
  contactId: string;
  vertical: string;
  status: SequenceStatus;
  createdAt: string;
  updatedAt: string;
  steps: SequenceStep[];
  consentVerifiedAt?: string;
  totalSent: number;
  totalFailed: number;
  totalBlocked: number;
}

export interface MessageSendResult {
  stepId: string;
  status: StepStatus;
  renderedMessage?: string;
  blockedReason?: string;
  sentAt?: string;
}

// ─── Store keys ───────────────────────────────────────────────────────────────

const SEQUENCES_KEY = 'apex_outreach_sequences';
const CONSENT_KEY = 'apex_outreach_consent';
const TEMPLATES_KEY = 'apex_outreach_templates';
const SEND_LOG_KEY = 'apex_outreach_send_log';

// ─── Persistence helpers ──────────────────────────────────────────────────────

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[OutreachEngine] Storage save failed for key "${key}":`, e);
  }
}

// ─── Send log ─────────────────────────────────────────────────────────────────

export interface SendLogEntry {
  logId: string;
  sequenceId: string;
  stepId: string;
  contactId: string;
  channel: MessageChannel;
  category: MessageCategory;
  templateId: string;
  renderedMessage: string;
  status: StepStatus;
  timestamp: string;
  blockedReason?: string;
}

function appendSendLog(entry: SendLogEntry): void {
  const log = loadFromStorage<SendLogEntry[]>(SEND_LOG_KEY, []);
  log.unshift(entry);
  // Keep last 10,000 entries
  saveToStorage(SEND_LOG_KEY, log.slice(0, 10_000));
}

export function getSendLog(sequenceId?: string, limit = 100): SendLogEntry[] {
  const log = loadFromStorage<SendLogEntry[]>(SEND_LOG_KEY, []);
  if (sequenceId) return log.filter(e => e.sequenceId === sequenceId).slice(0, limit);
  return log.slice(0, limit);
}

// ─── Template registry ────────────────────────────────────────────────────────

export function getApprovedTemplates(channel?: MessageChannel): MessageTemplate[] {
  const templates = loadFromStorage<MessageTemplate[]>(TEMPLATES_KEY, getDefaultTemplates());
  return templates.filter(t => t.isApproved && (!channel || t.channel === channel));
}

export function saveTemplate(template: MessageTemplate): void {
  const templates = loadFromStorage<MessageTemplate[]>(TEMPLATES_KEY, getDefaultTemplates());
  const idx = templates.findIndex(t => t.templateId === template.templateId);
  if (idx >= 0) {
    templates[idx] = template;
  } else {
    templates.push(template);
  }
  saveToStorage(TEMPLATES_KEY, templates);
}

export function getTemplate(templateId: string): MessageTemplate | undefined {
  const templates = loadFromStorage<MessageTemplate[]>(TEMPLATES_KEY, getDefaultTemplates());
  return templates.find(t => t.templateId === templateId);
}

function getDefaultTemplates(): MessageTemplate[] {
  return [
    {
      templateId: 'tpl_sms_appt_confirm',
      name: 'Appointment Confirmation',
      channel: 'sms',
      category: 'transactional',
      approvedAt: new Date().toISOString(),
      approvedBy: 'compliance_system',
      body: 'Hi {{first_name}}, your appointment with {{agent_name}} is confirmed for {{appt_date}} at {{appt_time}}. Reply STOP to opt out.',
      allowedMergeFields: ['first_name', 'agent_name', 'appt_date', 'appt_time'],
      requiredDisclaimers: ['Reply STOP to opt out.'],
      isApproved: true,
      version: 1,
    },
    {
      templateId: 'tpl_sms_edu_enrollment',
      name: 'Medicare Enrollment Education',
      channel: 'sms',
      category: 'educational',
      approvedAt: new Date().toISOString(),
      approvedBy: 'compliance_system',
      body: 'Medicare Open Enrollment runs Oct 15 – Dec 7. Review your plan options at Medicare.gov. Questions? Call us at {{phone_number}}. Reply STOP to opt out.',
      allowedMergeFields: ['phone_number'],
      requiredDisclaimers: ['Reply STOP to opt out.'],
      isApproved: true,
      version: 1,
    },
    {
      templateId: 'tpl_voice_intro',
      name: 'Voice Introduction Script',
      channel: 'voice',
      category: 'educational',
      approvedAt: new Date().toISOString(),
      approvedBy: 'compliance_system',
      body: 'Hello {{first_name}}, this is {{agent_name}} from {{company_name}}. We are not connected with the government or the federal Medicare program. I am calling to provide information about Medicare plan options available in your area. Is now a good time?',
      allowedMergeFields: ['first_name', 'agent_name', 'company_name'],
      requiredDisclaimers: [
        'Not connected with or endorsed by the U.S. government or the federal Medicare program.',
      ],
      isApproved: true,
      version: 1,
    },
  ];
}

// ─── Message classifier ───────────────────────────────────────────────────────

const MARKETING_SIGNALS = [
  /\b(buy|purchase|enroll|sign up|subscribe|get (started|coverage|benefits?))\b/gi,
  /\b(special offer|limited time|discount|deal|save|savings|promotion)\b/gi,
  /\b(free|no.cost|zero.cost|bonus|gift|reward)\b/gi,
  /\b(best|top|#1|leading|superior|better than)\b/gi,
  /\$[\d,.]+\s*(off|savings?|discount|month)/gi,
];

const TRANSACTIONAL_SIGNALS = [
  /\b(appointment|confirm|reminder|receipt|order|account|password|verification|code)\b/gi,
  /\b(scheduled|booking|cancellation|update to your|your request)\b/gi,
];

const EDUCATIONAL_SIGNALS = [
  /\b(learn|understand|information|guide|tips?|how to|what is|FAQ|resources?)\b/gi,
  /\b(Medicare (basics|101|explained|overview)|enrollment period|open enrollment)\b/gi,
  /\bMedicare\.gov\b/gi,
];

export function classifyMessage(text: string): MessageCategory {
  let marketingScore = 0;
  let transactionalScore = 0;
  let educationalScore = 0;

  for (const pattern of MARKETING_SIGNALS) {
    const matches = text.match(pattern);
    if (matches) marketingScore += matches.length;
  }
  for (const pattern of TRANSACTIONAL_SIGNALS) {
    const matches = text.match(pattern);
    if (matches) transactionalScore += matches.length;
  }
  for (const pattern of EDUCATIONAL_SIGNALS) {
    const matches = text.match(pattern);
    if (matches) educationalScore += matches.length;
  }

  if (transactionalScore >= marketingScore && transactionalScore >= educationalScore) {
    return 'transactional';
  }
  if (educationalScore > marketingScore) {
    return 'educational';
  }
  return 'marketing';
}

// ─── Consent management ───────────────────────────────────────────────────────

export function getConsentState(contactId: string, channel: MessageChannel): ConsentRecord {
  const allConsent = loadFromStorage<Record<string, ConsentRecord>>(CONSENT_KEY, {});
  const key = `${contactId}:${channel}`;
  return (
    allConsent[key] ?? {
      contactId,
      channel,
      status: 'unknown',
      lastUpdated: new Date().toISOString(),
    }
  );
}

export function setConsentState(
  contactId: string,
  channel: MessageChannel,
  status: ConsentStatus,
  method?: string
): ConsentRecord {
  const allConsent = loadFromStorage<Record<string, ConsentRecord>>(CONSENT_KEY, {});
  const key = `${contactId}:${channel}`;
  const now = new Date().toISOString();

  const record: ConsentRecord = {
    contactId,
    channel,
    status,
    consentMethod: status === 'opted_in' ? method : allConsent[key]?.consentMethod,
    consentTimestamp: status === 'opted_in' ? now : allConsent[key]?.consentTimestamp,
    optOutTimestamp: status === 'opted_out' ? now : allConsent[key]?.optOutTimestamp,
    optOutMethod: status === 'opted_out' ? method : allConsent[key]?.optOutMethod,
    lastUpdated: now,
  };

  allConsent[key] = record;
  saveToStorage(CONSENT_KEY, allConsent);
  return record;
}

// ─── Template rendering ───────────────────────────────────────────────────────

function renderTemplate(template: MessageTemplate, mergeData: Record<string, string>): {
  rendered: string;
  violatingFields: string[];
} {
  const violatingFields: string[] = [];
  let rendered = template.body;

  // Find all merge field tokens
  const tokenPattern = /\{\{(\w+)\}\}/g;
  let match: RegExpExecArray | null;
  const tokensUsed = new Set<string>();

  // eslint-disable-next-line no-cond-assign
  while ((match = tokenPattern.exec(template.body)) !== null) {
    tokensUsed.add(match[1]);
  }

  for (const token of tokensUsed) {
    if (!template.allowedMergeFields.includes(token)) {
      violatingFields.push(token);
    }
    const value = mergeData[token] ?? `[${token}]`;
    rendered = rendered.replace(new RegExp(`\\{\\{${token}\\}\\}`, 'g'), value);
  }

  // Ensure required disclaimers are present
  for (const disclaimer of template.requiredDisclaimers) {
    if (!rendered.includes(disclaimer)) {
      rendered += `\n${disclaimer}`;
    }
  }

  return { rendered, violatingFields };
}

// ─── LLM content safety check ────────────────────────────────────────────────

function containsLlmGeneratedClaims(text: string): boolean {
  // Heuristic: look for patterns typical of LLM personalization that could insert claims
  const llmPatterns = [
    /\{[^}]+\}/g, // un-resolved template tokens
    /\[PERSONALIZE[^\]]*\]/gi,
    /\[INSERT[^\]]*\]/gi,
    /\[DYNAMIC[^\]]*\]/gi,
    /You (qualify|are eligible|have been selected|were chosen)/gi,
    /Your (area|zip code|location) (has|qualifies for|is eligible for)/gi,
  ];
  return llmPatterns.some(p => p.test(text));
}

// ─── Sequence factory ─────────────────────────────────────────────────────────

export function createSequence(
  params: {
    name: string;
    contactId: string;
    vertical: string;
    steps: Array<{
      templateId: string;
      channel: MessageChannel;
      delayHours: number;
      mergeData?: Record<string, string>;
    }>;
  }
): OutreachSequence {
  const sequenceId = `seq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  const steps: SequenceStep[] = params.steps.map((s, idx) => ({
    stepId: `${sequenceId}_step_${idx + 1}`,
    stepOrder: idx + 1,
    templateId: s.templateId,
    channel: s.channel,
    delayHours: s.delayHours,
    category: 'educational', // will be resolved at send time
    status: 'pending',
    mergeData: s.mergeData ?? {},
  }));

  const sequence: OutreachSequence = {
    sequenceId,
    name: params.name,
    contactId: params.contactId,
    vertical: params.vertical,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    steps,
    totalSent: 0,
    totalFailed: 0,
    totalBlocked: 0,
  };

  saveSequence(sequence);
  return sequence;
}

function saveSequence(sequence: OutreachSequence): void {
  const sequences = loadFromStorage<Record<string, OutreachSequence>>(SEQUENCES_KEY, {});
  sequences[sequence.sequenceId] = sequence;
  saveToStorage(SEQUENCES_KEY, sequences);
}

export function getSequence(sequenceId: string): OutreachSequence | null {
  const sequences = loadFromStorage<Record<string, OutreachSequence>>(SEQUENCES_KEY, {});
  return sequences[sequenceId] ?? null;
}

export function listSequences(): OutreachSequence[] {
  const sequences = loadFromStorage<Record<string, OutreachSequence>>(SEQUENCES_KEY, {});
  return Object.values(sequences).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

// ─── Step executor ────────────────────────────────────────────────────────────

export async function executeStep(
  sequenceId: string,
  stepId: string
): Promise<MessageSendResult> {
  const sequence = getSequence(sequenceId);
  if (!sequence) {
    return { stepId, status: 'failed', blockedReason: 'Sequence not found.' };
  }

  const step = sequence.steps.find(s => s.stepId === stepId);
  if (!step) {
    return { stepId, status: 'failed', blockedReason: 'Step not found.' };
  }

  if (step.status === 'sent' || step.status === 'skipped') {
    return { stepId, status: step.status };
  }

  // ── 1. Consent check ──────────────────────────────────────────────────────
  const consent = getConsentState(sequence.contactId, step.channel);
  if (consent.status === 'opted_out') {
    return markStepBlocked(sequence, step, 'Contact has opted out of this channel.');
  }
  if (consent.status === 'unknown' || consent.status === 'pending') {
    return markStepBlocked(sequence, step, 'Consent status unknown or pending. Cannot send without confirmed opt-in.');
  }

  // ── 2. Template validation ─────────────────────────────────────────────────
  const template = getTemplate(step.templateId);
  if (!template) {
    return markStepFailed(sequence, step, `Template ${step.templateId} not found.`);
  }
  if (!template.isApproved) {
    return markStepBlocked(sequence, step, `Template "${template.name}" is not approved for sending.`);
  }

  // ── 3. Category classification ─────────────────────────────────────────────
  const detectedCategory = classifyMessage(template.body);
  step.category = detectedCategory;

  // ── 4. Channel policy enforcement for marketing SMS ────────────────────────
  if (step.channel === 'sms' && detectedCategory === 'marketing') {
    return markStepBlocked(
      sequence,
      step,
      'Marketing SMS blocked: channel policy prohibits marketing content without explicit prior written consent via compliant collection method. Use approved transactional or educational templates only.'
    );
  }

  // ── 5. Render template with merge data ────────────────────────────────────
  const { rendered, violatingFields } = renderTemplate(template, step.mergeData ?? {});

  if (violatingFields.length > 0) {
    return markStepBlocked(
      sequence,
      step,
      `Unapproved merge fields detected: ${violatingFields.join(', ')}. Only approved fields may be dynamically inserted.`
    );
  }

  // ── 6. LLM claim injection check ──────────────────────────────────────────
  if (containsLlmGeneratedClaims(rendered)) {
    return markStepBlocked(
      sequence,
      step,
      'Dynamic LLM content detected in rendered message. Blocked to prevent unapproved claim injection.'
    );
  }

  // ── 7. Mark as sent and log ───────────────────────────────────────────────
  const sentAt = new Date().toISOString();
  step.status = 'sent';
  step.sentAt = sentAt;
  step.renderedMessage = rendered;
  sequence.totalSent += 1;
  sequence.updatedAt = sentAt;

  // Append to immutable send log
  appendSendLog({
    logId: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    sequenceId,
    stepId,
    contactId: sequence.contactId,
    channel: step.channel,
    category: step.category,
    templateId: step.templateId,
    renderedMessage: rendered,
    status: 'sent',
    timestamp: sentAt,
  });

  saveSequence(sequence);

  return { stepId, status: 'sent', renderedMessage: rendered, sentAt };
}

function markStepBlocked(
  sequence: OutreachSequence,
  step: SequenceStep,
  reason: string
): MessageSendResult {
  step.status = 'blocked';
  step.failureReason = reason;
  sequence.totalBlocked += 1;
  sequence.updatedAt = new Date().toISOString();

  appendSendLog({
    logId: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    sequenceId: sequence.sequenceId,
    stepId: step.stepId,
    contactId: sequence.contactId,
    channel: step.channel,
    category: step.category,
    templateId: step.templateId,
    renderedMessage: '',
    status: 'blocked',
    timestamp: new Date().toISOString(),
    blockedReason: reason,
  });

  saveSequence(sequence);
  return { stepId: step.stepId, status: 'blocked', blockedReason: reason };
}

function markStepFailed(
  sequence: OutreachSequence,
  step: SequenceStep,
  reason: string
): MessageSendResult {
  step.status = 'failed';
  step.failureReason = reason;
  sequence.totalFailed += 1;
  sequence.updatedAt = new Date().toISOString();
  saveSequence(sequence);
  return { stepId: step.stepId, status: 'failed', blockedReason: reason };
}
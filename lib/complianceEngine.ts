// lib/complianceEngine.ts

export type Channel = 'ad' | 'sms' | 'voice' | 'landing_page';
export type Disposition = 'approve' | 'escalate' | 'block';

export interface ClaimClassification {
  claimType: string;
  phrase: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
  suggestedFix?: string;
}

export interface ComplianceScore {
  score: number;
  flaggedPhrases: ClaimClassification[];
  requiredDisclaimers: string[];
  disposition: Disposition;
  suggestions: string[];
  channelViolations: string[];
  timestamp: string;
}

export interface ChannelPolicy {
  channel: Channel;
  allowedContentTypes: string[];
  prohibitedPhrases: string[];
  requiredElements: string[];
  maxClaimsAllowed: number;
  requiresApprovedTemplate: boolean;
  llmPersonalizationAllowed: boolean;
  notes: string;
}

// ─── Medicare-specific claim patterns ────────────────────────────────────────

const MEDICARE_CLAIM_PATTERNS: Array<{
  pattern: RegExp;
  claimType: string;
  severity: ClaimClassification['severity'];
  explanation: string;
}> = [
  // Benefits claims
  {
    pattern: /\b(get|receive|qualify for|earn|unlock)\s+(free|no.cost|zero.cost|extra|additional)\s+(benefits?|coverage|dental|vision|hearing|transportation|meals?|allowance)/gi,
    claimType: 'benefit_claim',
    severity: 'high',
    explanation: 'Unqualified benefit claims require substantiation and plan-specific context.',
  },
  {
    pattern: /\b(covers?|includes?|pays? for)\s+(dental|vision|hearing|prescription|drug|gym|fitness|over.the.counter|OTC)/gi,
    claimType: 'benefit_claim',
    severity: 'medium',
    explanation: 'Coverage claims must be plan-specific and cannot be generalized.',
  },
  // Premium claims
  {
    pattern: /\$0\s*(premium|plan|copay|deductible|cost)/gi,
    claimType: 'premium_claim',
    severity: 'high',
    explanation: '$0 premium claims require "as low as" qualifier and availability disclosure.',
  },
  {
    pattern: /\b(low|lower|lowest|reduce|save on|cut)\s+(your\s+)?(premium|cost|payment|monthly)/gi,
    claimType: 'premium_claim',
    severity: 'medium',
    explanation: 'Premium reduction claims require comparative baseline and plan availability.',
  },
  // Cost savings claims
  {
    pattern: /save\s+(up to\s+)?\$[\d,]+(\s+per\s+(year|month|day))?/gi,
    claimType: 'cost_savings',
    severity: 'high',
    explanation: 'Dollar savings claims require substantiation with specific plan data.',
  },
  {
    pattern: /\b(save|saving|savings|reduce costs?|cut costs?|lower costs?)\s+(on|with|using|by switching)/gi,
    claimType: 'cost_savings',
    severity: 'medium',
    explanation: 'Cost savings claims must be substantiated and plan-specific.',
  },
  // Star rating claims
  {
    pattern: /(\d(\.\d)?)\s*star\s*(rating|plan|rated|quality)/gi,
    claimType: 'star_rating',
    severity: 'high',
    explanation: 'Star rating claims must include CMS source, measurement period, and plan specificity.',
  },
  {
    pattern: /\b(top.rated|highest.rated|best.rated|5.star|4.star|4\.5.star)\s*(plan|coverage|medicare|insurance)/gi,
    claimType: 'star_rating',
    severity: 'high',
    explanation: 'Comparative star rating superlatives require CMS citation and temporal qualification.',
  },
  // Comparison claims
  {
    pattern: /\b(better than|superior to|outperforms?|beats?|unlike|compared to|vs\.?)\s+(original medicare|medicare (advantage|supplement|part [a-d])|other plans?)/gi,
    claimType: 'comparison',
    severity: 'critical',
    explanation: 'Direct Medicare plan comparisons require explicit substantiation and may violate CMS guidelines.',
  },
  {
    pattern: /\b(best|#1|number one|top|leading|most popular)\s+(medicare|plan|coverage|insurance|provider)/gi,
    claimType: 'comparison',
    severity: 'high',
    explanation: 'Superlative claims require verifiable third-party substantiation.',
  },
  // Enrollment urgency / scarcity
  {
    pattern: /\b(limited time|act now|don't wait|last chance|deadline|spots? (remaining|available|left)|enroll (today|now|immediately))/gi,
    claimType: 'urgency_scarcity',
    severity: 'medium',
    explanation: 'Urgency/scarcity language must be factually accurate and not artificially manufactured.',
  },
  // Guarantee claims
  {
    pattern: /\b(guaranteed|guarantee|promise|assured|certain(ly)?)\s+(coverage|approval|acceptance|benefits?|savings?)/gi,
    claimType: 'guarantee',
    severity: 'critical',
    explanation: 'Guaranteed coverage claims are prohibited unless the plan is genuinely guaranteed issue.',
  },
  // Government affiliation
  {
    pattern: /\b(government|federal|CMS|Medicare\.gov|Social Security)\s+(approved|sponsored|endorsed|authorized|affiliated|program)/gi,
    claimType: 'government_affiliation',
    severity: 'critical',
    explanation: 'Implied government affiliation or endorsement is prohibited by CMS.',
  },
  {
    pattern: /\bnot connected with\b|\bnot affiliated with\b/gi,
    claimType: 'disclaimer_present',
    severity: 'low',
    explanation: 'Required non-affiliation disclaimer detected — positive signal.',
  },
];

// ─── Required disclaimers by context ─────────────────────────────────────────

const DISCLAIMER_TRIGGERS: Array<{
  trigger: RegExp;
  disclaimer: string;
}> = [
  {
    trigger: /medicare advantage|MA plan|part c/gi,
    disclaimer: '[Plan Name] is a Medicare Advantage plan with a Medicare contract. Enrollment in [Plan Name] depends on contract renewal.',
  },
  {
    trigger: /\$0 premium|\$0 copay|zero.cost premium/gi,
    disclaimer: '$0 premium plans may not be available in all areas. Other costs such as copays and deductibles may apply.',
  },
  {
    trigger: /star rating|\d\.?\d?\s*star/gi,
    disclaimer: 'Every year, Medicare evaluates plans based on a 5-star rating system. [Year] Star Rating.',
  },
  {
    trigger: /save|savings|reduce.*cost|lower.*premium/gi,
    disclaimer: 'Savings may vary. Compare plans carefully. Benefits vary by plan and location.',
  },
  {
    trigger: /dental|vision|hearing/gi,
    disclaimer: 'Not all plans include dental, vision, and/or hearing benefits. Benefit availability varies by plan.',
  },
  {
    trigger: /call|phone|speak with|talk to/gi,
    disclaimer: 'We do not offer every plan available in your area. Currently we represent [X] organizations which offer [Y] products in your area.',
  },
  {
    trigger: /enroll|sign up|join|coverage start/gi,
    disclaimer: 'Limitations, copayments, and restrictions may apply. Benefits, premiums, and/or copayments/coinsurance may change on January 1 of each year.',
  },
];

const UNIVERSAL_MEDICARE_DISCLAIMERS = [
  'Not connected with or endorsed by the U.S. government or the federal Medicare program.',
  'This is a solicitation for insurance.',
];

// ─── Channel policy packs ─────────────────────────────────────────────────────

export const CHANNEL_POLICIES: Record<Channel, ChannelPolicy> = {
  ad: {
    channel: 'ad',
    allowedContentTypes: ['awareness', 'consideration', 'enrollment'],
    prohibitedPhrases: [
      'guaranteed approval',
      'government program',
      'free money',
      'unlimited benefits',
    ],
    requiredElements: [
      'Non-affiliation disclaimer',
      'Plan availability qualifier',
      'Licensed insurance agent disclosure',
    ],
    maxClaimsAllowed: 3,
    requiresApprovedTemplate: false,
    llmPersonalizationAllowed: false,
    notes: 'CMS requires all Medicare ads to include non-affiliation disclosure. Benefit claims must be plan-specific.',
  },
  sms: {
    channel: 'sms',
    allowedContentTypes: ['transactional', 'educational'],
    prohibitedPhrases: [
      'guaranteed',
      'free benefits',
      'save $',
      'limited time',
      'act now',
      'best plan',
      'top rated',
    ],
    requiredElements: [
      'STOP opt-out instruction',
      'Sender identification',
      'Message frequency disclosure',
    ],
    maxClaimsAllowed: 0,
    requiresApprovedTemplate: true,
    llmPersonalizationAllowed: false,
    notes: 'TCPA + CMS: Marketing SMS strictly prohibited without prior written consent. Only transactional and educational content allowed on standard flows. No dynamic LLM claims.',
  },
  voice: {
    channel: 'voice',
    allowedContentTypes: ['transactional', 'educational', 'enrollment_support'],
    prohibitedPhrases: [
      'you qualify',
      'you are approved',
      'guaranteed coverage',
      'government benefit',
    ],
    requiredElements: [
      'Agent name and license number',
      'Company name',
      'Call recording disclosure (state-dependent)',
      'Non-affiliation statement',
    ],
    maxClaimsAllowed: 2,
    requiresApprovedTemplate: false,
    llmPersonalizationAllowed: false,
    notes: 'Voice scripts must be pre-approved. Agent must identify themselves and their company. No LLM real-time claim generation.',
  },
  landing_page: {
    channel: 'landing_page',
    allowedContentTypes: ['awareness', 'consideration', 'lead_capture', 'enrollment'],
    prohibitedPhrases: [
      'government approved',
      'guaranteed acceptance',
      'unlimited',
    ],
    requiredElements: [
      'Non-affiliation disclaimer (above fold or persistent footer)',
      'Privacy policy link',
      'Terms & conditions link',
      'Licensed agent/company disclosure',
      'Plan availability qualifier',
    ],
    maxClaimsAllowed: 5,
    requiresApprovedTemplate: false,
    llmPersonalizationAllowed: false,
    notes: 'Landing pages require persistent disclaimer placement. Star ratings must include CMS source and year. All claims must link to substantiation.',
  },
};

// ─── Rule-based classifier ────────────────────────────────────────────────────

export function classifyClaims(text: string): ClaimClassification[] {
  const results: ClaimClassification[] = [];
  const seenPhrases = new Set<string>();

  for (const rule of MEDICARE_CLAIM_PATTERNS) {
    const matches = text.matchAll(rule.pattern);
    for (const match of matches) {
      const phrase = match[0].trim();
      const key = `${rule.claimType}:${phrase.toLowerCase()}`;
      if (seenPhrases.has(key)) continue;
      seenPhrases.add(key);

      // Skip disclaimer_present — that's a positive signal, not a violation
      if (rule.claimType === 'disclaimer_present') continue;

      results.push({
        claimType: rule.claimType,
        phrase,
        severity: rule.severity,
        explanation: rule.explanation,
        suggestedFix: getSuggestedFix(rule.claimType, phrase),
      });
    }
  }

  return results;
}

function getSuggestedFix(claimType: string, phrase: string): string {
  const fixes: Record<string, string> = {
    benefit_claim: `Replace "${phrase}" with a plan-specific, qualified statement: "Eligible members of [Plan Name] may receive [benefit]."`,
    premium_claim: `Replace "${phrase}" with: "Plans available as low as $0/month in select areas. Other costs apply."`,
    cost_savings: `Remove or replace "${phrase}" with a verifiable, plan-specific savings figure sourced from CMS data.`,
    star_rating: `Add CMS citation: "${phrase} (CMS Star Rating, [Year], [Plan Name])"`,
    comparison: `Remove direct comparison "${phrase}". Use: "Compare your options at Medicare.gov."`,
    urgency_scarcity: `Ensure urgency is factually accurate, or remove "${phrase}" if it's artificially manufactured.`,
    guarantee: `Replace "${phrase}" with: "Coverage subject to eligibility requirements and plan availability."`,
    government_affiliation: `Remove "${phrase}" and add explicit disclaimer: "Not connected with or endorsed by the U.S. government."`,
  };
  return fixes[claimType] ?? `Review "${phrase}" for compliance with CMS Medicare marketing guidelines.`;
}

// ─── Required disclaimers detector ───────────────────────────────────────────

export function getRequiredDisclaimers(text: string, channel: Channel): string[] {
  const disclaimers = new Set<string>(UNIVERSAL_MEDICARE_DISCLAIMERS);

  for (const { trigger, disclaimer } of DISCLAIMER_TRIGGERS) {
    if (trigger.test(text)) {
      disclaimers.add(disclaimer);
    }
  }

  // Channel-specific required elements
  const policy = CHANNEL_POLICIES[channel];
  for (const element of policy.requiredElements) {
    disclaimers.add(element);
  }

  return Array.from(disclaimers);
}

// ─── Channel policy getter ────────────────────────────────────────────────────

export function getChannelPolicy(channel: Channel): ChannelPolicy {
  return CHANNEL_POLICIES[channel];
}

// ─── Scoring engine ───────────────────────────────────────────────────────────

export function scoreCompliance(
  text: string,
  channel: Channel,
  flaggedClaims: ClaimClassification[],
  gptSuggestions: string[] = []
): ComplianceScore {
  const policy = CHANNEL_POLICIES[channel];
  let score = 100;
  const channelViolations: string[] = [];

  // Deduct per flagged claim by severity
  const severityDeductions: Record<ClaimClassification['severity'], number> = {
    low: 2,
    medium: 8,
    high: 15,
    critical: 25,
  };

  for (const claim of flaggedClaims) {
    score -= severityDeductions[claim.severity];
  }

  // Channel-specific violation checks
  if (policy.requiresApprovedTemplate) {
    // Mark as violation — content needs template validation
    channelViolations.push(`Channel "${channel}" requires pre-approved message templates.`);
    score -= 20;
  }

  if (!policy.llmPersonalizationAllowed) {
    const dynamicPatterns = /\{[^}]+\}|\[PERSONALIZE\]|\[INSERT\]/gi;
    if (dynamicPatterns.test(text)) {
      channelViolations.push('Dynamic LLM personalization tokens detected. This channel prohibits unreviewed dynamic claims.');
      score -= 15;
    }
  }

  // Check claim count vs. policy
  const marketingClaims = flaggedClaims.filter(c =>
    ['benefit_claim', 'premium_claim', 'cost_savings', 'star_rating', 'comparison'].includes(c.claimType)
  );
  if (marketingClaims.length > policy.maxClaimsAllowed) {
    channelViolations.push(
      `${marketingClaims.length} marketing claims detected. Channel "${channel}" allows a maximum of ${policy.maxClaimsAllowed}.`
    );
    score -= (marketingClaims.length - policy.maxClaimsAllowed) * 5;
  }

  // Check for prohibited phrases in channel policy
  for (const prohibited of policy.prohibitedPhrases) {
    if (text.toLowerCase().includes(prohibited.toLowerCase())) {
      channelViolations.push(`Prohibited phrase detected for channel "${channel}": "${prohibited}"`);
      score -= 10;
    }
  }

  score = Math.max(0, Math.min(100, score));

  // Determine disposition
  let disposition: Disposition;
  if (score >= 80) {
    disposition = 'approve';
  } else if (score >= 50) {
    disposition = 'escalate';
  } else {
    disposition = 'block';
  }

  // Override: any critical violation = block
  if (flaggedClaims.some(c => c.severity === 'critical')) {
    disposition = 'block';
    score = Math.min(score, 49);
  }

  const requiredDisclaimers = getRequiredDisclaimers(text, channel);

  const suggestions: string[] = [
    ...gptSuggestions,
    ...flaggedClaims.map(c => c.suggestedFix).filter((s): s is string => !!s),
  ];

  return {
    score,
    flaggedPhrases: flaggedClaims,
    requiredDisclaimers,
    disposition,
    suggestions: [...new Set(suggestions)],
    channelViolations,
    timestamp: new Date().toISOString(),
  };
}
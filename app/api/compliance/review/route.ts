// app/api/compliance/review/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  classifyClaims,
  scoreCompliance,
  getRequiredDisclaimers,
  getChannelPolicy,
  type Channel,
  type ComplianceScore,
} from '@/lib/complianceEngine';

export const runtime = 'edge';

interface ReviewRequest {
  content: string;
  channel: Channel;
  vertical: string;
}

interface ReviewResponse {
  score: number;
  flaggedPhrases: ComplianceScore['flaggedPhrases'];
  requiredDisclaimers: string[];
  disposition: ComplianceScore['disposition'];
  suggestions: string[];
  channelViolations: string[];
  gptAnalysis?: string;
  timestamp: string;
}

// ─── GPT analysis helper ──────────────────────────────────────────────────────

async function getGptComplianceAnalysis(
  content: string,
  channel: Channel,
  vertical: string,
  ruleBasedFlags: string[],
  apiKey: string
): Promise<{ suggestions: string[]; additionalFlags: string[]; narrative: string }> {
  const systemPrompt = `You are a Medicare marketing compliance expert with deep knowledge of CMS Medicare Marketing Guidelines (MMG), TCPA regulations, and FTC advertising standards.

Your task: analyze the provided marketing content for compliance issues specific to the Medicare/health insurance vertical.

Channel: ${channel}
Vertical: ${vertical}

Focus on:
1. CMS-prohibited claims (guaranteed coverage, government affiliation, unsubstantiated benefit claims)
2. Channel-specific violations (e.g., marketing SMS without consent, unapproved voice scripts)
3. Missing required disclosures
4. Misleading or deceptive language patterns
5. Star rating citation requirements
6. Prior written consent requirements for marketing outreach

Rule-based system already flagged: ${ruleBasedFlags.length > 0 ? ruleBasedFlags.join('; ') : 'No flags from rule engine'}

Return a JSON object only (no markdown, no preamble) with this exact shape:
{
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2"],
  "additionalFlags": ["any additional compliance issues not caught by the rule engine"],
  "narrative": "2-3 sentence plain-English summary of the compliance posture of this content"
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
       
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 1000,
      response_format: { type: 'json_object' },
      messages: [
                { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Please analyze this ${channel} content for Medicare marketing compliance:\n\n---\n${content}\n---`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content ?? '{}';
  try {
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      suggestions: [],
      additionalFlags: [],
      narrative: rawText.slice(0, 500),
    };
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse<ReviewResponse | { error: string }>> {
  let body: ReviewRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { content, channel, vertical } = body;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: '"content" is required and must be a non-empty string.' }, { status: 400 });
  }

  const validChannels: Channel[] = ['ad', 'sms', 'voice', 'landing_page'];
  if (!channel || !validChannels.includes(channel)) {
    return NextResponse.json(
      { error: `"channel" must be one of: ${validChannels.join(', ')}` },
      { status: 400 }
    );
  }

  if (!vertical || typeof vertical !== 'string') {
    return NextResponse.json({ error: '"vertical" is required.' }, { status: 400 });
  }

  // ── Step 1: Rule-based classification ───────────────────────────────────────
  const flaggedClaims = classifyClaims(content);
  const requiredDisclaimers = getRequiredDisclaimers(content, channel);

  // ── Step 2: GPT analysis (optional — gracefully degrades) ─────────────────
  let gptSuggestions: string[] = [];
  let gptNarrative: string | undefined;

  const apiKey = process.env.OPENAI_API_KEY ?? '';

  if (apiKey) {
    try {
      const ruleFlags = flaggedClaims.map(f => `${f.claimType}: "${f.phrase}"`);
      const gptResult = await getGptComplianceAnalysis(content, channel, vertical, ruleFlags, apiKey);
      gptSuggestions = [
        ...(gptResult.suggestions ?? []),
        ...(gptResult.additionalFlags ?? []),
      ];
      gptNarrative = gptResult.narrative;
    } catch (e) {
      console.error('[compliance/review] GPT analysis failed, continuing with rule-based only:', e);
    }
  }

  // ── Step 3: Score ─────────────────────────────────────────────────────────
  const complianceResult = scoreCompliance(content, channel, flaggedClaims, gptSuggestions);

  const responsePayload: ReviewResponse = {
    score: complianceResult.score,
    flaggedPhrases: complianceResult.flaggedPhrases,
    requiredDisclaimers: complianceResult.requiredDisclaimers,
    disposition: complianceResult.disposition,
    suggestions: complianceResult.suggestions,
    channelViolations: complianceResult.channelViolations,
    gptAnalysis: gptNarrative,
    timestamp: complianceResult.timestamp,
  };

  return NextResponse.json(responsePayload, { status: 200 });
}

// ─── GET: Channel policy info ────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get('channel') as Channel | null;

  if (!channel) {
    return NextResponse.json(
      { error: 'Pass ?channel=ad|sms|voice|landing_page' },
      { status: 400 }
    );
  }

  const validChannels: Channel[] = ['ad', 'sms', 'voice', 'landing_page'];
  if (!validChannels.includes(channel)) {
    return NextResponse.json(
      { error: `Invalid channel. Must be one of: ${validChannels.join(', ')}` },
      { status: 400 }
    );
  }

  const policy = getChannelPolicy(channel);
  return NextResponse.json(policy, { status: 200 });
}
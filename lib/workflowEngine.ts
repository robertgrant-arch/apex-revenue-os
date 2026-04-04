// lib/workflowEngine.ts

export type NodeStatus = 'idle' | 'running' | 'completed' | 'error' | 'waiting_approval' | 'skipped';

export type WorkflowNodeId =
  | 'brief_intake'
  | 'compliance_retrieval'
  | 'creative_planning'
  | 'copy_generation'
  | 'image_generation'
  | 'policy_enforcement'
  | 'human_approval'
  | 'publishing'
  | 'measurement';

export interface WorkflowTransition {
  fromNode: WorkflowNodeId;
  toNode: WorkflowNodeId;
  timestamp: string;
  durationMs: number;
  metadata?: Record<string, unknown>;
}

export interface WorkflowNodeState {
  nodeId: WorkflowNodeId;
  status: NodeStatus;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  output?: Record<string, unknown>;
  retryCount: number;
}

export interface WorkflowState {
  workflowId: string;
  workflowName: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  currentNodeId: WorkflowNodeId | null;
  nodes: Record<WorkflowNodeId, WorkflowNodeState>;
  transitions: WorkflowTransition[];
  context: WorkflowContext;
  checkpointVersion: number;
}

export interface WorkflowContext {
  // Brief intake
  brief?: {
    vertical: string;
    channel: string;
    targetAudience: string;
    campaign: string;
    objective: string;
    keyMessages: string[];
  };
  // Compliance
  complianceData?: {
    retrievedGuidelines: string[];
    applicableRegulations: string[];
    channelPolicies: Record<string, unknown>;
  };
  // Creative planning
  creativePlan?: {
    themes: string[];
    angles: string[];
    tone: string;
    callToAction: string;
  };
  // Generated copy
  generatedCopy?: {
    headline: string;
    body: string;
    cta: string;
    variants: string[];
  };
  // Image generation
  generatedImages?: {
    urls: string[];
    prompts: string[];
    selectedUrl?: string;
  };
  // Policy enforcement
  policyEnforcement?: {
    score: number;
    flaggedPhrases: string[];
    requiredDisclaimers: string[];
    disposition: 'approve' | 'escalate' | 'block';
    revisedCopy?: string;
  };
  // Human approval
  humanApproval?: {
    requestedAt: string;
    reviewerId?: string;
    decision?: 'approved' | 'rejected' | 'revision_requested';
    notes?: string;
    decidedAt?: string;
  };
  // Publishing
  publishing?: {
    platform: string;
    publishedAt?: string;
    publishedUrl?: string;
    status: 'pending' | 'published' | 'failed';
  };
  // Measurement
  measurement?: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
    lastUpdated: string;
  };
  // Arbitrary extra context
  [key: string]: unknown;
}

export interface WorkflowNodeDefinition {
  id: WorkflowNodeId;
  label: string;
  description: string;
  requiredContext: (keyof WorkflowContext)[];
  outputContext: (keyof WorkflowContext)[];
  requiresHuman: boolean;
  maxRetries: number;
  timeoutMs: number;
  edges: WorkflowNodeId[]; // next possible nodes
}

// ─── Node definitions (the "graph") ──────────────────────────────────────────

export const WORKFLOW_NODES: Record<WorkflowNodeId, WorkflowNodeDefinition> = {
  brief_intake: {
    id: 'brief_intake',
    label: 'Brief Intake',
    description: 'Ingest and structure the campaign brief from the operator.',
    requiredContext: [],
    outputContext: ['brief'],
    requiresHuman: false,
    maxRetries: 1,
    timeoutMs: 10_000,
    edges: ['compliance_retrieval'],
  },
  compliance_retrieval: {
    id: 'compliance_retrieval',
    label: 'Compliance Retrieval',
    description: 'Retrieve applicable CMS guidelines, state regulations, and channel policies.',
    requiredContext: ['brief'],
    outputContext: ['complianceData'],
    requiresHuman: false,
    maxRetries: 2,
    timeoutMs: 15_000,
    edges: ['creative_planning'],
  },
  creative_planning: {
    id: 'creative_planning',
    label: 'Creative Planning',
    description: 'Generate creative themes, angles, and messaging strategy.',
    requiredContext: ['brief', 'complianceData'],
    outputContext: ['creativePlan'],
    requiresHuman: false,
    maxRetries: 2,
    timeoutMs: 30_000,
    edges: ['copy_generation'],
  },
  copy_generation: {
    id: 'copy_generation',
    label: 'Copy Generation',
    description: 'Generate headline, body copy, and CTA variants.',
    requiredContext: ['brief', 'creativePlan'],
    outputContext: ['generatedCopy'],
    requiresHuman: false,
    maxRetries: 3,
    timeoutMs: 45_000,
    edges: ['image_generation', 'policy_enforcement'],
  },
  image_generation: {
    id: 'image_generation',
    label: 'Image Generation',
    description: 'Generate or select creative imagery assets.',
    requiredContext: ['creativePlan', 'generatedCopy'],
    outputContext: ['generatedImages'],
    requiresHuman: false,
    maxRetries: 2,
    timeoutMs: 60_000,
    edges: ['policy_enforcement'],
  },
  policy_enforcement: {
    id: 'policy_enforcement',
    label: 'Policy Enforcement',
    description: 'Run compliance scoring and enforce channel policies on all creative.',
    requiredContext: ['generatedCopy', 'complianceData'],
    outputContext: ['policyEnforcement'],
    requiresHuman: false,
    maxRetries: 1,
    timeoutMs: 20_000,
    edges: ['human_approval'],
  },
  human_approval: {
    id: 'human_approval',
    label: 'Human Approval',
    description: 'Compliance officer or marketing lead reviews and approves the creative.',
    requiredContext: ['policyEnforcement', 'generatedCopy'],
    outputContext: ['humanApproval'],
    requiresHuman: true,
    maxRetries: 0,
    timeoutMs: 86_400_000, // 24h
    edges: ['publishing', 'copy_generation'], // approved → publish, rejected → regenerate
  },
  publishing: {
    id: 'publishing',
    label: 'Publishing',
    description: 'Publish approved creative to target platform.',
    requiredContext: ['humanApproval', 'generatedCopy'],
    outputContext: ['publishing'],
    requiresHuman: false,
    maxRetries: 3,
    timeoutMs: 30_000,
    edges: ['measurement'],
  },
  measurement: {
    id: 'measurement',
    label: 'Measurement',
    description: 'Track and report on campaign performance metrics.',
    requiredContext: ['publishing'],
    outputContext: ['measurement'],
    requiresHuman: false,
    maxRetries: 5,
    timeoutMs: 10_000,
    edges: [], // terminal node
  },
};

// ─── Ordered execution sequence ───────────────────────────────────────────────

const EXECUTION_ORDER: WorkflowNodeId[] = [
  'brief_intake',
  'compliance_retrieval',
  'creative_planning',
  'copy_generation',
  'image_generation',
  'policy_enforcement',
  'human_approval',
  'publishing',
  'measurement',
];

// ─── Checkpoint helpers ───────────────────────────────────────────────────────

const CHECKPOINT_STORE_KEY = 'apex_workflow_checkpoints';

function loadCheckpoints(): Record<string, WorkflowState> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(CHECKPOINT_STORE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveCheckpoint(state: WorkflowState): void {
  if (typeof window === 'undefined') return;
  try {
    const checkpoints = loadCheckpoints();
    checkpoints[state.workflowId] = { ...state, checkpointVersion: state.checkpointVersion + 1 };
    localStorage.setItem(CHECKPOINT_STORE_KEY, JSON.stringify(checkpoints));
  } catch (e) {
    console.error('[WorkflowEngine] Checkpoint save failed:', e);
  }
}

export function loadWorkflow(workflowId: string): WorkflowState | null {
  const checkpoints = loadCheckpoints();
  return checkpoints[workflowId] ?? null;
}

export function listWorkflows(): WorkflowState[] {
  const checkpoints = loadCheckpoints();
  return Object.values(checkpoints).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function deleteWorkflow(workflowId: string): void {
  if (typeof window === 'undefined') return;
  const checkpoints = loadCheckpoints();
  delete checkpoints[workflowId];
  localStorage.setItem(CHECKPOINT_STORE_KEY, JSON.stringify(checkpoints));
}

// ─── Factory ──────────────────────────────────────────────────────────────────

function buildInitialNodeStates(): Record<WorkflowNodeId, WorkflowNodeState> {
  const states = {} as Record<WorkflowNodeId, WorkflowNodeState>;
  for (const nodeId of EXECUTION_ORDER) {
    states[nodeId] = {
      nodeId,
      status: 'idle',
      retryCount: 0,
    };
  }
  return states;
}

export function createWorkflow(
  workflowName: string,
  initialContext: Partial<WorkflowContext> = {}
): WorkflowState {
  const workflowId = `wf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date().toISOString();

  const state: WorkflowState = {
    workflowId,
    workflowName,
    createdAt: now,
    updatedAt: now,
    status: 'pending',
    currentNodeId: null,
    nodes: buildInitialNodeStates(),
    transitions: [],
    context: initialContext,
    checkpointVersion: 0,
  };

  saveCheckpoint(state);
  return state;
}

// ─── Node executor ────────────────────────────────────────────────────────────

type NodeExecutorFn = (state: WorkflowState) => Promise<{
  output: Record<string, unknown>;
  contextUpdate: Partial<WorkflowContext>;
}>;

// Default stub executors — replace with real implementations
const NODE_EXECUTORS: Partial<Record<WorkflowNodeId, NodeExecutorFn>> = {
  brief_intake: async (state) => {
    const brief = state.context.brief ?? {
      vertical: 'Medicare',
      channel: 'ad',
      targetAudience: 'Medicare-eligible adults 65+',
      campaign: 'Q4 Enrollment',
      objective: 'Lead generation',
      keyMessages: ['Affordable coverage', 'Trusted plans'],
    };
    return { output: { brief }, contextUpdate: { brief } };
  },

  compliance_retrieval: async (state) => {
    const channel = (state.context.brief?.channel ?? 'ad') as string;
    const retrievedGuidelines = [
      'CMS Medicare Marketing Guidelines (MMG) — Chapter 3',
      'TCPA Compliance Requirements',
      `Channel-specific policy: ${channel}`,
      'State-level insurance advertising regulations',
    ];
    const complianceData = {
      retrievedGuidelines,
      applicableRegulations: ['42 CFR Part 422', 'TCPA 47 U.S.C. § 227', 'FTC Act Section 5'],
      channelPolicies: {},
    };
    return { output: { complianceData }, contextUpdate: { complianceData } };
  },

  creative_planning: async (state) => {
    const creativePlan = {
      themes: ['Peace of mind', 'Trusted coverage', 'Affordable options'],
      angles: ['Benefit-forward', 'Testimonial', 'Educational'],
      tone: 'Warm, trustworthy, clear',
      callToAction: 'Compare plans in your area',
    };
    return { output: { creativePlan }, contextUpdate: { creativePlan } };
  },

  copy_generation: async (state) => {
    const generatedCopy = {
      headline: 'Find Medicare Coverage That Fits Your Life',
      body: 'Compare Medicare Advantage plans available in your area. Speak with a licensed agent today.',
      cta: 'Compare Plans Now',
      variants: [
        'Explore Medicare Plans Near You',
        'Speak With a Licensed Medicare Agent',
      ],
    };
    return { output: { generatedCopy }, contextUpdate: { generatedCopy } };
  },

  image_generation: async () => {
    const generatedImages = {
      urls: [],
      prompts: ['Warm photo of senior couple reviewing documents'],
      selectedUrl: undefined,
    };
    return { output: { generatedImages }, contextUpdate: { generatedImages } };
  },

  policy_enforcement: async (state) => {
    const policyEnforcement = {
      score: 85,
      flaggedPhrases: [],
      requiredDisclaimers: [
        'Not connected with or endorsed by the U.S. government or the federal Medicare program.',
        'This is a solicitation for insurance.',
      ],
      disposition: 'approve' as const,
    };
    return { output: { policyEnforcement }, contextUpdate: { policyEnforcement } };
  },

  human_approval: async (state) => {
    const humanApproval = {
      requestedAt: new Date().toISOString(),
      decision: undefined,
      notes: undefined,
      decidedAt: undefined,
    };
    // This node pauses — real approval happens via submitHumanApproval()
    return { output: { humanApproval }, contextUpdate: { humanApproval } };
  },

  publishing: async (state) => {
    const publishing = {
      platform: state.context.brief?.channel ?? 'unknown',
      publishedAt: new Date().toISOString(),
      publishedUrl: undefined,
      status: 'published' as const,
    };
    return { output: { publishing }, contextUpdate: { publishing } };
  },

  measurement: async () => {
    const measurement = {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0,
      conversionRate: 0,
      lastUpdated: new Date().toISOString(),
    };
    return { output: { measurement }, contextUpdate: { measurement } };
  },
};

// ─── Execution engine ─────────────────────────────────────────────────────────

export async function executeWorkflow(
  workflowId: string,
  onStateChange?: (state: WorkflowState) => void
): Promise<WorkflowState> {
  let state = loadWorkflow(workflowId);
  if (!state) throw new Error(`Workflow ${workflowId} not found.`);
  if (state.status === 'completed' || state.status === 'failed') return state;

  state.status = 'running';
  state.updatedAt = new Date().toISOString();
  saveCheckpoint(state);
  onStateChange?.(state);

  const startIndex = state.currentNodeId
    ? EXECUTION_ORDER.indexOf(state.currentNodeId)
    : 0;

  for (let i = startIndex; i < EXECUTION_ORDER.length; i++) {
    const nodeId = EXECUTION_ORDER[i];
    const nodeDef = WORKFLOW_NODES[nodeId];
    const nodeState = state.nodes[nodeId];

    // Skip already-completed nodes
    if (nodeState.status === 'completed') continue;

    // Human-in-the-loop pause
    if (nodeDef.requiresHuman && nodeState.status !== 'completed') {
      state = updateNodeStatus(state, nodeId, 'waiting_approval');
      state.currentNodeId = nodeId;
      state.status = 'paused';
      saveCheckpoint(state);
      onStateChange?.(state);
      return state;
    }

    state = updateNodeStatus(state, nodeId, 'running');
    state.currentNodeId = nodeId;
    saveCheckpoint(state);
    onStateChange?.(state);

    const executor = NODE_EXECUTORS[nodeId];
    if (!executor) {
      state = updateNodeStatus(state, nodeId, 'skipped', { note: 'No executor registered' });
      continue;
    }

    const nodeStartTime = Date.now();
    try {
      const result = await Promise.race([
        executor(state),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Node ${nodeId} timed out`)), nodeDef.timeoutMs)
        ),
      ]);

      // Merge context
      state.context = { ...state.context, ...result.contextUpdate };

      // Record transition
      if (i > 0 || state.transitions.length > 0) {
        const prevNodeId = i > 0 ? EXECUTION_ORDER[i - 1] : nodeId;
        state.transitions.push({
          fromNode: prevNodeId,
          toNode: nodeId,
          timestamp: new Date().toISOString(),
          durationMs: Date.now() - nodeStartTime,
          metadata: result.output,
        });
      }

      state = updateNodeStatus(state, nodeId, 'completed', result.output);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (nodeState.retryCount < nodeDef.maxRetries) {
        state.nodes[nodeId].retryCount += 1;
        i--; // retry same node
        continue;
      }
      state = updateNodeStatus(state, nodeId, 'error', { errorMessage });
      state.status = 'failed';
      state.updatedAt = new Date().toISOString();
      saveCheckpoint(state);
      onStateChange?.(state);
      return state;
    }

    saveCheckpoint(state);
    onStateChange?.(state);
  }

  state.status = 'completed';
  state.currentNodeId = null;
  state.updatedAt = new Date().toISOString();
  saveCheckpoint(state);
  onStateChange?.(state);
  return state;
}

function updateNodeStatus(
  state: WorkflowState,
  nodeId: WorkflowNodeId,
  status: NodeStatus,
  output?: Record<string, unknown>
): WorkflowState {
  const now = new Date().toISOString();
  return {
    ...state,
    updatedAt: now,
    nodes: {
      ...state.nodes,
      [nodeId]: {
        ...state.nodes[nodeId],
        status,
        startedAt: status === 'running' ? now : state.nodes[nodeId].startedAt,
        completedAt: status === 'completed' || status === 'error' ? now : state.nodes[nodeId].completedAt,
        errorMessage: output?.errorMessage as string | undefined,
        output: output ?? state.nodes[nodeId].output,
      },
    },
  };
}

// ─── Human approval submission ────────────────────────────────────────────────

export async function submitHumanApproval(
  workflowId: string,
  decision: 'approved' | 'rejected' | 'revision_requested',
  reviewerId: string,
  notes?: string,
  onStateChange?: (state: WorkflowState) => void
): Promise<WorkflowState> {
  let state = loadWorkflow(workflowId);
  if (!state) throw new Error(`Workflow ${workflowId} not found.`);

  state.context.humanApproval = {
    requestedAt: state.context.humanApproval?.requestedAt ?? new Date().toISOString(),
    reviewerId,
    decision,
    notes,
    decidedAt: new Date().toISOString(),
  };

  state = updateNodeStatus(state, 'human_approval', 'completed', {
    decision,
    reviewerId,
    notes,
  });

  saveCheckpoint(state);

  if (decision === 'approved') {
    return executeWorkflow(workflowId, onStateChange);
  } else if (decision === 'revision_requested') {
    // Reset copy_generation and downstream
    const resetNodes: WorkflowNodeId[] = [
      'copy_generation',
      'image_generation',
      'policy_enforcement',
      'human_approval',
    ];
    for (const nid of resetNodes) {
      state.nodes[nid].status = 'idle';
      state.nodes[nid].retryCount = 0;
      state.nodes[nid].output = undefined;
    }
    state.currentNodeId = 'copy_generation';
    state.status = 'running';
    saveCheckpoint(state);
    return executeWorkflow(workflowId, onStateChange);
  }

  // rejected → mark failed
  state.status = 'failed';
  state.updatedAt = new Date().toISOString();
  saveCheckpoint(state);
  onStateChange?.(state);
  return state;
}

// ─── Status query ─────────────────────────────────────────────────────────────

export function getWorkflowStatus(workflowId: string): WorkflowState | null {
  return loadWorkflow(workflowId);
}

// ─── Register custom node executor ───────────────────────────────────────────

export function registerNodeExecutor(nodeId: WorkflowNodeId, executor: NodeExecutorFn): void {
  NODE_EXECUTORS[nodeId] = executor;
}
export type ReadonlyDecisionContext = Readonly<{
  project: Readonly<Record<string, unknown>>;
  predictions: ReadonlyArray<Readonly<Record<string, unknown>>>;
  attributions: ReadonlyArray<Readonly<Record<string, unknown>>>;
  riskEvents: ReadonlyArray<Readonly<Record<string, unknown>>>;
  publicSignals: ReadonlyArray<Readonly<Record<string, unknown>>>;
}>;

export interface AgentMetadata {
  provider: string;
  model: string;
  executionTimeMs: number;
  requestId: string;
  agentVersion: string;
}

export interface AgentConfidence {
  score: number;
  reasoning: string;
}

export interface AgentRecommendation {
  action: string;
  impact: string;
}

export interface AgentResponse {
  agentName: string;
  findings: unknown;
  recommendations: AgentRecommendation[];
  confidence: AgentConfidence;
  metadata: AgentMetadata;
}

export interface Agent {
  readonly name: string;
  readonly version: string;
  execute(context: ReadonlyDecisionContext, requestId: string): Promise<AgentResponse>;
}

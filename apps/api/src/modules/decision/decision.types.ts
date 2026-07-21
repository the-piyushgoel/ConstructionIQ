import { AgentResponse, AgentRecommendation } from '../agents/agent.types';

export type DecisionPriority = 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';
export type DecisionSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface DecisionMetadata {
  generatedAt: string;
  decisionVersion: string;
  pipelineVersion: string;
  agentCount: number;
  successfulAgents: number;
  failedAgents: number;
}

export interface DecisionSummary {
  currentRisk: string;
  primaryConcern: string;
  highestImpactArea: string;
  overallConfidence: number;
}

export type ConflictCategory = 
  | 'RECOMMENDATION_CONFLICT' 
  | 'IMPACT_CONFLICT' 
  | 'ASSUMPTION_CONFLICT' 
  | 'CONFIDENCE_CONFLICT';

export interface Conflict {
  category: ConflictCategory;
  description: string;
  involvedAgents: string[];
}

export interface ConsensusResult {
  dominantRecommendation: AgentRecommendation | null;
  agreementRatio: number;
  averageConfidence: number;
  overallScore: number;
}

export interface DecisionPackage {
  prediction: Record<string, unknown>;
  attribution: Record<string, unknown>;
  agentResponses: AgentResponse[];
  consensus: ConsensusResult;
  conflicts: Conflict[];
  priority: DecisionPriority;
  summary: DecisionSummary;
  metadata: DecisionMetadata;
}

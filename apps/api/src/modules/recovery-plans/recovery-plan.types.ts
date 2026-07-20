export interface RecoveryPlanQuery {
  riskEventId?: string;
  projectId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GenerateRecoveryPlanInput {
  riskEventId: string;
  rankedOptions?: Record<string, unknown>;
  finalScoreBreakdown?: Record<string, unknown>;
  recommendationConfidence?: number;
  reasoningConfidence?: string;
}

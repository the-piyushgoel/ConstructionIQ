export interface PredictionQuery {
  riskEventId?: string;
  projectId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateSystemPredictionInput {
  riskEventId: string;
  score: number;
  horizonDays: number;
  modelConfig?: Record<string, unknown>;
}

export interface UpdateSystemPredictionInput {
  score?: number;
  horizonDays?: number;
  modelConfig?: Record<string, unknown>;
}

export interface CreateRiskEventInput {
  projectId: string;
  sourceSignalIds: string[];
  predictedScore?: number;
  horizonDays?: number;
  attributionBreakdown?: Record<string, unknown>;
}

export interface UpdateRiskEventInput {
  sourceSignalIds?: string[];
  predictedScore?: number;
  horizonDays?: number;
  attributionBreakdown?: Record<string, unknown>;
}

export interface RiskEventQuery {
  projectId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

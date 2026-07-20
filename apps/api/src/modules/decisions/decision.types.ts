export interface DecisionQuery {
  planId?: string;
  pmUserId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DecisionApproveInput {
  comments?: string;
  modifiedWeights?: Record<string, unknown>;
}

export interface DecisionRejectInput {
  comments?: string;
}

export type AIJobType = 
  | 'RiskPrediction'
  | 'RiskAttribution'
  | 'RecoveryGeneration'
  | 'Simulation'
  | 'DecisionSupport';

export interface AIJobPayload {
  type: AIJobType;
  projectId?: string;
  requestId: string;
  data: Record<string, unknown>;
}

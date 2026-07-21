export interface PublicSignal {
  source: string;
  type: string;
  value: unknown;
  confidence: number;
  timestamp: string;
}

export interface IntelligenceContext {
  projectDetails: Record<string, unknown>;
  identifiedRisks: unknown[];
  historicalPredictions: unknown[];
  publicSignals: PublicSignal[];
}

export interface ContextMetadata {
  completeness: number; // 0-100
  missingFields: string[];
  signalCount: number;
  timestamp: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AttributionOutput {
  rootCauses: string[];
  evidence: string[];
  confidence: number;
  recommendedNextAnalysis: string[];
}

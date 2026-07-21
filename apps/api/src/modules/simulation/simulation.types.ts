import { DecisionPackage } from '../decision/decision.types';

export interface SimulationImpact {
  costScore: number;
  scheduleScore: number;
  resourceScore: number;
  qualityScore: number;
  riskScore: number;
  overallScore: number;
}

export type ScenarioType = 'NO_ACTION' | 'RECOMMENDED_ACTION' | 'AGGRESSIVE_MITIGATION' | 'CONSERVATIVE_MITIGATION';

export interface SimulationScenario {
  id: string;
  type: ScenarioType;
  description: string;
  adjustments: Record<string, unknown>;
}

export interface SimulationResult {
  scenarioId: string;
  scenarioType: ScenarioType;
  impact: SimulationImpact;
  successProbability: number;
}

export interface RecoveryAction {
  id: string;
  description: string;
  category: string;
}

export interface RecoveryOption {
  type: string;
  description: string;
}

export interface RecoveryPlan {
  id: string;
  title: string;
  objective: string;
  actions: RecoveryAction[];
  expectedBenefits: string[];
  tradeOffs: string[];
  estimatedImpact: SimulationImpact;
  confidence: number;
  implementationPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface RecoveryMetadata {
  generatedAt: string;
  packageVersion: string;
  simulationVersion: string;
  totalScenarios: number;
  totalRecoveryPlans: number;
  recommendedPlanId: string | null;
  overallConfidence: number;
}

export interface ApprovalSummary {
  rationale: string;
}

export interface RecoveryPackage {
  decisionPackage: DecisionPackage;
  simulationResults: SimulationResult[];
  recoveryPlans: RecoveryPlan[];
  recommendedRecoveryPlan: RecoveryPlan | null;
  approvalSummary: ApprovalSummary | null;
  humanApprovalRequired: boolean;
  metadata: RecoveryMetadata;
}

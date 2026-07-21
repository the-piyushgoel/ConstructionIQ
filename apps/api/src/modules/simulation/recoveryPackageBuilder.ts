import { DecisionPackage } from '../decision/decision.types';
import { 
  SimulationResult, 
  RecoveryPlan, 
  RecoveryPackage, 
  ApprovalSummary 
} from './simulation.types';
import { RecoveryPlanSelector } from './recoveryPlanSelector';

export class RecoveryPackageBuilder {
  constructor(private readonly recoveryPlanSelector: RecoveryPlanSelector) {}

  build(
    decisionPackage: DecisionPackage,
    simulationResults: SimulationResult[],
    recoveryPlans: RecoveryPlan[]
  ): RecoveryPackage {
    const recommendedPlan = this.recoveryPlanSelector.select(recoveryPlans);

    let approvalSummary: ApprovalSummary | null = null;
    let overallConfidence = 50;

    if (recommendedPlan) {
      approvalSummary = {
        rationale: `Selected '${recommendedPlan.title}' because it offers the optimal balance of confidence (${recommendedPlan.confidence}%) and estimated impact (${recommendedPlan.estimatedImpact.overallScore}).`
      };
      overallConfidence = recommendedPlan.confidence;
    }

    return {
      decisionPackage,
      simulationResults,
      recoveryPlans,
      recommendedRecoveryPlan: recommendedPlan,
      approvalSummary,
      humanApprovalRequired: true,
      metadata: {
        generatedAt: new Date().toISOString(), // This timestamp is at package creation level, not used for scoring.
        packageVersion: decisionPackage.metadata.decisionVersion,
        simulationVersion: '1.0.0',
        totalScenarios: simulationResults.length,
        totalRecoveryPlans: recoveryPlans.length,
        recommendedPlanId: recommendedPlan?.id || null,
        overallConfidence
      }
    };
  }
}

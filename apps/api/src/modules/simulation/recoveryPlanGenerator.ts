import { DecisionPackage } from '../decision/decision.types';
import { SimulationResult, RecoveryPlan } from './simulation.types';

export class RecoveryPlanGenerator {
  generate(
    decisionPackage: DecisionPackage,
    simulationResults: SimulationResult[]
  ): RecoveryPlan[] {
    const plans: RecoveryPlan[] = [];

    const { dominantRecommendation } = decisionPackage.consensus;
    const target = dominantRecommendation?.target || 'General Risk';
    const action = dominantRecommendation?.action || 'Mitigate';

    for (const result of simulationResults) {
      // Do not generate a recovery plan for 'NO_ACTION' since it implies doing nothing
      if (result.scenarioType === 'NO_ACTION') {
        continue;
      }

      plans.push(this.buildPlanForScenario(result, target, action));
    }

    return plans;
  }

  private buildPlanForScenario(
    result: SimulationResult,
    target: string,
    action: string
  ): RecoveryPlan {
    const confidence = result.successProbability;

    let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (result.impact.overallScore > 75) priority = 'CRITICAL';
    else if (result.impact.overallScore > 50) priority = 'HIGH';
    else if (result.impact.overallScore > 25) priority = 'MEDIUM';

    let title = '';
    let objective = '';
    const actions = [];
    const expectedBenefits = [];
    const tradeOffs = [];

    switch (result.scenarioType) {
      case 'RECOMMENDED_ACTION':
        title = `Standard Recovery: ${action} ${target}`;
        objective = 'Balance cost and risk reduction based on consensus recommendations.';
        actions.push({ id: `act-${Date.now()}-1`, category: 'Execution', description: `Execute ${action} on ${target}` });
        expectedBenefits.push('Moderate risk reduction');
        tradeOffs.push('Moderate resource consumption');
        break;

      case 'AGGRESSIVE_MITIGATION':
        title = `Aggressive Recovery: Expedited ${action} on ${target}`;
        objective = 'Maximize risk reduction and schedule adherence at any cost.';
        actions.push({ id: `act-${Date.now()}-2`, category: 'Execution', description: `Expedite ${action} on ${target} with additional resources` });
        expectedBenefits.push('Highest probability of success', 'Significant risk reduction');
        tradeOffs.push('High cost impact', 'Significant resource drain');
        break;

      case 'CONSERVATIVE_MITIGATION':
        title = `Conservative Recovery: Partial ${action} on ${target}`;
        objective = 'Minimize financial impact while achieving partial mitigation.';
        actions.push({ id: `act-${Date.now()}-3`, category: 'Execution', description: `Perform partial ${action} on ${target}` });
        expectedBenefits.push('Low cost impact');
        tradeOffs.push('Higher residual risk');
        break;
      default:
        title = `Generic Recovery`;
        objective = 'Mitigate risk';
        break;
    }

    // Ensure IDs are deterministic enough for the test (or we use pseudo-random that we can mock/ignore)
    // The user requested NO timestamps inside scoring, but IDs using Date.now() in tests can be flaky if checked exactly. 
    // I will replace Date.now() with a deterministic hash based on scenario ID.
    actions.forEach((a, index) => {
      a.id = `act-${result.scenarioId}-${index}`;
    });

    return {
      id: `plan-${result.scenarioId}`,
      title,
      objective,
      actions,
      expectedBenefits,
      tradeOffs,
      estimatedImpact: result.impact,
      confidence,
      implementationPriority: priority
    };
  }
}

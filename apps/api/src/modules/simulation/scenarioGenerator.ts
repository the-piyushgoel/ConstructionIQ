import { DecisionPackage } from '../decision/decision.types';
import { SimulationScenario } from './simulation.types';

export class ScenarioGenerator {
  generate(decisionPackage: DecisionPackage): SimulationScenario[] {
    const baseAdjustments = this.extractAdjustments(decisionPackage);

    const idSuffix = decisionPackage.metadata?.decisionVersion || 'v1';

    return [
      {
        id: `sc-no-action-${idSuffix}`,
        type: 'NO_ACTION',
        description: 'Baseline scenario with no intervention',
        adjustments: {}
      },
      {
        id: `sc-recommended-${idSuffix}`,
        type: 'RECOMMENDED_ACTION',
        description: 'Executes the dominant recommendations from the decision package',
        adjustments: { ...baseAdjustments, level: 'normal' }
      },
      {
        id: `sc-aggressive-${idSuffix}`,
        type: 'AGGRESSIVE_MITIGATION',
        description: 'Prioritizes maximum risk reduction at the cost of resources',
        adjustments: { ...baseAdjustments, level: 'aggressive' }
      },
      {
        id: `sc-conservative-${idSuffix}`,
        type: 'CONSERVATIVE_MITIGATION',
        description: 'Minimizes resource usage with partial risk mitigation',
        adjustments: { ...baseAdjustments, level: 'conservative' }
      }
    ];
  }

  private extractAdjustments(decisionPackage: DecisionPackage): Record<string, unknown> {
    const adjustments: Record<string, unknown> = {};
    const { dominantRecommendation } = decisionPackage.consensus;
    
    if (dominantRecommendation) {
      adjustments.primaryTarget = dominantRecommendation.target;
      adjustments.primaryAction = dominantRecommendation.action;
    }
    
    return adjustments;
  }
}

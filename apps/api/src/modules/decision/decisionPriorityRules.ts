import { DecisionPriority } from './decision.types';
import { decisionConfig } from '../../config/decision';

export class DecisionPriorityRules {
  calculatePriority(baseSeverity: string, consensusScore: number): DecisionPriority {
    const { immediate, high, medium } = decisionConfig.priorityThresholds;

    if (baseSeverity === immediate.severity && consensusScore >= immediate.minConsensus) {
      return 'IMMEDIATE';
    }

    if (baseSeverity === immediate.severity || (baseSeverity === high.severity && consensusScore >= high.minConsensus)) {
      return 'HIGH';
    }

    if (baseSeverity === high.severity || (baseSeverity === medium.severity && consensusScore >= medium.minConsensus)) {
      return 'MEDIUM';
    }

    return 'LOW';
  }
}

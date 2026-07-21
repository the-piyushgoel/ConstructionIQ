import { RiskLevel } from './intelligence.types';
import { intelligenceConfig } from '../../config/intelligence';

export class RiskScorer {
  score(numericalScore: number): RiskLevel {
    const { thresholds } = this;
    
    if (numericalScore <= thresholds.lowMax) {
      return 'LOW';
    }
    if (numericalScore <= thresholds.mediumMax) {
      return 'MEDIUM';
    }
    if (numericalScore <= thresholds.highMax) {
      return 'HIGH';
    }
    return 'CRITICAL';
  }

  private get thresholds() {
    return intelligenceConfig.riskThresholds;
  }
}

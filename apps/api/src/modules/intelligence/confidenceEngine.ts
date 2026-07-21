import { intelligenceConfig } from '../../config/intelligence';

export class ConfidenceEngine {
  calculate(
    aiConfidence: number,
    dataCompleteness: number,
    signalQuality: number,
    historicalConsistency: number
  ): number {
    const { weights } = this;
    
    const score = 
      (aiConfidence * weights.aiConfidence) +
      (dataCompleteness * weights.dataCompleteness) +
      (signalQuality * weights.signalQuality) +
      (historicalConsistency * weights.historicalConsistency);

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  private get weights() {
    return intelligenceConfig.confidenceWeights;
  }
}

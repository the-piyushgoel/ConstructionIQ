import { ConsensusResult, DecisionSummary } from './decision.types';

export class DecisionSummaryBuilder {
  buildSummary(prediction: Record<string, unknown>, consensus: ConsensusResult): DecisionSummary {
    const score = typeof prediction?.score === 'number' ? prediction.score : 0;
    const highestRisk = score > 80 ? 'CRITICAL RISK' : score > 50 ? 'ELEVATED RISK' : 'LOW RISK';
    
    return {
      currentRisk: highestRisk,
      primaryConcern: consensus.dominantRecommendation ? consensus.dominantRecommendation.action : 'No dominant recommendation',
      highestImpactArea: consensus.dominantRecommendation ? consensus.dominantRecommendation.target : 'N/A',
      overallConfidence: consensus.overallScore
    };
  }
}

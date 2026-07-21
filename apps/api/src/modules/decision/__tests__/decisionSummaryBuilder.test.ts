import { DecisionSummaryBuilder } from '../decisionSummaryBuilder';
import { ConsensusResult } from '../decision.types';

describe('DecisionSummaryBuilder', () => {
  it('should build deterministic summary based on input', () => {
    const builder = new DecisionSummaryBuilder();
    
    const consensus: ConsensusResult = {
      agreementRatio: 100, averageConfidence: 90, overallScore: 90,
      dominantRecommendation: { category: 'Risk', action: 'Review', target: 'Budget', priority: 'HIGH', impact: 'High' }
    };

    const summary = builder.buildSummary({ score: 60 }, consensus);

    expect(summary.currentRisk).toBe('ELEVATED RISK');
    expect(summary.primaryConcern).toBe('Review');
    expect(summary.highestImpactArea).toBe('Budget');
    expect(summary.overallConfidence).toBe(90);
  });
});

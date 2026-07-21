export const decisionConfig = {
  consensusWeights: {
    agreementRatio: 0.40,
    averageConfidence: 0.30,
    impactAlignment: 0.20,
    assumptionAlignment: 0.10
  },
  priorityThresholds: {
    immediate: { minConsensus: 85, severity: 'CRITICAL' },
    high: { minConsensus: 70, severity: 'HIGH' },
    medium: { minConsensus: 50, severity: 'MEDIUM' }
  }
};

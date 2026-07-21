import { AgentResponse, AgentRecommendation } from '../agents/agent.types';
import { ConsensusResult } from './decision.types';
import { decisionConfig } from '../../config/decision';

export class ConsensusEngine {
  calculateConsensus(responses: AgentResponse[]): ConsensusResult {
    if (responses.length === 0) {
      return { dominantRecommendation: null, agreementRatio: 0, averageConfidence: 0, overallScore: 0 };
    }

    const allRecommendations = responses.flatMap(r => r.recommendations);
    if (allRecommendations.length === 0) {
      return { dominantRecommendation: null, agreementRatio: 0, averageConfidence: 0, overallScore: 0 };
    }

    const avgConf = responses.reduce((acc, r) => acc + r.confidence.score, 0) / responses.length;

    // Group recommendations by category + action + target
    const groups = new Map<string, AgentRecommendation[]>();
    for (const rec of allRecommendations) {
      const key = `${rec.category}|${rec.action}|${rec.target}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(rec);
    }

    let dominantRec: AgentRecommendation | null = null;
    let maxGroupSize = 0;
    let impactAlignmentScore = 0;
    let assumptionAlignmentScore = 0;

    for (const group of groups.values()) {
      if (group.length > maxGroupSize) {
        maxGroupSize = group.length;
        dominantRec = group[0]; // Take the first one as representative

        // Calculate alignment within the dominant group
        const uniqueImpacts = new Set(group.map(g => g.impact));
        impactAlignmentScore = uniqueImpacts.size === 1 ? 100 : (1 / uniqueImpacts.size) * 100;

        const allAssumptions = group.flatMap(g => g.assumptions || []);
        const uniqueAssumptions = new Set(allAssumptions);
        assumptionAlignmentScore = allAssumptions.length === 0 ? 100 : 
          allAssumptions.length === uniqueAssumptions.size && allAssumptions.length > 0 ? 50 : // no overlap = low alignment
          (allAssumptions.length - uniqueAssumptions.size + 1) / allAssumptions.length * 100; // simple metric
      }
    }

    const agreementRatio = (maxGroupSize / responses.length) * 100;

    const w = decisionConfig.consensusWeights;
    const overallScore = 
      (agreementRatio * w.agreementRatio) + 
      (avgConf * w.averageConfidence) + 
      (impactAlignmentScore * w.impactAlignment) + 
      (assumptionAlignmentScore * w.assumptionAlignment);

    return {
      dominantRecommendation: dominantRec,
      agreementRatio,
      averageConfidence: avgConf,
      overallScore: Math.round(overallScore)
    };
  }
}

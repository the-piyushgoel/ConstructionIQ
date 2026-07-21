import { RecoveryPlan } from './simulation.types';

export class RecoveryPlanSelector {
  select(plans: RecoveryPlan[]): RecoveryPlan | null {
    if (!plans || plans.length === 0) return null;

    // Sort plans based on prioritization rules:
    // 1. Highest confidence (successProbability)
    // 2. Lowest overall impact (cost + schedule + resource impact)
    // 3. Highest benefit (we'll use number of expected benefits as a proxy, or just confidence vs impact ratio)

    // A deterministic score for ranking:
    // We want HIGH confidence, LOW impact.
    // score = confidence - (overallImpactScore * weight)
    // Let's use a simple deterministic formula.
    
    return plans.reduce((best, current) => {
      const currentScore = this.calculateRankScore(current);
      const bestScore = this.calculateRankScore(best);

      if (currentScore > bestScore) {
        return current;
      }
      
      // If scores are exactly identical, use deterministic fallback (e.g., alphabetical by ID)
      if (currentScore === bestScore) {
        return current.id.localeCompare(best.id) < 0 ? current : best;
      }

      return best;
    }, plans[0]);
  }

  private calculateRankScore(plan: RecoveryPlan): number {
    // We want high confidence and low overall impact.
    // Confidence is 0-100.
    // Impact overall score is 0-100.
    // Higher rank score is better.
    // e.g. Confidence (80) - Impact (40) = 40.
    return plan.confidence - plan.estimatedImpact.overallScore;
  }
}

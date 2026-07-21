import { DecisionPackage } from '../decision/decision.types';
import { SimulationScenario, SimulationImpact } from './simulation.types';

export class ImpactAnalyzer {
  analyze(scenario: SimulationScenario, decisionPackage: DecisionPackage): SimulationImpact {
    const baseRisk = decisionPackage.consensus.overallScore || 50;

    // Deterministic calculation based strictly on the scenario type
    // All scores are normalized 0-100. (Lower is generally worse for everything except Risk, wait, let's say Higher = Better Impact for the project, or Higher = Larger impact? Usually Higher = Larger Impact.
    // Let's standardize: 100 = Maximum Impact/Cost/Risk, 0 = Minimum Impact/Cost/Risk.
    
    let costScore = 50;
    let scheduleScore = 50;
    let resourceScore = 50;
    let qualityScore = 50;
    let riskScore = baseRisk;

    switch (scenario.type) {
      case 'NO_ACTION':
        // No action means zero cost/resource impact now, but risk remains high.
        costScore = 0;
        resourceScore = 0;
        scheduleScore = 0;
        qualityScore = 50;
        riskScore = Math.min(100, baseRisk + 20); 
        break;

      case 'RECOMMENDED_ACTION':
        // Balanced approach
        costScore = 40;
        resourceScore = 40;
        scheduleScore = 20;
        qualityScore = 80;
        riskScore = Math.max(0, baseRisk - 40);
        break;

      case 'AGGRESSIVE_MITIGATION':
        // High cost, high resource usage, drastically reduced risk
        costScore = 90;
        resourceScore = 90;
        scheduleScore = 60;
        qualityScore = 95;
        riskScore = Math.max(0, baseRisk - 70);
        break;

      case 'CONSERVATIVE_MITIGATION':
        // Low cost, low resource, minor risk reduction
        costScore = 20;
        resourceScore = 20;
        scheduleScore = 10;
        qualityScore = 60;
        riskScore = Math.max(0, baseRisk - 15);
        break;
    }

    const overallScore = Math.round(
      (costScore * 0.3) + 
      (scheduleScore * 0.2) + 
      (resourceScore * 0.2) + 
      (riskScore * 0.3)
    );

    return {
      costScore,
      scheduleScore,
      resourceScore,
      qualityScore,
      riskScore,
      overallScore
    };
  }
}

import { DecisionPackage } from '../decision/decision.types';
import { SimulationResult } from './simulation.types';
import { ScenarioGenerator } from './scenarioGenerator';
import { ImpactAnalyzer } from './impactAnalyzer';

export class SimulationEngine {
  constructor(
    private readonly scenarioGenerator: ScenarioGenerator,
    private readonly impactAnalyzer: ImpactAnalyzer
  ) {}

  run(decisionPackage: DecisionPackage): SimulationResult[] {
    const scenarios = this.scenarioGenerator.generate(decisionPackage);

    return scenarios.map(scenario => {
      const impact = this.impactAnalyzer.analyze(scenario, decisionPackage);
      
      // Success probability inversely proportional to risk score
      const successProbability = Math.max(0, 100 - impact.riskScore);

      return {
        scenarioId: scenario.id,
        scenarioType: scenario.type,
        impact,
        successProbability
      };
    });
  }
}

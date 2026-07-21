import { SimulationEngine } from '../simulationEngine';
import { ScenarioGenerator } from '../scenarioGenerator';
import { ImpactAnalyzer } from '../impactAnalyzer';
import { DecisionPackage } from '../../decision/decision.types';

describe('SimulationEngine', () => {
  let engine: SimulationEngine;
  let scenarioGenerator: jest.Mocked<ScenarioGenerator>;
  let impactAnalyzer: jest.Mocked<ImpactAnalyzer>;

  beforeEach(() => {
    scenarioGenerator = new ScenarioGenerator() as jest.Mocked<ScenarioGenerator>;
    impactAnalyzer = new ImpactAnalyzer() as jest.Mocked<ImpactAnalyzer>;
    
    // Mock the dependencies to simulate pure coordination
    scenarioGenerator.generate = jest.fn().mockReturnValue([
      { id: 'sc-1', type: 'NO_ACTION' },
      { id: 'sc-2', type: 'RECOMMENDED_ACTION' }
    ]);
    
    impactAnalyzer.analyze = jest.fn().mockImplementation((scenario) => {
      if (scenario.type === 'NO_ACTION') return { riskScore: 90 };
      return { riskScore: 30 };
    });

    engine = new SimulationEngine(scenarioGenerator, impactAnalyzer);
  });

  it('should run simulations for all scenarios generated and calculate success probability', () => {
    const mockDecisionPackage = {} as DecisionPackage;
    
    const results = engine.run(mockDecisionPackage);
    
    expect(scenarioGenerator.generate).toHaveBeenCalledWith(mockDecisionPackage);
    expect(impactAnalyzer.analyze).toHaveBeenCalledTimes(2);
    
    expect(results).toHaveLength(2);
    
    // Success probability = 100 - riskScore
    expect(results[0].successProbability).toBe(10); // 100 - 90
    expect(results[1].successProbability).toBe(70); // 100 - 30
  });

  it('should handle zero-impact scenario and return 100% success probability', () => {
    impactAnalyzer.analyze = jest.fn().mockReturnValue({ riskScore: 0 });
    
    const results = engine.run({} as DecisionPackage);
    expect(results[0].successProbability).toBe(100);
  });
});

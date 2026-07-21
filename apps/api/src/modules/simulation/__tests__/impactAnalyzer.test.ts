import { ImpactAnalyzer } from '../impactAnalyzer';
import { SimulationScenario } from '../simulation.types';
import { DecisionPackage } from '../../decision/decision.types';

describe('ImpactAnalyzer', () => {
  let analyzer: ImpactAnalyzer;
  
  beforeEach(() => {
    analyzer = new ImpactAnalyzer();
  });

  const mockDecisionPackage = {
    consensus: { overallScore: 80 } // High baseline risk
  } as unknown as DecisionPackage;

  it('should assign maximum risk and minimum cost to NO_ACTION', () => {
    const scenario: SimulationScenario = { id: '1', type: 'NO_ACTION', description: '', adjustments: {} };
    const result = analyzer.analyze(scenario, mockDecisionPackage);
    
    expect(result.costScore).toBe(0);
    expect(result.riskScore).toBe(100); // 80 + 20
  });

  it('should assign highest cost and lowest risk to AGGRESSIVE_MITIGATION', () => {
    const scenario: SimulationScenario = { id: '2', type: 'AGGRESSIVE_MITIGATION', description: '', adjustments: {} };
    const result = analyzer.analyze(scenario, mockDecisionPackage);
    
    expect(result.costScore).toBe(90);
    expect(result.riskScore).toBe(10); // 80 - 70
  });

  it('should accurately calculate normalized overall score', () => {
    const scenario: SimulationScenario = { id: '3', type: 'RECOMMENDED_ACTION', description: '', adjustments: {} };
    const result = analyzer.analyze(scenario, mockDecisionPackage);
    
    // Cost 40(0.3) + Sched 20(0.2) + Res 40(0.2) + Risk 40(0.3) = 12 + 4 + 8 + 12 = 36
    expect(result.overallScore).toBe(36);
  });
});

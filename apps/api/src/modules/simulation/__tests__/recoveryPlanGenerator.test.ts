import { RecoveryPlanGenerator } from '../recoveryPlanGenerator';
import { DecisionPackage } from '../../decision/decision.types';
import { SimulationResult } from '../simulation.types';

describe('RecoveryPlanGenerator', () => {
  let generator: RecoveryPlanGenerator;
  
  beforeEach(() => {
    generator = new RecoveryPlanGenerator();
  });

  const mockDecisionPackage = {
    consensus: {
      overallScore: 70,
      dominantRecommendation: {
        action: 'Accelerate',
        target: 'Procurement'
      }
    }
  } as unknown as DecisionPackage;

  it('should not generate a recovery plan for NO_ACTION scenarios', () => {
    const results: SimulationResult[] = [
      {
        scenarioId: 'sc-1',
        scenarioType: 'NO_ACTION',
        impact: { overallScore: 90, riskScore: 100, costScore: 0, scheduleScore: 0, resourceScore: 0, qualityScore: 50 },
        successProbability: 0
      }
    ];

    const plans = generator.generate(mockDecisionPackage, results);
    expect(plans).toHaveLength(0);
  });

  it('should generate properly prioritized plans for mitigation scenarios', () => {
    const results: SimulationResult[] = [
      {
        scenarioId: 'sc-2',
        scenarioType: 'RECOMMENDED_ACTION',
        impact: { overallScore: 60, riskScore: 30, costScore: 40, scheduleScore: 20, resourceScore: 40, qualityScore: 80 },
        successProbability: 70
      },
      {
        scenarioId: 'sc-3',
        scenarioType: 'CONSERVATIVE_MITIGATION',
        impact: { overallScore: 20, riskScore: 60, costScore: 20, scheduleScore: 10, resourceScore: 20, qualityScore: 60 },
        successProbability: 40
      }
    ];

    const plans = generator.generate(mockDecisionPackage, results);
    expect(plans).toHaveLength(2);
    
    // Check priority mapping based on impact overallScore
    expect(plans[0].implementationPriority).toBe('HIGH'); // overallScore 60
    expect(plans[1].implementationPriority).toBe('LOW'); // overallScore 20
    
    expect(plans[0].title).toContain('Accelerate');
    expect(plans[0].title).toContain('Procurement');
    
    // Check deterministic IDs for actions
    expect(plans[0].actions[0].id).toBe('act-sc-2-0');
  });

  it('should handle all scenarios failing validation or empty results gracefully', () => {
    const plans = generator.generate(mockDecisionPackage, []);
    expect(plans).toHaveLength(0);
  });
});

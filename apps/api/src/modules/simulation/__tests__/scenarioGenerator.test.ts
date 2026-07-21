import { ScenarioGenerator } from '../scenarioGenerator';
import { DecisionPackage } from '../../decision/decision.types';

describe('ScenarioGenerator', () => {
  let generator: ScenarioGenerator;
  
  beforeEach(() => {
    generator = new ScenarioGenerator();
  });

  it('should deterministically generate exactly 4 scenarios based on decision version', () => {
    const mockDecisionPackage = {
      consensus: {
        dominantRecommendation: {
          action: 'Mitigate',
          target: 'Schedule Risk'
        }
      },
      metadata: {
        decisionVersion: 'v-test-123'
      }
    } as unknown as DecisionPackage;

    const scenarios = generator.generate(mockDecisionPackage);

    expect(scenarios).toHaveLength(4);
    expect(scenarios[0].id).toBe('sc-no-action-v-test-123');
    expect(scenarios[1].id).toBe('sc-recommended-v-test-123');
    expect(scenarios[2].id).toBe('sc-aggressive-v-test-123');
    expect(scenarios[3].id).toBe('sc-conservative-v-test-123');
    
    // Check adjustments mapping
    expect(scenarios[1].adjustments.primaryAction).toBe('Mitigate');
    expect(scenarios[1].adjustments.primaryTarget).toBe('Schedule Risk');
  });
});

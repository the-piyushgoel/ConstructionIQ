import { RecoveryPlanSelector } from '../recoveryPlanSelector';
import { RecoveryPlan } from '../simulation.types';

describe('RecoveryPlanSelector', () => {
  let selector: RecoveryPlanSelector;
  
  beforeEach(() => {
    selector = new RecoveryPlanSelector();
  });

  const createMockPlan = (id: string, confidence: number, impactScore: number): RecoveryPlan => ({
    id,
    title: 'Test',
    objective: 'Test',
    actions: [],
    expectedBenefits: [],
    tradeOffs: [],
    estimatedImpact: { overallScore: impactScore, costScore: 0, scheduleScore: 0, resourceScore: 0, qualityScore: 0, riskScore: 0 },
    confidence,
    implementationPriority: 'MEDIUM'
  });

  it('should return null for empty plans', () => {
    expect(selector.select([])).toBeNull();
  });

  it('should select the single plan if only one exists', () => {
    const plan = createMockPlan('p1', 80, 50);
    expect(selector.select([plan])).toBe(plan);
  });

  it('should select the plan with the highest calculated rank (confidence - impact)', () => {
    const planA = createMockPlan('p-A', 90, 80); // Rank = 10
    const planB = createMockPlan('p-B', 80, 40); // Rank = 40 (Better)
    const planC = createMockPlan('p-C', 60, 50); // Rank = 10

    const selected = selector.select([planA, planB, planC]);
    expect(selected?.id).toBe('p-B');
  });

  it('should break ties deterministically by ID (alphabetical order)', () => {
    const planZ = createMockPlan('z-plan', 80, 40); // Rank = 40
    const planA = createMockPlan('a-plan', 80, 40); // Rank = 40
    
    // a-plan comes before z-plan
    const selected = selector.select([planZ, planA]);
    expect(selected?.id).toBe('a-plan');
  });

  it('should handle zero-impact scenarios appropriately', () => {
    const planZeroImpact = createMockPlan('p-zero', 100, 0); // Rank = 100
    const planNormal = createMockPlan('p-norm', 80, 40); // Rank = 40
    
    const selected = selector.select([planNormal, planZeroImpact]);
    expect(selected?.id).toBe('p-zero');
  });
});

import { RecoveryPackageBuilder } from '../recoveryPackageBuilder';
import { RecoveryPlanSelector } from '../recoveryPlanSelector';
import { DecisionPackage } from '../../decision/decision.types';
import { SimulationResult, RecoveryPlan } from '../simulation.types';

describe('RecoveryPackageBuilder', () => {
  let builder: RecoveryPackageBuilder;
  let selector: jest.Mocked<RecoveryPlanSelector>;

  beforeEach(() => {
    selector = new RecoveryPlanSelector() as jest.Mocked<RecoveryPlanSelector>;
    selector.select = jest.fn();
    builder = new RecoveryPackageBuilder(selector);
  });

  it('should assemble the full recovery package with a recommended plan', () => {
    const mockDecisionPackage = { metadata: { decisionVersion: 'v1.0' } } as DecisionPackage;
    const mockResults = [{ scenarioId: '1' } as SimulationResult];
    const mockPlans = [
      { id: 'plan-1', title: 'Plan 1', confidence: 85, estimatedImpact: { overallScore: 40 } } as RecoveryPlan
    ];

    selector.select.mockReturnValue(mockPlans[0]);

    const packageResult = builder.build(mockDecisionPackage, mockResults, mockPlans);

    expect(packageResult.humanApprovalRequired).toBe(true);
    expect(packageResult.decisionPackage).toBe(mockDecisionPackage);
    expect(packageResult.simulationResults).toBe(mockResults);
    expect(packageResult.recoveryPlans).toBe(mockPlans);
    expect(packageResult.recommendedRecoveryPlan).toBe(mockPlans[0]);
    
    expect(packageResult.approvalSummary?.rationale).toContain("Selected 'Plan 1'");
    
    // Metadata validation
    expect(packageResult.metadata.totalScenarios).toBe(1);
    expect(packageResult.metadata.totalRecoveryPlans).toBe(1);
    expect(packageResult.metadata.overallConfidence).toBe(85);
    expect(packageResult.metadata.recommendedPlanId).toBe('plan-1');
    expect(packageResult.metadata.packageVersion).toBe('v1.0');
    expect(packageResult.metadata.generatedAt).toBeDefined();
  });

  it('should assemble a package even if no recovery plans are recommended', () => {
    const mockDecisionPackage = { metadata: { decisionVersion: 'v1.0' } } as DecisionPackage;
    
    selector.select.mockReturnValue(null);

    const packageResult = builder.build(mockDecisionPackage, [], []);
    
    expect(packageResult.recommendedRecoveryPlan).toBeNull();
    expect(packageResult.approvalSummary).toBeNull();
    expect(packageResult.metadata.overallConfidence).toBe(50); // Default fallback
    expect(packageResult.metadata.recommendedPlanId).toBeNull();
  });
});

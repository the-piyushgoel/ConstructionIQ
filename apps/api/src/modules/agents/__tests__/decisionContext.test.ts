import { DecisionContextBuilder } from '../decisionContext';

describe('DecisionContextBuilder', () => {
  it('should build an immutable ReadonlyDecisionContext', () => {
    const builder = new DecisionContextBuilder();
    builder.setProject({ id: 'p1', name: 'Test' });
    builder.addRiskEvent({ id: 'r1' });
    
    const context = builder.build();

    expect(context.project.id).toBe('p1');
    expect(context.riskEvents).toHaveLength(1);

    // Test immutability
    expect(() => {
      (context as unknown as { project: Record<string, unknown> }).project = {};
    }).toThrow(TypeError);

    expect(() => {
      (context.project as unknown as { name: string }).name = 'Changed';
    }).toThrow(TypeError);

    expect(() => {
      (context as unknown as { riskEvents: unknown[] }).riskEvents.push({});
    }).toThrow(TypeError);
  });
});

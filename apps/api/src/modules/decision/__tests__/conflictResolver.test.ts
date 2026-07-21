import { ConflictResolver } from '../conflictResolver';
import { AgentResponse } from '../../agents/agent.types';

describe('ConflictResolver', () => {
  let resolver: ConflictResolver;

  beforeEach(() => {
    resolver = new ConflictResolver();
  });

  it('should detect CONFIDENCE_CONFLICT', () => {
    const responses: AgentResponse[] = [
      { agentName: 'A', findings: {}, confidence: { score: 90, reasoning: '' }, recommendations: [], metadata: { provider: 'test', model: 'test', executionTimeMs: 0, requestId: 'test', agentVersion: '1' } },
      { agentName: 'B', findings: {}, confidence: { score: 50, reasoning: '' }, recommendations: [], metadata: { provider: 'test', model: 'test', executionTimeMs: 0, requestId: 'test', agentVersion: '1' } }
    ];

    const conflicts = resolver.detectConflicts(responses);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].category).toBe('CONFIDENCE_CONFLICT');
  });

  it('should detect RECOMMENDATION_CONFLICT', () => {
    const responses: AgentResponse[] = [
      { agentName: 'A', findings: {}, confidence: { score: 80, reasoning: '' }, metadata: { provider: 'test', model: 'test', executionTimeMs: 0, requestId: 'test', agentVersion: '1' }, recommendations: [
        { category: 'Risk', target: 'T1', action: 'Increase', priority: 'HIGH', impact: 'Low' }
      ] },
      { agentName: 'B', findings: {}, confidence: { score: 80, reasoning: '' }, metadata: { provider: 'test', model: 'test', executionTimeMs: 0, requestId: 'test', agentVersion: '1' }, recommendations: [
        { category: 'Risk', target: 'T1', action: 'Decrease', priority: 'HIGH', impact: 'Low' }
      ] }
    ];

    const conflicts = resolver.detectConflicts(responses);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].category).toBe('RECOMMENDATION_CONFLICT');
  });

  it('should detect IMPACT_CONFLICT', () => {
    const responses: AgentResponse[] = [
      { agentName: 'A', findings: {}, confidence: { score: 80, reasoning: '' }, metadata: { provider: 'test', model: 'test', executionTimeMs: 0, requestId: 'test', agentVersion: '1' }, recommendations: [
        { category: 'Risk', target: 'T1', action: 'Increase', priority: 'HIGH', impact: 'High Impact' }
      ] },
      { agentName: 'B', findings: {}, confidence: { score: 80, reasoning: '' }, metadata: { provider: 'test', model: 'test', executionTimeMs: 0, requestId: 'test', agentVersion: '1' }, recommendations: [
        { category: 'Risk', target: 'T1', action: 'Increase', priority: 'HIGH', impact: 'Low Impact' }
      ] }
    ];

    const conflicts = resolver.detectConflicts(responses);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].category).toBe('IMPACT_CONFLICT');
  });

  it('should detect ASSUMPTION_CONFLICT', () => {
    const responses: AgentResponse[] = [
      { agentName: 'A', findings: {}, confidence: { score: 80, reasoning: '' }, metadata: { provider: 'test', model: 'test', executionTimeMs: 0, requestId: 'test', agentVersion: '1' }, recommendations: [
        { category: 'Risk', target: 'T1', action: 'Inc', priority: 'HIGH', impact: 'High', assumptions: ['X'] }
      ] },
      { agentName: 'B', findings: {}, confidence: { score: 80, reasoning: '' }, metadata: { provider: 'test', model: 'test', executionTimeMs: 0, requestId: 'test', agentVersion: '1' }, recommendations: [
        { category: 'Risk', target: 'T2', action: 'Dec', priority: 'HIGH', impact: 'Low', assumptions: ['Y'] }
      ] }
    ];

    const conflicts = resolver.detectConflicts(responses);
    expect(conflicts.find(c => c.category === 'ASSUMPTION_CONFLICT')).toBeDefined();
  });
});

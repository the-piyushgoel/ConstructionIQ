import { ConsensusEngine } from '../consensusEngine';
import { AgentResponse } from '../../agents/agent.types';

describe('ConsensusEngine', () => {
  let engine: ConsensusEngine;

  beforeEach(() => {
    engine = new ConsensusEngine();
  });

  it('should handle empty responses', () => {
    const result = engine.calculateConsensus([]);
    expect(result.dominantRecommendation).toBeNull();
    expect(result.overallScore).toBe(0);
  });

  it('should calculate consensus for unanimous agreement', () => {
    const responses: AgentResponse[] = [
      {
        agentName: 'Agent1', findings: {}, confidence: { score: 90, reasoning: '' }, metadata: { provider: 'test', model: 'test', executionTimeMs: 0, requestId: 'test', agentVersion: '1' },
        recommendations: [{ category: 'Risk', action: 'Mitigate', target: 'Delay', priority: 'HIGH', impact: 'High', assumptions: ['A'] }]
      },
      {
        agentName: 'Agent2', findings: {}, confidence: { score: 90, reasoning: '' }, metadata: { provider: 'test', model: 'test', executionTimeMs: 0, requestId: 'test', agentVersion: '1' },
        recommendations: [{ category: 'Risk', action: 'Mitigate', target: 'Delay', priority: 'HIGH', impact: 'High', assumptions: ['A'] }]
      }
    ];

    const result = engine.calculateConsensus(responses);
    
    expect(result.agreementRatio).toBe(100);
    expect(result.averageConfidence).toBe(90);
    expect(result.dominantRecommendation?.action).toBe('Mitigate');
    expect(result.overallScore).toBe(97);
  });

  it('should calculate consensus for partial agreement', () => {
    const responses: AgentResponse[] = [
      {
        agentName: 'Agent1', findings: {}, confidence: { score: 80, reasoning: '' }, metadata: { provider: 'test', model: 'test', executionTimeMs: 0, requestId: 'test', agentVersion: '1' },
        recommendations: [{ category: 'Risk', action: 'Mitigate', target: 'Delay', priority: 'HIGH', impact: 'High', assumptions: ['A'] }]
      },
      {
        agentName: 'Agent2', findings: {}, confidence: { score: 80, reasoning: '' }, metadata: { provider: 'test', model: 'test', executionTimeMs: 0, requestId: 'test', agentVersion: '1' },
        recommendations: [{ category: 'Risk', action: 'Mitigate', target: 'Delay', priority: 'HIGH', impact: 'High', assumptions: ['A'] }]
      },
      {
        agentName: 'Agent3', findings: {}, confidence: { score: 80, reasoning: '' }, metadata: { provider: 'test', model: 'test', executionTimeMs: 0, requestId: 'test', agentVersion: '1' },
        recommendations: [{ category: 'Cost', action: 'Review', target: 'Budget', priority: 'LOW', impact: 'Low', assumptions: ['B'] }]
      }
    ];

    const result = engine.calculateConsensus(responses);
    
    // Group 1 size = 2, Group 2 size = 1. Agreement ratio = 2/3 = 66.67%
    expect(result.agreementRatio).toBeCloseTo(66.67, 1);
    expect(result.dominantRecommendation?.action).toBe('Mitigate');
  });
});

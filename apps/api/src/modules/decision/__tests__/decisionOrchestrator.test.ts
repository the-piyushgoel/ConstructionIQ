import { DecisionOrchestrator } from '../decisionOrchestrator';
import { AgentResponse, ReadonlyDecisionContext } from '../../agents/agent.types';

describe('DecisionOrchestrator', () => {
  it('should orchestrate and build a decision package', async () => {
    const orchestrator = new DecisionOrchestrator();
    
    const responses: AgentResponse[] = [
      {
        agentName: 'Test', findings: {}, confidence: { score: 80, reasoning: '' }, metadata: { provider: 'test', model: 'test', executionTimeMs: 0, requestId: 'test', agentVersion: '1' },
        recommendations: [{ category: 'Risk', target: 'X', action: 'Y', priority: 'HIGH', impact: 'Z', assumptions: ['A'] }]
      }
    ];

    const prediction = { score: 90 };
    const context = {} as ReadonlyDecisionContext;

    const packageResult = await orchestrator.orchestrate(prediction, {}, context, responses, 2);

    expect(packageResult.priority).toBe('IMMEDIATE');
    expect(packageResult.metadata.agentCount).toBe(2);
    expect(packageResult.metadata.successfulAgents).toBe(1);
    expect(packageResult.metadata.failedAgents).toBe(1);
    expect(packageResult.summary.currentRisk).toBe('CRITICAL RISK');
  });
});

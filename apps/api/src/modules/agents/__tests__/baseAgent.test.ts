import { BaseAgent } from '../baseAgent';
import { AIService } from '../../../services/ai/aiService';
import { ReadonlyDecisionContext, AgentResponse } from '../agent.types';
import { z } from 'zod';

jest.mock('../../../services/ai/aiService');

class TestAgent extends BaseAgent {
  readonly name = 'TestAgent';
  readonly version = '1.0';

  protected buildPromptMessages(_context: ReadonlyDecisionContext): Array<{ role: string; content: string }> {
    return [{ role: 'user', content: 'test' }];
  }

  protected getResponseSchema(): z.ZodSchema<unknown> {
    return z.object({ success: z.boolean() });
  }

  protected mapResponse(rawResponse: unknown, _context: ReadonlyDecisionContext): Omit<AgentResponse, 'metadata' | 'agentName'> {
    return {
      findings: rawResponse,
      recommendations: [],
      confidence: { score: 100, reasoning: 'test' }
    };
  }
}

describe('BaseAgent', () => {
  let aiService: jest.Mocked<AIService>;
  let agent: TestAgent;

  beforeEach(() => {
    aiService = new AIService() as jest.Mocked<AIService>;
    agent = new TestAgent(aiService);
  });

  it('should execute prompt, validate schema, and return structured AgentResponse', async () => {
    aiService.executeRequest.mockResolvedValueOnce({ success: true });

    const context = {} as ReadonlyDecisionContext;
    const response = await agent.execute(context, 'req-1');

    expect(response.agentName).toBe('TestAgent');
    expect(response.findings).toEqual({ success: true });
    expect(response.metadata).toMatchObject({
      model: 'default',
      requestId: 'req-1',
      agentVersion: '1.0'
    });
    expect(response.metadata.executionTimeMs).toBeGreaterThanOrEqual(0);
    expect(aiService.executeRequest).toHaveBeenCalledTimes(1);
  });
});

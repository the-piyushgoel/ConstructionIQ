import { BaseAgent } from './baseAgent';
import { AgentResponse, ReadonlyDecisionContext } from './agent.types';
import { ResourcePrompt } from '../../services/ai/prompts/resourcePrompt';
import { z } from 'zod';

export class ResourceAgent extends BaseAgent {
  readonly name = 'ResourceAgent';
  readonly version = '1.0.0';

  protected buildPromptMessages(context: ReadonlyDecisionContext): Array<{ role: string; content: string }> {
    const prompt = new ResourcePrompt();
    return prompt.buildMessages({
      personnel: (context.project?.personnel as unknown[]) || [],
      equipment: (context.project?.equipment as unknown[]) || []
    }) as Array<{ role: string; content: string }>;
  }

  protected getResponseSchema(): z.ZodSchema<unknown> {
    return z.object({
      allocations: z.array(z.object({
        resourceId: z.string(),
        assignedTask: z.string(),
        utilitzationPercentage: z.number() // note typo from original schema
      }))
    });
  }

  protected mapResponse(rawResponse: unknown): Omit<AgentResponse, 'metadata' | 'agentName'> {
    const response = rawResponse as { allocations: { resourceId: string, assignedTask: string, utilitzationPercentage: number }[] };
    return {
      findings: response.allocations,
      recommendations: response.allocations.map(a => ({
        category: 'Resource',
        action: 'Assign',
        target: a.resourceId,
        priority: 'MEDIUM',
        impact: `Utilization: ${a.utilitzationPercentage}%`,
        assumptions: ['Resource availability is stable']
      })),
      confidence: {
        score: 82,
        reasoning: 'Resource availability and allocation evaluated.'
      }
    };
  }
}

import { BaseAgent } from './baseAgent';
import { AgentResponse, ReadonlyDecisionContext } from './agent.types';
import { CostPrompt } from '../../services/ai/prompts/costPrompt';
import { z } from 'zod';

export class CostAgent extends BaseAgent {
  readonly name = 'CostAgent';
  readonly version = '1.0.0';

  protected buildPromptMessages(context: ReadonlyDecisionContext): Array<{ role: string; content: string }> {
    const prompt = new CostPrompt();
    return prompt.buildMessages({
      budget: Number(context.project?.budget) || 0,
      expenses: (context.project?.expenses as unknown[]) || []
    }) as Array<{ role: string; content: string }>;
  }

  protected getResponseSchema(): z.ZodSchema<unknown> {
    return z.object({
      forecast: z.object({
        projectedTotal: z.number(),
        variance: z.number(),
        riskAreas: z.array(z.string())
      })
    });
  }

  protected mapResponse(rawResponse: unknown): Omit<AgentResponse, 'metadata' | 'agentName'> {
    const response = rawResponse as { forecast: { projectedTotal: number, variance: number, riskAreas: string[] } };
    return {
      findings: response.forecast,
      recommendations: response.forecast.riskAreas.map((area: string) => ({
        action: `Review budget for ${area}`,
        impact: 'Medium'
      })),
      confidence: {
        score: 80,
        reasoning: 'Based on historical variance analysis.'
      }
    };
  }
}

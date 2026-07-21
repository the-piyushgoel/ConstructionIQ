import { BaseAgent } from './baseAgent';
import { AgentResponse, ReadonlyDecisionContext } from './agent.types';
import { RiskPrompt } from '../../services/ai/prompts/riskPrompt';
import { z } from 'zod';

export class RiskAgent extends BaseAgent {
  readonly name = 'RiskAgent';
  readonly version = '1.0.0';

  protected buildPromptMessages(context: ReadonlyDecisionContext): Array<{ role: string; content: string }> {
    const prompt = new RiskPrompt();
    return prompt.buildMessages({
      projectDetails: context.project,
      identifiedRisks: (context.riskEvents as unknown[]) || []
    }) as Array<{ role: string; content: string }>;
  }

  protected getResponseSchema(): z.ZodSchema<unknown> {
    return z.object({
      predictedRisks: z.array(z.object({
        type: z.string(),
        probability: z.number(),
        severity: z.number(),
        description: z.string()
      }))
    });
  }

  protected mapResponse(rawResponse: unknown): Omit<AgentResponse, 'metadata' | 'agentName'> {
    const response = rawResponse as { predictedRisks: { type: string, probability: number, severity: number, description: string }[] };
    return {
      findings: response.predictedRisks,
      recommendations: response.predictedRisks.map((r: { type: string }) => ({
        action: `Mitigate ${r.type} risk`,
        impact: 'High'
      })),
      confidence: {
        score: 90,
        reasoning: 'Aggregated risk models evaluated.'
      }
    };
  }
}

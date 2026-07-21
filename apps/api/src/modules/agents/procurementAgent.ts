import { BaseAgent } from './baseAgent';
import { AgentResponse, ReadonlyDecisionContext } from './agent.types';
import { ProcurementPrompt } from '../../services/ai/prompts/procurementPrompt';
import { z } from 'zod';

export class ProcurementAgent extends BaseAgent {
  readonly name = 'ProcurementAgent';
  readonly version = '1.0.0';

  protected buildPromptMessages(context: ReadonlyDecisionContext): Array<{ role: string; content: string }> {
    const prompt = new ProcurementPrompt();
    return prompt.buildMessages({
      materialRequirements: (context.project?.materials as unknown[]) || [],
      currentMarketConditions: (context.project?.market as Record<string, unknown>) || {}
    }) as Array<{ role: string; content: string }>;
  }

  protected getResponseSchema(): z.ZodSchema<unknown> {
    return z.object({
      recommendations: z.array(z.object({
        materialId: z.string(),
        vendorName: z.string(),
        estimatedLeadTimeDays: z.number()
      }))
    });
  }

  protected mapResponse(rawResponse: unknown): Omit<AgentResponse, 'metadata' | 'agentName'> {
    const response = rawResponse as { recommendations: { materialId: string, vendorName: string, estimatedLeadTimeDays: number }[] };
    return {
      findings: response.recommendations,
      recommendations: response.recommendations.map(r => ({
        action: `Source ${r.materialId} from ${r.vendorName}`,
        impact: `Lead time: ${r.estimatedLeadTimeDays} days`
      })),
      confidence: {
        score: 75,
        reasoning: 'Supply chain analysis completed.'
      }
    };
  }
}

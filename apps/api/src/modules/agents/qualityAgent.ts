import { BaseAgent } from './baseAgent';
import { AgentResponse, ReadonlyDecisionContext } from './agent.types';
import { QualityPrompt } from '../../services/ai/prompts/qualityPrompt';
import { z } from 'zod';

export class QualityAgent extends BaseAgent {
  readonly name = 'QualityAgent';
  readonly version = '1.0.0';

  protected buildPromptMessages(context: ReadonlyDecisionContext): Array<{ role: string; content: string }> {
    const prompt = new QualityPrompt();
    return prompt.buildMessages({
      inspections: (context.project?.inspections as unknown[]) || [],
      standards: (context.project?.standards as unknown[]) || []
    }) as Array<{ role: string; content: string }>;
  }

  protected getResponseSchema(): z.ZodSchema<unknown> {
    return z.object({
      qualityReport: z.object({
        complianceScore: z.number(),
        violations: z.array(z.object({ rule: z.string(), severity: z.string() })),
        recommendations: z.array(z.string())
      })
    });
  }

  protected mapResponse(rawResponse: unknown): Omit<AgentResponse, 'metadata' | 'agentName'> {
    const response = rawResponse as { qualityReport: { complianceScore: number, violations: { rule: string, severity: string }[], recommendations: string[] } };
    return {
      findings: response.qualityReport,
      recommendations: response.qualityReport.recommendations.map(r => ({
        category: 'Quality',
        action: 'Inspect',
        target: r,
        priority: 'HIGH',
        impact: 'High',
        assumptions: ['Defects follow historical trends']
      })),
      confidence: {
        score: response.qualityReport.complianceScore,
        reasoning: 'Quality standards evaluated.'
      }
    };
  }
}

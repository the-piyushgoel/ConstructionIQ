import { BaseAgent } from './baseAgent';
import { AgentResponse, ReadonlyDecisionContext } from './agent.types';
import { RiskAgentPrompt } from '../../services/ai/prompts/riskAgentPrompt';
import { ConfidenceEngine } from '../intelligence/confidenceEngine';
import { AIService } from '../../services/ai/aiService';
import { z } from 'zod';

export class RiskAgent extends BaseAgent {
  readonly name = 'RiskAgent';
  readonly version = '1.0.0';

  constructor(
    aiService: AIService,
    private readonly confidenceEngine: ConfidenceEngine
  ) {
    super(aiService);
  }

  protected buildPromptMessages(context: ReadonlyDecisionContext): Array<{ role: string; content: string }> {
    const prompt = new RiskAgentPrompt();
    return prompt.buildMessages({
      projectDetails: context.project,
      identifiedRisks: (context.riskEvents as unknown[]) || [],
      prediction: context.predictions?.[0] || {}
    }) as Array<{ role: string; content: string }>;
  }

  protected getResponseSchema(): z.ZodSchema<unknown> {
    const riskObject = z.object({
      type: z.string(),
      action: z.string(),
      priority: z.string(),
      impact: z.string(),
      assumptions: z.array(z.string())
    });

    return z.object({
      validatedRisks: z.array(riskObject),
      missingRisks: z.array(riskObject),
      analysisConfidence: z.number()
    });
  }

  protected mapResponse(rawResponse: unknown): Omit<AgentResponse, 'metadata' | 'agentName'> {
    const response = rawResponse as { 
      validatedRisks: { type: string, action: string, priority: string, impact: string, assumptions: string[] }[],
      missingRisks: { type: string, action: string, priority: string, impact: string, assumptions: string[] }[],
      analysisConfidence: number 
    };

    const combinedRisks = [...response.validatedRisks, ...response.missingRisks];
    const calculatedScore = this.confidenceEngine.calculate(
      response.analysisConfidence, 90, 85, 80 // dummy quality metrics
    );

    return {
      findings: {
        validatedCount: response.validatedRisks.length,
        missingCount: response.missingRisks.length
      },
      recommendations: combinedRisks.map(r => ({
        category: 'Risk',
        action: r.action,
        target: r.type,
        priority: r.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        impact: r.impact,
        assumptions: r.assumptions
      })),
      confidence: {
        score: calculatedScore,
        reasoning: 'Aggregated risk validation against predictions.'
      }
    };
  }
}

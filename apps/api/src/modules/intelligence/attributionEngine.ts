import { AIService } from '../../services/ai/aiService';
import { DecisionPrompt } from '../../services/ai/prompts/decisionPrompt';
import { AttributionOutput, IntelligenceContext } from './intelligence.types';
import { z } from 'zod';

export class AttributionEngine {
  constructor(private readonly aiService: AIService) {}

  async generateAttribution(
    predictionId: string,
    context: IntelligenceContext,
    requestId: string
  ): Promise<AttributionOutput> {
    const prompt = new DecisionPrompt();
    
    // We reuse DecisionPrompt as instructed (using existing AI infrastructure)
    // The attribution is "explaining WHY the prediction occurred."
    const messages = prompt.buildMessages({
      scenario: `Explain prediction ${predictionId}`,
      options: [context]
    });

    const attributionSchema = z.object({
      rootCauses: z.array(z.string()),
      evidence: z.array(z.string()),
      confidence: z.number(),
      recommendedNextAnalysis: z.array(z.string())
    });

    const response = await this.aiService.executeRequest(
      { messages },
      attributionSchema,
      { requestId }
    );

    return {
      rootCauses: response.rootCauses,
      evidence: response.evidence,
      confidence: response.confidence,
      recommendedNextAnalysis: response.recommendedNextAnalysis
    };
  }
}

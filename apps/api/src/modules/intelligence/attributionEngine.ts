import { AIService } from '../../services/ai/aiService';
import { AttributionPrompt } from '../../services/ai/prompts/attributionPrompt';
import { AttributionOutput, IntelligenceContext } from './intelligence.types';
import { z } from 'zod';

export class AttributionEngine {
  constructor(private readonly aiService: AIService) {}

  async generateAttribution(
    predictionId: string,
    context: IntelligenceContext,
    requestId: string
  ): Promise<AttributionOutput> {
    const prompt = new AttributionPrompt();
    
    const messages = prompt.buildMessages({
      predictionId,
      projectDetails: context.projectDetails,
      identifiedRisks: context.identifiedRisks
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

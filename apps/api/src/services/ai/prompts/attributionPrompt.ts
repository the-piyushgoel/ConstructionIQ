import { BasePrompt } from './basePrompt';

export interface AttributionContext {
  predictionId: string;
  projectDetails: Record<string, unknown>;
  identifiedRisks: unknown[];
}

export const AttributionSchema = {
  rootCauses: ['string'],
  evidence: ['string'],
  confidence: 'number',
  recommendedNextAnalysis: ['string']
};

export class AttributionPrompt extends BasePrompt<AttributionContext, typeof AttributionSchema> {
  protected getSystemPrompt(): string {
    return 'You are an AI assistant specialized in construction risk attribution.';
  }

  protected getInstructions(): string {
    return 'Explain why the specified prediction occurred, identifying root causes, supporting evidence, and recommended next steps for analysis.';
  }

  protected getExpectedSchema() {
    return AttributionSchema;
  }
}

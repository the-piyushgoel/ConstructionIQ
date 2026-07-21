import { BasePrompt } from './basePrompt';

export interface RiskAgentContext {
  projectDetails: Record<string, unknown>;
  identifiedRisks: unknown[];
  prediction: Record<string, unknown>;
}

export const RiskAgentSchema = {
  validatedRisks: [
    { type: 'string', action: 'string', priority: 'string', impact: 'string', assumptions: ['string'] }
  ],
  missingRisks: [
    { type: 'string', action: 'string', priority: 'string', impact: 'string', assumptions: ['string'] }
  ],
  analysisConfidence: 'number'
};

export class RiskAgentPrompt extends BasePrompt<RiskAgentContext, typeof RiskAgentSchema> {
  protected getSystemPrompt(): string {
    return 'You are an autonomous Risk Agent specialized in construction risk review.';
  }

  protected getInstructions(): string {
    return 'Review the existing prediction. Validate the underlying assumptions, identify any missing risks, and provide an analysis from the Risk domain perspective.';
  }

  protected getExpectedSchema() {
    return RiskAgentSchema;
  }
}

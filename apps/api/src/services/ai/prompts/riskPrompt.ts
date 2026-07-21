import { BasePrompt } from './basePrompt';

export interface RiskContext {
  projectDetails: Record<string, unknown>;
  identifiedRisks: unknown[];
}

export const RiskSchema = {
  predictedRisks: [
    { type: 'string', probability: 'number', severity: 'number', description: 'string' }
  ]
};

export class RiskPrompt extends BasePrompt<RiskContext, typeof RiskSchema> {
  protected getSystemPrompt(): string {
    return 'You are an AI assistant specialized in construction risk analysis.';
  }

  protected getInstructions(): string {
    return 'Analyze the provided context and predict potential risks based on standard construction risk vectors.';
  }

  protected getExpectedSchema() {
    return RiskSchema;
  }
}

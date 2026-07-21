import { BasePrompt } from './basePrompt';

export interface DecisionContext {
  scenario: string;
  options: unknown[];
}

export const DecisionSchema = {
  evaluation: {
    recommendedOptionId: 'string',
    rationale: 'string',
    confidence: 'number'
  }
};

export class DecisionPrompt extends BasePrompt<DecisionContext, typeof DecisionSchema> {
  protected getSystemPrompt(): string {
    return 'You are an AI assistant specialized in construction decision support.';
  }

  protected getInstructions(): string {
    return 'Evaluate the provided scenario and options to recommend the best course of action.';
  }

  protected getExpectedSchema() {
    return DecisionSchema;
  }
}

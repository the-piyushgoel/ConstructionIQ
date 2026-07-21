import { BasePrompt } from './basePrompt';

export interface CostContext {
  budget: number;
  expenses: unknown[];
}

export const CostSchema = {
  forecast: {
    projectedTotal: 'number',
    variance: 'number',
    riskAreas: ['string']
  }
};

export class CostPrompt extends BasePrompt<CostContext, typeof CostSchema> {
  protected getSystemPrompt(): string {
    return 'You are an AI assistant specialized in construction cost forecasting and budget management.';
  }

  protected getInstructions(): string {
    return 'Analyze the current budget and expenses to forecast final costs and identify financial risks.';
  }

  protected getExpectedSchema() {
    return CostSchema;
  }
}

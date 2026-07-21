import { BasePrompt } from './basePrompt';

export interface ProcurementContext {
  materialRequirements: unknown[];
  currentMarketConditions: Record<string, unknown>;
}

export const ProcurementSchema = {
  recommendations: [
    { materialId: 'string', vendorName: 'string', estimatedLeadTimeDays: 'number' }
  ]
};

export class ProcurementPrompt extends BasePrompt<ProcurementContext, typeof ProcurementSchema> {
  protected getSystemPrompt(): string {
    return 'You are an AI assistant specialized in construction procurement and supply chain.';
  }

  protected getInstructions(): string {
    return 'Analyze material requirements and market conditions to suggest optimal procurement strategies.';
  }

  protected getExpectedSchema() {
    return ProcurementSchema;
  }
}

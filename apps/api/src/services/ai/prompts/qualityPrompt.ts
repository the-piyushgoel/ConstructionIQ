import { BasePrompt } from './basePrompt';

export interface QualityContext {
  inspections: unknown[];
  standards: unknown[];
}

export const QualitySchema = {
  qualityReport: {
    complianceScore: 'number',
    violations: [{ rule: 'string', severity: 'string' }],
    recommendations: ['string']
  }
};

export class QualityPrompt extends BasePrompt<QualityContext, typeof QualitySchema> {
  protected getSystemPrompt(): string {
    return 'You are an AI assistant specialized in construction quality assurance and compliance.';
  }

  protected getInstructions(): string {
    return 'Evaluate inspection data against quality standards and generate a compliance report.';
  }

  protected getExpectedSchema() {
    return QualitySchema;
  }
}

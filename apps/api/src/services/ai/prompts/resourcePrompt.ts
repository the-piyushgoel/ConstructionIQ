import { BasePrompt } from './basePrompt';

export interface ResourceContext {
  personnel: unknown[];
  equipment: unknown[];
}

export const ResourceSchema = {
  allocations: [
    { resourceId: 'string', assignedTask: 'string', utilitzationPercentage: 'number' }
  ]
};

export class ResourcePrompt extends BasePrompt<ResourceContext, typeof ResourceSchema> {
  protected getSystemPrompt(): string {
    return 'You are an AI assistant specialized in construction resource allocation.';
  }

  protected getInstructions(): string {
    return 'Analyze personnel and equipment availability to optimize resource assignments.';
  }

  protected getExpectedSchema() {
    return ResourceSchema;
  }
}

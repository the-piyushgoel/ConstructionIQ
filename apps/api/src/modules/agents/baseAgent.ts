import { Agent, AgentResponse, ReadonlyDecisionContext } from './agent.types';
import { AIService } from '../../services/ai/aiService';
import { aiConfig } from '../../config/ai';
import { z } from 'zod';

export abstract class BaseAgent implements Agent {
  abstract readonly name: string;
  abstract readonly version: string;

  constructor(protected readonly aiService: AIService) {}

  protected abstract buildPromptMessages(context: ReadonlyDecisionContext): Array<{ role: string; content: string }>;
  protected abstract getResponseSchema(): z.ZodSchema<unknown>;
  protected abstract mapResponse(rawResponse: unknown, context: ReadonlyDecisionContext): Omit<AgentResponse, 'metadata' | 'agentName'>;

  async execute(context: ReadonlyDecisionContext, requestId: string): Promise<AgentResponse> {
    const startTime = Date.now();
    const messages = this.buildPromptMessages(context);
    const schema = this.getResponseSchema();
    
    // Default provider mapping logic (simplified for agent level, defaults to aiConfig)
    const providerName = aiConfig.defaultProvider;

    const rawResponse = await this.aiService.executeRequest(
      { messages: messages as { role: 'user' | 'system' | 'assistant'; content: string }[] },
      schema,
      { requestId, providerOverride: providerName }
    );

    const mappedData = this.mapResponse(rawResponse, context);

    return {
      agentName: this.name,
      ...mappedData,
      metadata: {
        provider: providerName,
        model: 'default', // Model details would ideally be fetched from provider config
        executionTimeMs: Date.now() - startTime,
        requestId,
        agentVersion: this.version
      }
    };
  }
}

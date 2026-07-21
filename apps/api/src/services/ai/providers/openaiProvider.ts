import { BaseProvider } from '../baseProvider';
import { AIRequest, AIResponse } from '../provider.types';

export class OpenAIProvider extends BaseProvider {
  constructor() {
    super('openai');
  }

  protected async doGenerate(request: AIRequest): Promise<AIResponse> {
    // Phase 2B: Stubbed external AI call
    return {
      content: JSON.stringify({ stub: true, provider: 'openai', originalRequest: request }),
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    };
  }
}

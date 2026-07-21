import { BaseProvider } from '../baseProvider';
import { AIRequest, AIResponse } from '../provider.types';

export class AnthropicProvider extends BaseProvider {
  constructor() {
    super('anthropic');
  }

  protected async doGenerate(request: AIRequest): Promise<AIResponse> {
    // Phase 2B: Stubbed external AI call
    return {
      content: JSON.stringify({ stub: true, provider: 'anthropic', originalRequest: request }),
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    };
  }
}

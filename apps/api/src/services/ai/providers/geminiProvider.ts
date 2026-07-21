import { BaseProvider } from '../baseProvider';
import { AIRequest, AIResponse } from '../provider.types';

export class GeminiProvider extends BaseProvider {
  constructor() {
    super('gemini');
  }

  protected async doGenerate(request: AIRequest): Promise<AIResponse> {
    // Phase 2B: Stubbed external AI call
    return {
      content: JSON.stringify({ stub: true, provider: 'gemini', originalRequest: request }),
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    };
  }
}

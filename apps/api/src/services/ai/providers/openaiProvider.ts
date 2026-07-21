import { BaseProvider } from '../baseProvider';
import { AIRequest, AIResponse } from '../provider.types';
import { aiConfig } from '../../../config/ai';
import { AIProviderError, AIRateLimitError, AITimeoutError } from '../../../errors/ai.errors';

export class OpenAIProvider extends BaseProvider {
  constructor() {
    super('openai');
  }

  protected async doGenerate(request: AIRequest): Promise<AIResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new AIProviderError('OPENAI_API_KEY is not configured');
    }

    const model = aiConfig.models.openai;
    const body = JSON.stringify({
      model,
      messages: request.messages,
      temperature: request.temperature ?? aiConfig.temperature,
      max_tokens: request.maxTokens ?? aiConfig.maxTokens,
    });

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body,
    };

    if (request.signal) {
      fetchOptions.signal = request.signal;
    }

    let res: Response;
    try {
      res = await fetch('https://api.openai.com/v1/chat/completions', fetchOptions);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AITimeoutError();
      }
      throw new AIProviderError(`OpenAI request failed: ${(error as Error).message}`);
    }

    if (res.status === 429) {
      throw new AIRateLimitError('OpenAI rate limit exceeded');
    }

    if (!res.ok) {
      const errorBody = await res.text().catch(() => 'unknown');
      throw new AIProviderError(`OpenAI API error (${res.status}): ${errorBody}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    return {
      content,
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
    };
  }
}

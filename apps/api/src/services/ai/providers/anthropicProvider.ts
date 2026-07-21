import { BaseProvider } from '../baseProvider';
import { AIRequest, AIResponse } from '../provider.types';
import { aiConfig } from '../../../config/ai';
import { AIProviderError, AIRateLimitError, AITimeoutError } from '../../../errors/ai.errors';

export class AnthropicProvider extends BaseProvider {
  constructor() {
    super('anthropic');
  }

  protected async doGenerate(request: AIRequest): Promise<AIResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new AIProviderError('ANTHROPIC_API_KEY is not configured');
    }

    const model = aiConfig.models.anthropic;

    // Anthropic Messages API expects system separately from messages,
    // and only 'user' and 'assistant' roles in the messages array.
    const systemMessage = request.messages.find(m => m.role === 'system')?.content;
    const conversationMessages = request.messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const body = JSON.stringify({
      model,
      max_tokens: request.maxTokens ?? aiConfig.maxTokens,
      ...(systemMessage ? { system: systemMessage } : {}),
      messages: conversationMessages,
    });

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body,
    };

    if (request.signal) {
      fetchOptions.signal = request.signal;
    }

    let res: Response;
    try {
      res = await fetch('https://api.anthropic.com/v1/messages', fetchOptions);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AITimeoutError();
      }
      throw new AIProviderError(`Anthropic request failed: ${(error as Error).message}`);
    }

    if (res.status === 429) {
      throw new AIRateLimitError('Anthropic rate limit exceeded');
    }

    if (!res.ok) {
      const errorBody = await res.text().catch(() => 'unknown');
      throw new AIProviderError(`Anthropic API error (${res.status}): ${errorBody}`);
    }

    const data = await res.json();
    const content = data.content?.[0]?.text ?? '';

    return {
      content,
      usage: {
        promptTokens: data.usage?.input_tokens ?? 0,
        completionTokens: data.usage?.output_tokens ?? 0,
        totalTokens: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
      },
    };
  }
}

import { BaseProvider } from '../baseProvider';
import { AIRequest, AIResponse } from '../provider.types';
import { aiConfig } from '../../../config/ai';
import { AIProviderError, AIRateLimitError, AITimeoutError } from '../../../errors/ai.errors';

export class GeminiProvider extends BaseProvider {
  constructor() {
    super('gemini');
  }

  protected async doGenerate(request: AIRequest): Promise<AIResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AIProviderError('GEMINI_API_KEY is not configured');
    }

    const model = aiConfig.models.gemini;

    // Gemini uses 'contents' with 'parts' and maps 'assistant' role to 'model'.
    const systemInstruction = request.messages.find(m => m.role === 'system')?.content;
    const contents = request.messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const body = JSON.stringify({
      contents,
      ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
      generationConfig: {
        temperature: request.temperature ?? aiConfig.temperature,
        maxOutputTokens: request.maxTokens ?? aiConfig.maxTokens,
      },
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    };

    if (request.signal) {
      fetchOptions.signal = request.signal;
    }

    let res: Response;
    try {
      res = await fetch(url, fetchOptions);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AITimeoutError();
      }
      throw new AIProviderError(`Gemini request failed: ${(error as Error).message}`);
    }

    if (res.status === 429) {
      throw new AIRateLimitError('Gemini rate limit exceeded');
    }

    if (!res.ok) {
      const errorBody = await res.text().catch(() => 'unknown');
      throw new AIProviderError(`Gemini API error (${res.status}): ${errorBody}`);
    }

    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const usageMetadata = data.usageMetadata;

    return {
      content,
      usage: {
        promptTokens: usageMetadata?.promptTokenCount ?? 0,
        completionTokens: usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: usageMetadata?.totalTokenCount ?? 0,
      },
    };
  }
}

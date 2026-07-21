import { AIProvider, AIRequest, AIResponse } from './provider.types';
import { Logger } from '../../utils/logger';

export abstract class BaseProvider implements AIProvider {
  protected providerName: string;

  constructor(providerName: string) {
    this.providerName = providerName;
  }

  protected abstract doGenerate(request: AIRequest): Promise<AIResponse>;

  async generate(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    try {
      const response = await this.doGenerate(request);
      const latency = Date.now() - startTime;
      
      Logger.debug(`[AI Observability] Provider: ${this.providerName} | Latency: ${latency}ms | Tokens: ${response.usage?.totalTokens ?? 'unknown'}`);
      
      return response;
    } catch (error) {
      const latency = Date.now() - startTime;
      Logger.error(`[AI Observability] Provider: ${this.providerName} | Latency: ${latency}ms | Error: ${(error as Error).message}`, error);
      throw error;
    }
  }
}

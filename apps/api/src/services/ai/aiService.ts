import { AIRequest, AIResponse } from './provider.types';
import { ProviderFactory } from './providerFactory';
import { aiConfig } from '../../config/ai';
import { AIRateLimitError, AITimeoutError, ProviderUnavailableError } from '../../errors/ai.errors';

export interface ExecuteOptions {
  requestId: string;
  jobId?: string;
  projectId?: string;
  providerOverride?: string;
}

export class AIService {
  private isRetryable(error: unknown): boolean {
    return (
      error instanceof AIRateLimitError ||
      error instanceof AITimeoutError ||
      error instanceof ProviderUnavailableError
    );
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async executeRequest(request: AIRequest, options: ExecuteOptions): Promise<AIResponse> {
    const providerName = options.providerOverride || aiConfig.defaultProvider;
    const provider = ProviderFactory.create(providerName);
    
    let attempt = 0;
    const maxRetries = aiConfig.retryCount;
    const startTime = Date.now();

    while (attempt <= maxRetries) {
      try {
        const response = await provider.generate({
          ...request,
          temperature: request.temperature ?? aiConfig.temperature,
          maxTokens: request.maxTokens ?? aiConfig.maxTokens,
        });

        const latency = Date.now() - startTime;
        console.log(JSON.stringify({
          msg: 'AI request successful',
          requestId: options.requestId,
          jobId: options.jobId,
          projectId: options.projectId,
          provider: providerName,
          latency,
          retryCount: attempt,
        }));

        return response;
      } catch (error) {
        if (this.isRetryable(error) && attempt < maxRetries) {
          attempt++;
          const delay = Math.pow(2, attempt) * 1000;
          
          console.warn(JSON.stringify({
            msg: 'Retrying AI request',
            requestId: options.requestId,
            jobId: options.jobId,
            projectId: options.projectId,
            provider: providerName,
            retryCount: attempt,
            error: (error as Error).message
          }));

          await this.sleep(delay);
          continue;
        }

        const latency = Date.now() - startTime;
        console.error(JSON.stringify({
          msg: 'AI request failed',
          requestId: options.requestId,
          jobId: options.jobId,
          projectId: options.projectId,
          provider: providerName,
          latency,
          retryCount: attempt,
          error: (error as Error).message
        }));

        throw error;
      }
    }

    throw new Error('Unreachable code');
  }
}

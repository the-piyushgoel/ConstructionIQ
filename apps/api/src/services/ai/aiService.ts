import { AIRequest } from './provider.types';
import { ProviderFactory } from './providerFactory';
import { aiConfig } from '../../config/ai';
import { AIRateLimitError, AITimeoutError, ProviderUnavailableError } from '../../errors/ai.errors';
import { ZodSchema } from 'zod';
import { ResponseParser } from './parser/responseParser';
import { Logger } from '../../utils/logger';
import { Metrics } from '../../utils/metrics';

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

  async executeRequest<T>(request: AIRequest, schema: ZodSchema<T>, options: ExecuteOptions): Promise<T> {
    const providerName = options.providerOverride || aiConfig.defaultProvider;
    const provider = ProviderFactory.create(providerName);
    
    let attempt = 0;
    const maxRetries = aiConfig.retryCount;
    const startTime = Date.now();

    while (attempt <= maxRetries) {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), aiConfig.timeoutMs);

      try {
        const response = await provider.generate({
          ...request,
          temperature: request.temperature ?? aiConfig.temperature,
          maxTokens: request.maxTokens ?? aiConfig.maxTokens,
          signal: abortController.signal,
        });
        
        clearTimeout(timeoutId);

        const latency = Date.now() - startTime;
        Logger.info('AI request successful', {
          requestId: options.requestId,
          jobId: options.jobId,
          projectId: options.projectId,
          provider: providerName,
          latency,
          retryCount: attempt,
        });
        
        Metrics.recordLatency('aiService_request_latency', latency, { provider: providerName });
        Metrics.incrementCounter('aiService_request_success', 1, { provider: providerName });

        return ResponseParser.parseAndValidate(response.content, schema);
      } catch (error) {
        clearTimeout(timeoutId);

        let finalError = error;
        if (error instanceof Error && error.name === 'AbortError') {
          finalError = new AITimeoutError();
        }
        if (this.isRetryable(finalError) && attempt < maxRetries) {
          attempt++;
          const delay = Math.pow(2, attempt) * 1000;
          
          Logger.warn('Retrying AI request', {
            requestId: options.requestId,
            jobId: options.jobId,
            projectId: options.projectId,
            provider: providerName,
            retryCount: attempt,
            error: (finalError as Error).message
          });

          Metrics.incrementCounter('aiService_request_retry', 1, { provider: providerName });
          await this.sleep(delay);
          continue;
        }

        const latency = Date.now() - startTime;
        Logger.error('AI request failed', finalError, {
          requestId: options.requestId,
          jobId: options.jobId,
          projectId: options.projectId,
          provider: providerName,
          latency,
          retryCount: attempt,
        });

        Metrics.incrementCounter('aiService_request_error', 1, { provider: providerName });
        throw finalError;
      }
    }

    throw new Error('Unreachable code');
  }
}

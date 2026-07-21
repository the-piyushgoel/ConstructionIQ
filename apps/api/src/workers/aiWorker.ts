import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { AIJobPayload } from '../queues/aiJobTypes';
import { AIService } from '../services/ai/aiService';
import { RiskPrompt } from '../services/ai/prompts/riskPrompt';
import { DecisionPrompt } from '../services/ai/prompts/decisionPrompt';
import { SchedulePrompt } from '../services/ai/prompts/schedulePrompt';
import { BasePrompt } from '../services/ai/prompts/basePrompt';
import { z } from 'zod';
import { env } from '../config/env';
import { Logger } from '../utils/logger';
import { Metrics } from '../utils/metrics';
import { RequestContext } from '../utils/requestContext';

export let aiWorker: Worker<AIJobPayload> | null = null;

export const initAIWorker = () => {
  const redisUrl = env.REDIS_URL || 'redis://localhost:6379';
  
  try {
    const redisConnection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      retryStrategy: (times) => {
        if (times > 3) {
          return null; // Stop retrying
        }
        return Math.min(times * 50, 2000);
      }
    });

    redisConnection.on('error', () => {
      // Ignore errors silently on the worker side as the queue handles the main logging
    });

    const aiService = new AIService();

    aiWorker = new Worker<AIJobPayload>('ai-jobs', async (job: Job<AIJobPayload>) => {
      return RequestContext.runAsync({ requestId: job.data.requestId || job.id || 'worker-unknown' }, async () => {
        const startTime = Date.now();
        Logger.info(`[AI Worker] Processing job ${job.id} of type ${job.data.type}`);
        
        let promptBuilder: BasePrompt<unknown, unknown>;
        let schema: z.ZodSchema<unknown>;
        
        switch (job.data.type) {
          case 'RiskPrediction':
          case 'RiskAttribution':
            promptBuilder = new RiskPrompt();
            schema = z.object({
              predictedRisks: z.array(z.object({
                type: z.string(),
                probability: z.number(),
                severity: z.number(),
                description: z.string()
              }))
            });
            break;
          case 'RecoveryGeneration':
            promptBuilder = new DecisionPrompt();
            schema = z.object({
              evaluation: z.object({
                recommendedOptionId: z.string(),
                rationale: z.string(),
                confidence: z.number()
              })
            });
            break;
          case 'Simulation':
            promptBuilder = new SchedulePrompt();
            schema = z.object({
              adjustedTimeline: z.array(z.object({
                taskId: z.string(),
                newStartDate: z.string(),
                newEndDate: z.string(),
                reason: z.string()
              }))
            });
            break;
          case 'DecisionSupport':
            promptBuilder = new DecisionPrompt();
            schema = z.object({
              evaluation: z.object({
                recommendedOptionId: z.string(),
                rationale: z.string(),
                confidence: z.number()
              })
            });
            break;
          default:
            throw new Error(`Unsupported job type: ${job.data.type}`);
        }

        const requestContext = job.data.data;
        const request = {
          messages: promptBuilder.buildMessages(requestContext)
        };

        try {
          await aiService.executeRequest(
            request,
            schema,
            {
              requestId: job.data.requestId,
              jobId: job.id,
              projectId: job.data.projectId,
            }
          );

          Metrics.recordLatency('aiWorker_execution_time', Date.now() - startTime, { type: job.data.type });
          Metrics.incrementCounter('aiWorker_job_success', 1, { type: job.data.type });
          Logger.info(`[AI Worker] Successfully processed job ${job.id}`);
        } catch (error) {
          Metrics.incrementCounter('aiWorker_job_failure', 1, { type: job.data.type });
          throw error;
        }
      });
    }, {
      connection: redisConnection
    });

    Logger.info('[AI Worker] Initialized successfully.');
  } catch (err) {
    Logger.warn('[AI Worker] Failed to initialize worker. AI features disabled.');
    aiWorker = null;
  }
};

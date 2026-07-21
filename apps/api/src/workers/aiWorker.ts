import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { AIJobPayload } from '../queues/aiJobTypes';
import { AIService } from '../services/ai/aiService';

export let aiWorker: Worker<AIJobPayload> | null = null;

export const initAIWorker = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
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
      console.log(`[AI Worker] Processing job ${job.id} of type ${job.data.type}`);
      
      // Dispatcher logic -> AIService
      // Phase 2B placeholder execution logic:
      await aiService.executeRequest(
        {
          messages: [{ role: 'user', content: 'Placeholder job execution' }]
        },
        {
          requestId: job.data.requestId,
          jobId: job.id,
          projectId: job.data.projectId,
        }
      );

      console.log(`[AI Worker] Successfully processed job ${job.id}`);
    }, {
      connection: redisConnection
    });

    console.log('[AI Worker] Initialized successfully.');
  } catch (err) {
    console.warn('[AI Worker] Failed to initialize worker. AI features disabled.');
    aiWorker = null;
  }
};

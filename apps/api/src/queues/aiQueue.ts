import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { AIJobPayload } from './aiJobTypes';

export let aiQueue: Queue<AIJobPayload> | null = null;
let redisConnection: Redis | null = null;

export const initAIQueue = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  try {
    redisConnection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn('[AI Queue] Redis is unavailable. Disabling AI queue gracefully.');
          return null; // Stop retrying
        }
        return Math.min(times * 50, 2000);
      }
    });

    redisConnection.on('error', (err) => {
      // Catch error to prevent unhandled rejection crashing the app
      console.warn(`[AI Queue] Redis connection error: ${err.message}`);
    });

    aiQueue = new Queue<AIJobPayload>('ai-jobs', {
      connection: redisConnection
    });

    console.log('[AI Queue] Initialized successfully.');
  } catch (err) {
    console.warn(`[AI Queue] Failed to initialize Redis: ${(err as Error).message}. AI features will be disabled.`);
    aiQueue = null;
  }
};

export const addAIJob = async (jobId: string, payload: AIJobPayload) => {
  if (!aiQueue) {
    console.warn(`[AI Queue] Cannot add job ${jobId} because queue is disabled.`);
    return;
  }
  await aiQueue.add(jobId, payload);
};

import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { AIJobPayload } from './aiJobTypes';
import { env } from '../config/env';
import { Logger } from '../utils/logger';

export let aiQueue: Queue<AIJobPayload> | null = null;
let redisConnection: Redis | null = null;

export const initAIQueue = () => {
  const redisUrl = env.REDIS_URL || 'redis://localhost:6379';
  
  try {
    redisConnection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      retryStrategy: (times) => {
        if (times > 3) {
          Logger.warn('[AI Queue] Redis is unavailable. Disabling AI queue gracefully.');
          return null; // Stop retrying
        }
        return Math.min(times * 50, 2000);
      }
    });

    redisConnection.on('error', (err) => {
      // Catch error to prevent unhandled rejection crashing the app
      Logger.warn(`[AI Queue] Redis connection error: ${err.message}`);
    });

    aiQueue = new Queue<AIJobPayload>('ai-jobs', {
      connection: redisConnection
    });

    Logger.info('[AI Queue] Initialized successfully.');
  } catch (err) {
    Logger.warn(`[AI Queue] Failed to initialize Redis: ${(err as Error).message}. AI features will be disabled.`);
    aiQueue = null;
  }
};

export const addAIJob = async (jobId: string, payload: AIJobPayload) => {
  if (!aiQueue) {
    Logger.warn(`[AI Queue] Cannot add job ${jobId} because queue is disabled.`);
    return;
  }
  await aiQueue.add(jobId, payload);
};

import { env } from './env';

export interface AIConfig {
  defaultProvider: string;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
  retryCount: number;
  models: {
    openai: string;
    anthropic: string;
    gemini: string;
  };
}

export const aiConfig: AIConfig = {
  defaultProvider: env.AI_DEFAULT_PROVIDER,
  temperature: parseFloat(env.AI_TEMPERATURE),
  maxTokens: parseInt(env.AI_MAX_TOKENS, 10),
  timeoutMs: parseInt(env.AI_TIMEOUT_MS, 10),
  retryCount: parseInt(env.AI_RETRY_COUNT, 10),
  models: {
    openai: env.AI_MODEL_OPENAI,
    anthropic: env.AI_MODEL_ANTHROPIC,
    gemini: env.AI_MODEL_GEMINI,
  },
};

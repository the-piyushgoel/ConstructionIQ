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
  defaultProvider: process.env.AI_DEFAULT_PROVIDER || 'openai',
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000', 10),
  timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '30000', 10),
  retryCount: parseInt(process.env.AI_RETRY_COUNT || '3', 10),
  models: {
    openai: process.env.AI_MODEL_OPENAI || 'gpt-4o',
    anthropic: process.env.AI_MODEL_ANTHROPIC || 'claude-3-5-sonnet-20240620',
    gemini: process.env.AI_MODEL_GEMINI || 'gemini-1.5-pro',
  },
};

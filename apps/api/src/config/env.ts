import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  CORS_ORIGIN: z.string().default('*'),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().default('default-secret-do-not-use-in-prod'),
  REDIS_URL: z.string().optional(),
  
  // AI Config
  AI_DEFAULT_PROVIDER: z.string().default('openai'),
  AI_TEMPERATURE: z.string().default('0.7'),
  AI_MAX_TOKENS: z.string().default('2000'),
  AI_TIMEOUT_MS: z.string().default('30000'),
  AI_RETRY_COUNT: z.string().default('3'),
  AI_MODEL_OPENAI: z.string().default('gpt-4o'),
  AI_MODEL_ANTHROPIC: z.string().default('claude-3-5-sonnet-20240620'),
  AI_MODEL_GEMINI: z.string().default('gemini-1.5-pro'),
});

type EnvConfig = z.infer<typeof envSchema>;

let envConfig: EnvConfig;

try {
  envConfig = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:', JSON.stringify(error.format(), null, 2));
  } else {
    console.error('❌ Environment validation failed', error);
  }
  process.exit(1);
}

export const env = envConfig;

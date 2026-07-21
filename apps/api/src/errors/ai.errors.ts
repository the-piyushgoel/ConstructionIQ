import { AppError } from '../types';

export class AIProviderError extends AppError {
  constructor(message: string, details?: unknown) {
    super(502, 'AI_PROVIDER_ERROR', message, details);
    this.name = 'AIProviderError';
  }
}

export class AIRateLimitError extends AppError {
  constructor(message: string = 'AI provider rate limit exceeded', details?: unknown) {
    super(429, 'AI_RATE_LIMIT_ERROR', message, details);
    this.name = 'AIRateLimitError';
  }
}

export class AIValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, 'AI_VALIDATION_ERROR', message, details);
    this.name = 'AIValidationError';
  }
}

export class AITimeoutError extends AppError {
  constructor(message: string = 'AI provider request timed out', details?: unknown) {
    super(504, 'AI_TIMEOUT_ERROR', message, details);
    this.name = 'AITimeoutError';
  }
}

export class ProviderUnavailableError extends AppError {
  constructor(message: string = 'AI provider is temporarily unavailable', details?: unknown) {
    super(503, 'PROVIDER_UNAVAILABLE_ERROR', message, details);
    this.name = 'ProviderUnavailableError';
  }
}

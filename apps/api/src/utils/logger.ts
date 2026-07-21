import { RequestContext } from './requestContext';

export interface ILogger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

export class JsonLogger implements ILogger {
  private formatMessage(level: string, message: string, meta?: Record<string, unknown>, error?: unknown): string {
    const context = RequestContext.get();
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      requestId: context?.requestId,
      ...meta,
      ...(error instanceof Error ? { error: error.message, stack: error.stack } : { error }),
    };

    return JSON.stringify(logEntry);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    console.info(this.formatMessage('INFO', message, meta));
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(this.formatMessage('WARN', message, meta));
  }

  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    console.error(this.formatMessage('ERROR', message, meta, error));
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('DEBUG', message, meta));
    }
  }
}

export const Logger: ILogger = new JsonLogger();

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../types';
import { Logger } from '../utils/logger';
import { RequestContext } from '../utils/requestContext';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const requestId = RequestContext.getRequestId() || (req as Request & { id?: string }).id || 'unknown';

  if (err instanceof AppError) {
    Logger.warn(`[AppError] ${err.errorCode}: ${err.message}`, { errorCode: err.errorCode, details: err.details });
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details,
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  if (err instanceof ZodError) {
    Logger.warn(`[ValidationError] Invalid request data`, { issues: err.issues });
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.issues,
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  if (err instanceof SyntaxError && 'body' in err) {
    Logger.warn(`[SyntaxError] Malformed JSON`);
    return res.status(400).json({
      success: false,
      error: {
        code: 'MALFORMED_JSON',
        message: 'Invalid JSON payload format',
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  Logger.error(`[UnhandledError] ${err.message}`, err);
  
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
    },
  });
};

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Router } from 'express';
import { randomUUID } from 'crypto';
import morgan from 'morgan';
import { RequestContext } from '../utils/requestContext';
import { env } from '../config/env';

export const setupSecurity = (app: Router) => {
  app.use(helmet());

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  app.use((req, res, next) => {
    const requestId = randomUUID();
    (req as unknown as import('express').Request & { id?: string }).id = requestId;
    res.setHeader('X-Request-ID', requestId);
    
    RequestContext.run({ requestId }, () => {
      next();
    });
  });

  // Use a custom token to avoid relying on req[header] that doesn't exist
  morgan.token('req-id', (req: import('http').IncomingMessage & { id?: string }) => req.id);
  app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms [req-id: :req-id]')
  );
};

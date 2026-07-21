import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AppError } from '../../types';
import { JwtPayload } from './auth.types';
import { env } from '../../config/env';

export const authenticateJWT = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Missing or invalid authorization header'));
  }

  const token = authHeader.split(' ')[1];
  const secret = env.JWT_SECRET;
  if (!secret) return next(new AppError(500, 'INTERNAL_SERVER_ERROR', 'JWT_SECRET is not configured'));

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    next(new AppError(401, 'INVALID_TOKEN', 'Token is expired or invalid'));
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, 'FORBIDDEN', 'Insufficient permissions'));
    }
    next();
  };
};

import { z } from 'zod';
import { registerSchema } from './auth.validator';

export type RegisterRequest = z.infer<typeof registerSchema>['body'];

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

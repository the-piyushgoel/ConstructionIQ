import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { Role } from '@prisma/client';
import { AuthRepository } from './auth.repository';
import { AppError } from '../../types';
import { AuthTokens, JwtPayload } from './auth.types';
import { env } from '../../config/env';

export class AuthService {
  constructor(private readonly repo: AuthRepository) {}

  async register(data: import('./auth.types').RegisterRequest): Promise<{ tokens: AuthTokens, user: JwtPayload }> {
    const existing = await this.repo.findUserByEmail(data.email);
    if (existing) {
      throw new AppError(409, 'CONFLICT', 'Email already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await this.repo.createUser({
      email: data.email,
      name: data.name,
      passwordHash,
      role: Role.USER, // Force role to USER ignoring client input
    });

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const secret = env.JWT_SECRET;
    const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });

    const refreshToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.repo.createSession(user.id, refreshToken, expiresAt);

    return {
      tokens: { accessToken, refreshToken },
      user: payload,
    };
  }

  async login(email: string, passwordPlain: string): Promise<{ tokens: AuthTokens, user: JwtPayload }> {
    const user = await this.repo.findUserByEmail(email);
    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const secret = env.JWT_SECRET;
    const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });

    // Refresh token structure
    // TODO: Implement Refresh Token Rotation
    // Currently, we issue long-lived refresh tokens that are overwritten on login/logout.
    // To implement rotation, we must:
    // 1. Issue a new refresh token on every /auth/refresh call.
    // 2. Invalidate the old refresh token immediately.
    // 3. Store token families/chains in the database to detect reuse of old tokens (which implies compromise)
    //    and revoke all tokens in the compromised family.
    // Since this requires database schema updates (token families) and complex state management, 
    // it is deferred to a later phase.
    const refreshToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.repo.createSession(user.id, refreshToken, expiresAt);

    return {
      tokens: { accessToken, refreshToken },
      user: payload,
    };
  }

  async refresh(refreshToken: string): Promise<{ tokens: AuthTokens, user: JwtPayload }> {
    const session = await this.repo.findSessionByToken(refreshToken);
    if (!session || session.expiresAt < new Date()) {
      throw new AppError(401, 'INVALID_TOKEN', 'Refresh token is invalid or expired');
    }
    
    const user = await this.repo.findUserById(session.userId);
    if (!user) {
      throw new AppError(401, 'USER_NOT_FOUND', 'User not found');
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const secret = env.JWT_SECRET;
    const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });

    return {
      tokens: { accessToken, refreshToken },
      user: payload,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.repo.deleteSession(refreshToken);
  }

  async me(userId: string) {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}

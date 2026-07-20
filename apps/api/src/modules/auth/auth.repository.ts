import { User, Session } from '@prisma/client';
import prisma from '../../db/prisma';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async createSession(userId: string, token: string, expiresAt: Date): Promise<Session> {
    return prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async deleteSession(token: string): Promise<void> {
    await prisma.session.delete({
      where: { token },
    }).catch(() => { /* ignore if not found */ });
  }

  async findSessionByToken(token: string): Promise<Session | null> {
    return prisma.session.findUnique({ where: { token } });
  }
}

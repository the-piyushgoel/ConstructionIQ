import { User, Session, Role } from '@prisma/client';
import prisma from '../../db/prisma';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async createUser(data: { email: string; passwordHash: string; name: string; role: Role }): Promise<User> {
    return prisma.user.create({
      data,
    });
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
    await prisma.session.deleteMany({
      where: { token },
    });
  }

  async findSessionByToken(token: string): Promise<Session | null> {
    return prisma.session.findUnique({ where: { token } });
  }
}

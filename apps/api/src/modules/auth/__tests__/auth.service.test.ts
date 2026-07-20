import { AuthService } from '../auth.service';
import { AuthRepository } from '../auth.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../auth.repository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let service: AuthService;
  let repoMock: jest.Mocked<AuthRepository>;

  beforeEach(() => {
    repoMock = new AuthRepository() as jest.Mocked<AuthRepository>;
    service = new AuthService(repoMock);
  });

  describe('login', () => {
    it('should return tokens and user payload for valid credentials', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        role: 'PM' as const,
        name: 'Test',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repoMock.findUserByEmail.mockResolvedValue(mockUser as unknown as import('@prisma/client').User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockAccessToken');
      repoMock.createSession.mockResolvedValue({} as unknown as import('@prisma/client').Session);

      const result = await service.login('test@example.com', 'password');

      expect(result.tokens.accessToken).toBe('mockAccessToken');
      expect(result.tokens.refreshToken).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error if user not found', async () => {
      repoMock.findUserByEmail.mockResolvedValue(null);

      await expect(service.login('test@example.com', 'password')).rejects.toThrow('Invalid email or password');
    });

    it('should throw error if password invalid', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        role: 'PM' as const,
        name: 'Test',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repoMock.findUserByEmail.mockResolvedValue(mockUser as unknown as import('@prisma/client').User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('test@example.com', 'password')).rejects.toThrow('Invalid email or password');
    });
  });
});

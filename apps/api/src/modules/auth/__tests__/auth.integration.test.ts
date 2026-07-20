import request from 'supertest';
import app from '../../../app';
import prisma from '../../../db/prisma';
import bcrypt from 'bcryptjs';

const url = process.env.DATABASE_URL;
const isTestDb = url && url.includes('_test');

if (!isTestDb) {
  console.warn('Skipping integration tests: DATABASE_URL does not point to a test database');
}

const describeTest = isTestDb ? describe : describe.skip;

describeTest('Auth Integration', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should login a valid user', async () => {
    const hash = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        email: 'integration@test.com',
        passwordHash: hash,
        name: 'Integration Test',
        role: 'PM',
      },
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'integration@test.com',
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('integration@test.com');
  });

  it('should return 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nonexistent@test.com',
        password: 'password123',
      });

    expect(res.status).toBe(401);
  });
});

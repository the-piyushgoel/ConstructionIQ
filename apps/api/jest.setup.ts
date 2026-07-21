// Jest global setup: ensure required environment variables are set before env.ts is parsed.
process.env.JWT_SECRET = 'test-jwt-secret-for-jest';
process.env.NODE_ENV = 'test';

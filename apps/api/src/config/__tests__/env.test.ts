describe('Environment Validation', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let originalConsoleError: typeof console.error;
  let originalProcessExit: typeof process.exit;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv }; // Clone environment
    
    originalConsoleError = console.error;
    console.error = jest.fn();
    
    originalProcessExit = process.exit;
    process.exit = jest.fn() as unknown as typeof process.exit;
  });

  afterEach(() => {
    process.env = originalEnv;
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
    jest.resetModules();
  });

  it('should pass and export config if environment is valid', async () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '8080';
    process.env.CORS_ORIGIN = 'https://example.com';
    
    const { env } = await import('../env');
    
    expect(env.NODE_ENV).toBe('production');
    expect(env.PORT).toBe('8080');
    expect(env.CORS_ORIGIN).toBe('https://example.com');
  });

  it('should crash on boot and log formatted errors if required fields are invalid types', async () => {
    process.env.NODE_ENV = 'invalid-env-type'; // Zod expects 'development' | 'production' | 'test'
    
    try {
      await import('../env');
    } catch {
      // Ignored
    }
    
    expect(console.error).toHaveBeenCalledWith(
      '❌ Invalid environment variables:',
      expect.any(String)
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});

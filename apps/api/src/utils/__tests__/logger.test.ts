import { JsonLogger } from '../logger';
import { RequestContext } from '../requestContext';

describe('Logger', () => {
  let originalConsoleInfo: typeof console.info;
  
  beforeEach(() => {
    originalConsoleInfo = console.info;
    console.info = jest.fn();
  });

  afterEach(() => {
    console.info = originalConsoleInfo;
  });

  it('should output strictly structured JSON', () => {
    const logger = new JsonLogger();
    logger.info('Test Message', { extra: 'data' });

    expect(console.info).toHaveBeenCalled();
    const logCallArg = (console.info as jest.Mock).mock.calls[0][0];
    const parsedLog = JSON.parse(logCallArg);

    expect(parsedLog.level).toBe('INFO');
    expect(parsedLog.message).toBe('Test Message');
    expect(parsedLog.extra).toBe('data');
    expect(parsedLog.timestamp).toBeDefined();
  });

  it('should propagate correlation ID if within a RequestContext', () => {
    const logger = new JsonLogger();

    RequestContext.run({ requestId: 'trace-123' }, () => {
      logger.info('Traced Message');
    });

    const logCallArg = (console.info as jest.Mock).mock.calls[0][0];
    const parsedLog = JSON.parse(logCallArg);

    expect(parsedLog.requestId).toBe('trace-123');
  });
});

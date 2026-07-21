import { initAIWorker, aiWorker } from '../aiWorker';

jest.mock('bullmq');
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      on: jest.fn(),
    };
  });
});

describe('aiWorker', () => {
  it('should initialize successfully', () => {
    initAIWorker();
    expect(aiWorker).not.toBeNull();
  });
});

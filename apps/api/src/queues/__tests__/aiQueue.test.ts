import { initAIQueue, addAIJob, aiQueue } from '../aiQueue';

jest.mock('bullmq');
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      on: jest.fn(),
    };
  });
});

describe('aiQueue', () => {
  it('should initialize successfully', () => {
    initAIQueue();
    expect(aiQueue).not.toBeNull();
  });

  it('should allow adding jobs when initialized', async () => {
    initAIQueue();
    const mockAdd = jest.fn();
    // @ts-expect-error mocking private/readonly properties for test
    aiQueue.add = mockAdd;
    
    await addAIJob('job-1', { type: 'RiskPrediction', requestId: '1', data: {} });
    expect(mockAdd).toHaveBeenCalledWith('job-1', expect.any(Object));
  });
});

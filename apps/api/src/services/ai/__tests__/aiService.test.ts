import { AIService } from '../aiService';
import { ProviderFactory } from '../providerFactory';
import { OpenAIProvider } from '../providers/openaiProvider';
import { AIRateLimitError, AIValidationError } from '../../../errors/ai.errors';

jest.mock('../providerFactory');

describe('AIService', () => {
  let aiService: AIService;
  let mockProvider: jest.Mocked<OpenAIProvider>;

  beforeEach(() => {
    mockProvider = new OpenAIProvider() as jest.Mocked<OpenAIProvider>;
    mockProvider.generate = jest.fn();
    (ProviderFactory.create as jest.Mock).mockReturnValue(mockProvider);
    aiService = new AIService();
    
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should successfully execute a request', async () => {
    mockProvider.generate.mockResolvedValue({ content: 'success', usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 } });
    
    const result = await aiService.executeRequest({ messages: [] }, { requestId: '123' });
    expect(result.content).toBe('success');
    expect(mockProvider.generate).toHaveBeenCalledTimes(1);
  });

  it('should retry on AIRateLimitError and eventually succeed', async () => {
    mockProvider.generate
      .mockRejectedValueOnce(new AIRateLimitError())
      .mockResolvedValueOnce({ content: 'success', usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 } });
    
    // @ts-expect-error override private method for testing
    aiService.sleep = jest.fn().mockResolvedValue(true);

    const result = await aiService.executeRequest({ messages: [] }, { requestId: '123' });
    expect(result.content).toBe('success');
    expect(mockProvider.generate).toHaveBeenCalledTimes(2);
  });

  it('should NOT retry on AIValidationError', async () => {
    mockProvider.generate.mockRejectedValueOnce(new AIValidationError('Invalid schema'));
    
    await expect(aiService.executeRequest({ messages: [] }, { requestId: '123' })).rejects.toThrow(AIValidationError);
    expect(mockProvider.generate).toHaveBeenCalledTimes(1);
  });
});

import { ProviderFactory } from '../providerFactory';
import { OpenAIProvider } from '../providers/openaiProvider';

describe('ProviderFactory', () => {
  it('should create an instance of a provider and cache it', () => {
    const provider1 = ProviderFactory.create('openai');
    const provider2 = ProviderFactory.create('openai');
    
    expect(provider1).toBeInstanceOf(OpenAIProvider);
    expect(provider1).toBe(provider2); // Must be the exact same instance
  });

  it('should throw for unsupported providers', () => {
    expect(() => ProviderFactory.create('invalid')).toThrow('Unsupported AI provider: invalid');
  });
});

import { AIProvider } from './provider.types';
import { ProviderRegistry, ProviderName } from './providerRegistry';
import { aiConfig } from '../../config/ai';

export class ProviderFactory {
  private static instances = new Map<string, AIProvider>();

  static create(providerName: string = aiConfig.defaultProvider): AIProvider {
    if (this.instances.has(providerName)) {
      return this.instances.get(providerName)!;
    }

    const ProviderClass = ProviderRegistry[providerName as ProviderName];
    if (!ProviderClass) {
      throw new Error(`Unsupported AI provider: ${providerName}`);
    }

    const instance = new ProviderClass();
    this.instances.set(providerName, instance);
    
    return instance;
  }
}

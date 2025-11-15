import { BaseAIProvider, AIProviderConfig } from './BaseProvider';
import { AnthropicProvider } from './AnthropicProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { GoogleProvider } from './GoogleProvider';
import logger from '@/utils/logger';

export type AIProviderType = 'anthropic' | 'openai' | 'google' | 'cohere';

export interface ProviderConfig extends AIProviderConfig {
  provider: AIProviderType;
}

/**
 * Factory for creating AI providers
 */
export class AIProviderFactory {
  /**
   * Create an AI provider instance
   */
  static createProvider(config: ProviderConfig): BaseAIProvider {
    logger.info(`Creating AI provider: ${config.provider}`);

    switch (config.provider.toLowerCase()) {
      case 'anthropic':
        return new AnthropicProvider(config);

      case 'openai':
        return new OpenAIProvider(config);

      case 'google':
      case 'gemini':
        return new GoogleProvider(config);

      default:
        logger.warn(`Unknown provider: ${config.provider}, defaulting to Anthropic`);
        return new AnthropicProvider(config);
    }
  }

  /**
   * Get provider from environment variables
   */
  static createFromEnv(): BaseAIProvider {
    const provider = (process.env.AI_PROVIDER || 'anthropic') as AIProviderType;
    const apiKey = this.getApiKeyForProvider(provider);

    if (!apiKey) {
      throw new Error(`API key not found for provider: ${provider}`);
    }

    return this.createProvider({
      provider,
      apiKey,
      model: process.env.DEFAULT_MODEL,
      maxTokens: parseInt(process.env.MAX_TOKENS_CHAPTER || '16000'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    });
  }

  /**
   * Get API key for specific provider from environment
   */
  private static getApiKeyForProvider(provider: AIProviderType): string {
    const envKeys: Record<AIProviderType, string> = {
      anthropic: process.env.ANTHROPIC_API_KEY || '',
      openai: process.env.OPENAI_API_KEY || '',
      google: process.env.GOOGLE_API_KEY || '',
      cohere: process.env.COHERE_API_KEY || '',
    };

    return envKeys[provider] || '';
  }

  /**
   * Get all available providers with their configuration status
   */
  static getAvailableProviders(): Array<{
    name: AIProviderType;
    configured: boolean;
    models: string[];
  }> {
    const providers: AIProviderType[] = ['anthropic', 'openai', 'google'];

    return providers.map(provider => {
      const apiKey = this.getApiKeyForProvider(provider);
      let models: string[] = [];

      if (apiKey) {
        try {
          const instance = this.createProvider({ provider, apiKey });
          models = instance.getAvailableModels();
        } catch (error) {
          logger.error(`Error getting models for ${provider}:`, error);
        }
      }

      return {
        name: provider,
        configured: !!apiKey,
        models,
      };
    });
  }

  /**
   * Validate provider configuration
   */
  static async validateProvider(config: ProviderConfig): Promise<boolean> {
    try {
      const provider = this.createProvider(config);
      const response = await provider.generate('Test connection', { maxTokens: 10 });
      return !!response.content;
    } catch (error) {
      logger.error('Provider validation failed:', error);
      return false;
    }
  }
}

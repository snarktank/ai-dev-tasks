import { BaseAIProvider, AIProviderConfig } from './BaseProvider';
import { AnthropicProvider } from './AnthropicProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { GoogleProvider } from './GoogleProvider';
import { LocalProvider, LocalProviderConfig } from './LocalProvider';
import { KimiProvider } from './KimiProvider';
import { GensparkProvider } from './GensparkProvider';
import logger from '@/utils/logger';

export type AIProviderType = 'anthropic' | 'openai' | 'google' | 'local' | 'kimi' | 'genspark';

export interface ProviderConfig extends AIProviderConfig {
  provider: AIProviderType;
  baseUrl?: string; // For local provider
  localProvider?: 'ollama' | 'lmstudio' | 'localai' | 'textgen' | 'openai-compatible';
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

      case 'local':
      case 'ollama':
      case 'lmstudio':
        return new LocalProvider({
          ...config,
          baseUrl: config.baseUrl || process.env.LOCAL_LLM_URL || 'http://localhost:11434',
          provider: config.localProvider || 'ollama',
        } as LocalProviderConfig);

      case 'kimi':
      case 'moonshot':
        return new KimiProvider({
          apiKey: config.apiKey,
          model: config.model,
          baseUrl: config.baseUrl || process.env.KIMI_BASE_URL,
          maxTokens: config.maxTokens,
        });

      case 'genspark':
        return new GensparkProvider({
          apiKey: config.apiKey,
          model: config.model,
          baseUrl: config.baseUrl || process.env.GENSPARK_BASE_URL,
          maxTokens: config.maxTokens,
        });

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

    // Local provider doesn't need an API key
    if (!apiKey && provider !== 'local') {
      throw new Error(`API key not found for provider: ${provider}`);
    }

    return this.createProvider({
      provider,
      apiKey: apiKey || 'not-needed-for-local',
      model: process.env.DEFAULT_MODEL,
      maxTokens: parseInt(process.env.MAX_TOKENS_CHAPTER || '16000'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
      baseUrl: process.env.LOCAL_LLM_URL,
      localProvider: process.env.LOCAL_LLM_PROVIDER as any,
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
      local: 'not-needed', // Local LLMs don't need API keys
      kimi: process.env.KIMI_API_KEY || '',
      genspark: process.env.GENSPARK_API_KEY || '',
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
    const providers: AIProviderType[] = ['anthropic', 'openai', 'google', 'local', 'kimi', 'genspark'];

    return providers.map(provider => {
      const apiKey = this.getApiKeyForProvider(provider);
      let models: string[] = [];

      if (apiKey || provider === 'local') {
        try {
          const instance = this.createProvider({ provider, apiKey });
          models = instance.getAvailableModels();
        } catch (error) {
          logger.error(`Error getting models for ${provider}:`, error);
        }
      }

      return {
        name: provider,
        configured: provider === 'local' ? !!process.env.LOCAL_LLM_URL : !!apiKey,
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

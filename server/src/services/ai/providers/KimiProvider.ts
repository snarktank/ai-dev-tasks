/**
 * Kimi AI Provider (Moonshot AI)
 *
 * Kimi is powered by Moonshot AI's K2 large language model.
 * - 256K context window (one of the largest available)
 * - OpenAI-compatible API
 * - Specialized in long-context reasoning
 * - Free tier available: 6 requests/min, 64K tokens/min, 3M tokens/day
 *
 * Official Platform: https://platform.moonshot.ai/
 * API Docs: https://platform.moonshot.ai/docs
 */

import OpenAI from 'openai';
import { BaseAIProvider, AIResponse, AIMessage, AIProviderConfig } from './BaseProvider';

export interface KimiProviderConfig extends AIProviderConfig {
  baseUrl?: string;
}

export class KimiProvider extends BaseAIProvider {
  private client: OpenAI;
  private baseUrl: string;

  // Available Kimi models
  private static readonly MODELS = {
    K2: 'moonshot-v1-8k',           // 8K context, fastest
    K2_32K: 'moonshot-v1-32k',      // 32K context, balanced
    K2_128K: 'moonshot-v1-128k',    // 128K context, large
    K2_256K: 'moonshot-v1-256k',    // 256K context, maximum (Kimi's specialty)
  };

  constructor(config: KimiProviderConfig) {
    super({
      ...config,
      model: config.model || KimiProvider.MODELS.K2_128K,
    });
    this.baseUrl = config.baseUrl || 'https://api.moonshot.ai/v1';

    // Initialize OpenAI client with Kimi's endpoint
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseUrl,
    });
  }

  async generate(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }): Promise<AIResponse> {
    return this.generateFromMessages([{ role: 'user', content: prompt }], options);
  }

  async generateFromMessages(messages: AIMessage[], options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }): Promise<AIResponse> {
    try {
      const model = options?.model || this.defaultModel;
      const maxTokens = options?.maxTokens || this.maxTokens;
      const temperature = options?.temperature ?? this.temperature;

      const response = await this.client.chat.completions.create({
        model: model,
        messages: messages as any,
        max_tokens: maxTokens,
        temperature: temperature,
      });

      const content = response.choices[0]?.message?.content || '';
      const totalTokens = response.usage?.total_tokens || 0;

      return {
        content,
        tokensUsed: totalTokens,
        model: response.model,
      };
    } catch (error: any) {
      throw new Error(`Kimi API error: ${error.message}`);
    }
  }

  getProviderName(): string {
    return 'Kimi (Moonshot AI)';
  }

  getDefaultModel(): string {
    return KimiProvider.MODELS.K2_128K;
  }

  getAvailableModels(): string[] {
    return Object.values(KimiProvider.MODELS);
  }

  /**
   * Estimate cost for Kimi API usage
   *
   * Pricing (as of 2025):
   * - moonshot-v1-8k: $0.12/1M input tokens, $0.12/1M output tokens
   * - moonshot-v1-32k: $0.24/1M input tokens, $0.24/1M output tokens
   * - moonshot-v1-128k: $1.0/1M input tokens, $1.0/1M output tokens
   * - moonshot-v1-256k: $2.0/1M input tokens, $2.0/1M output tokens
   *
   * Note: Free tier available with limits
   */
  estimateCost(inputTokens: number, outputTokens: number, model?: string): number {
    const selectedModel = model || this.defaultModel;

    // Pricing per 1M tokens
    const pricing: Record<string, { input: number; output: number }> = {
      [KimiProvider.MODELS.K2]: { input: 0.12, output: 0.12 },
      [KimiProvider.MODELS.K2_32K]: { input: 0.24, output: 0.24 },
      [KimiProvider.MODELS.K2_128K]: { input: 1.0, output: 1.0 },
      [KimiProvider.MODELS.K2_256K]: { input: 2.0, output: 2.0 },
    };

    const modelPricing = pricing[selectedModel] || pricing[KimiProvider.MODELS.K2_128K];

    const inputCost = (inputTokens / 1_000_000) * modelPricing.input;
    const outputCost = (outputTokens / 1_000_000) * modelPricing.output;

    return inputCost + outputCost;
  }

  /**
   * Get Kimi-specific features
   */
  getProviderInfo() {
    return {
      name: 'Kimi (Moonshot AI)',
      maxContextWindow: 256_000, // 256K tokens - one of the largest available
      supportsToolCalling: true,
      supportsStreaming: true,
      supportsVision: false,
      specialties: [
        'Long-context reasoning (up to 256K tokens)',
        'Code generation and analysis',
        'Document analysis',
        'Multi-turn conversations with extensive memory',
      ],
      freeTierLimits: {
        requestsPerMinute: 6,
        tokensPerMinute: 64_000,
        tokensPerDay: 3_000_000,
      },
    };
  }
}

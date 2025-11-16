/**
 * Genspark AI Provider
 *
 * Genspark is an all-in-one AI workspace with advanced agent capabilities.
 * - Autonomous thinking, planning, and action
 * - Integration with GPT-4.1 and OpenAI Realtime API
 * - Tool use and task automation
 *
 * Official Website: https://www.genspark.ai/
 * API Endpoint: https://api.genspark.ai
 *
 * NOTE: Genspark's API is currently in development. This provider uses
 * an OpenAI-compatible interface. Update the configuration once official
 * documentation is available.
 *
 * For API access, visit: https://www.genspark.ai/ or contact Genspark support
 */

import { BaseAIProvider, AIResponse, AIMessage, AIProviderConfig } from './BaseProvider';

export interface GensparkProviderConfig extends AIProviderConfig {
  baseUrl?: string;
  apiFormat?: 'openai' | 'native'; // Support multiple formats
}

export class GensparkProvider extends BaseAIProvider {
  private baseUrl: string;
  private apiFormat: 'openai' | 'native';

  // Available Genspark models (based on their GPT-4.1 integration)
  // Note: Update these when official model list is available
  private static readonly MODELS = {
    GPT_4_1: 'gpt-4.1',              // Genspark's primary model
    GPT_4: 'gpt-4',                  // Fallback option
    GENSPARK_AGENT: 'genspark-agent', // Autonomous agent mode
  };

  constructor(config: GensparkProviderConfig) {
    super({
      ...config,
      model: config.model || GensparkProvider.MODELS.GPT_4_1,
    });
    this.baseUrl = config.baseUrl || 'https://api.genspark.ai/v1';
    this.apiFormat = config.apiFormat || 'openai';
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

      // Use OpenAI-compatible format
      if (this.apiFormat === 'openai') {
        return await this.generateOpenAIFormat(messages, model, maxTokens, temperature);
      }

      // Native Genspark format (when available)
      return await this.generateNativeFormat(messages, model, maxTokens, temperature);
    } catch (error: any) {
      throw new Error(`Genspark API error: ${error.message}`);
    }
  }

  /**
   * Generate using OpenAI-compatible API format
   */
  private async generateOpenAIFormat(
    messages: AIMessage[],
    model: string,
    maxTokens: number,
    temperature: number
  ): Promise<AIResponse> {
    const url = `${this.baseUrl}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: maxTokens,
        temperature: temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Genspark API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json() as any;

    const content = data.choices?.[0]?.message?.content || '';
    const totalTokens = data.usage?.total_tokens || 0;

    return {
      content,
      tokensUsed: totalTokens,
      model: data.model || model,
    };
  }

  /**
   * Generate using native Genspark API format
   * This will be updated when official documentation is available
   */
  private async generateNativeFormat(
    messages: AIMessage[],
    model: string,
    maxTokens: number,
    temperature: number
  ): Promise<AIResponse> {
    const url = `${this.baseUrl}/generate`;

    // Convert messages to single prompt for native format
    const prompt = messages.map(m => m.content).join('\n');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        // Add custom headers if required by Genspark
        'X-Genspark-Version': 'v1',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        max_tokens: maxTokens,
        temperature: temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Genspark API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json() as any;

    // Adapt this based on actual Genspark response format
    const content = data.response || data.text || data.content || '';
    const totalTokens = data.usage?.total_tokens || 0;

    return {
      content,
      tokensUsed: totalTokens,
      model: data.model || model,
    };
  }

  getProviderName(): string {
    return 'Genspark AI';
  }

  getDefaultModel(): string {
    return GensparkProvider.MODELS.GPT_4_1;
  }

  getAvailableModels(): string[] {
    return Object.values(GensparkProvider.MODELS);
  }

  /**
   * Estimate cost for Genspark API usage
   *
   * NOTE: Pricing information will be updated when official pricing is available.
   * Currently using estimated costs based on GPT-4.1 integration.
   *
   * Estimated pricing:
   * - gpt-4.1: Similar to GPT-4 Turbo pricing
   * - genspark-agent: May include additional agent capabilities pricing
   */
  estimateCost(inputTokens: number, outputTokens: number, model?: string): number {
    const selectedModel = model || this.defaultModel;

    // Estimated pricing per 1M tokens (update when official pricing available)
    const pricing: Record<string, { input: number; output: number }> = {
      [GensparkProvider.MODELS.GPT_4_1]: { input: 10.0, output: 30.0 },
      [GensparkProvider.MODELS.GPT_4]: { input: 30.0, output: 60.0 },
      [GensparkProvider.MODELS.GENSPARK_AGENT]: { input: 15.0, output: 45.0 },
    };

    const modelPricing = pricing[selectedModel] || pricing[GensparkProvider.MODELS.GPT_4_1];

    const inputCost = (inputTokens / 1_000_000) * modelPricing.input;
    const outputCost = (outputTokens / 1_000_000) * modelPricing.output;

    return inputCost + outputCost;
  }

  /**
   * Get Genspark-specific features
   */
  getProviderInfo() {
    return {
      name: 'Genspark AI',
      maxContextWindow: 128_000, // Estimated (update when confirmed)
      supportsToolCalling: true,
      supportsStreaming: true,
      supportsVision: false,
      specialties: [
        'Autonomous agent capabilities',
        'Multi-step task automation',
        'Integration with productivity tools (Google Workspace, Notion)',
        'Advanced reasoning and planning',
        'Custom workflow automation',
      ],
      apiStatus: 'in-development',
      note: 'API access may require contacting Genspark support. Visit https://www.genspark.ai/ for details.',
    };
  }

  /**
   * Helper method to test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generate('Hello', { maxTokens: 10 });
      return response.content.length > 0;
    } catch (error) {
      console.error('Genspark connection test failed:', error);
      return false;
    }
  }
}

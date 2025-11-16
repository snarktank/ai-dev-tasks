import Anthropic from '@anthropic-ai/sdk';
import { BaseAIProvider, AIMessage, AIResponse, AIProviderConfig } from './BaseProvider';
import logger from '@/utils/logger';

export class AnthropicProvider extends BaseAIProvider {
  private client: Anthropic;

  constructor(config: AIProviderConfig) {
    super(config);
    this.client = new Anthropic({ apiKey: this.apiKey });
  }

  getProviderName(): string {
    return 'Anthropic Claude';
  }

  getDefaultModel(): string {
    return 'claude-sonnet-4-20250514';
  }

  getAvailableModels(): string[] {
    return [
      'claude-opus-4-20250514',
      'claude-sonnet-4-20250514',
      'claude-haiku-4-20250514',
      'claude-3-5-sonnet-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ];
  }

  async generate(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }): Promise<AIResponse> {
    try {
      const response = await this.client.messages.create({
        model: options?.model || this.defaultModel,
        max_tokens: options?.maxTokens || this.maxTokens,
        temperature: options?.temperature || this.temperature,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';

      return {
        content,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        model: response.model,
      };
    } catch (error: any) {
      logger.error('Anthropic API error:', error);
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }

  async generateFromMessages(messages: AIMessage[], options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }): Promise<AIResponse> {
    try {
      const response = await this.client.messages.create({
        model: options?.model || this.defaultModel,
        max_tokens: options?.maxTokens || this.maxTokens,
        temperature: options?.temperature || this.temperature,
        messages: messages as any,
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';

      return {
        content,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        model: response.model,
      };
    } catch (error: any) {
      logger.error('Anthropic API error:', error);
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }

  estimateCost(inputTokens: number, outputTokens: number, model?: string): number {
    const selectedModel = model || this.defaultModel;

    // Pricing per million tokens (as of 2024)
    const pricing: Record<string, { input: number; output: number }> = {
      'claude-opus-4-20250514': { input: 15, output: 75 },
      'claude-sonnet-4-20250514': { input: 3, output: 15 },
      'claude-haiku-4-20250514': { input: 0.25, output: 1.25 },
      'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
      'claude-3-opus-20240229': { input: 15, output: 75 },
      'claude-3-sonnet-20240229': { input: 3, output: 15 },
      'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
    };

    const price = pricing[selectedModel] || pricing['claude-sonnet-4-20250514'];

    return (inputTokens / 1_000_000) * price.input + (outputTokens / 1_000_000) * price.output;
  }
}

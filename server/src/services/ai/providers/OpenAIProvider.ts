import OpenAI from 'openai';
import { BaseAIProvider, AIMessage, AIResponse, AIProviderConfig } from './BaseProvider';
import logger from '@/utils/logger';

export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor(config: AIProviderConfig) {
    super(config);
    this.client = new OpenAI({ apiKey: this.apiKey });
  }

  getProviderName(): string {
    return 'OpenAI';
  }

  getDefaultModel(): string {
    return 'gpt-4-turbo-preview';
  }

  getAvailableModels(): string[] {
    return [
      'gpt-4-turbo-preview',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-4-32k',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
    ];
  }

  async generate(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }): Promise<AIResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || this.defaultModel,
        max_tokens: options?.maxTokens || this.maxTokens,
        temperature: options?.temperature || this.temperature,
        messages: [{ role: 'user', content: prompt }],
      });

      return {
        content: response.choices[0].message.content || '',
        tokensUsed: response.usage?.total_tokens,
        model: response.model,
      };
    } catch (error: any) {
      logger.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  async generateFromMessages(messages: AIMessage[], options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }): Promise<AIResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || this.defaultModel,
        max_tokens: options?.maxTokens || this.maxTokens,
        temperature: options?.temperature || this.temperature,
        messages: messages as any,
      });

      return {
        content: response.choices[0].message.content || '',
        tokensUsed: response.usage?.total_tokens,
        model: response.model,
      };
    } catch (error: any) {
      logger.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  estimateCost(inputTokens: number, outputTokens: number, model?: string): number {
    const selectedModel = model || this.defaultModel;

    // Pricing per million tokens (as of 2024)
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4-turbo-preview': { input: 10, output: 30 },
      'gpt-4-turbo': { input: 10, output: 30 },
      'gpt-4': { input: 30, output: 60 },
      'gpt-4-32k': { input: 60, output: 120 },
      'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
      'gpt-3.5-turbo-16k': { input: 3, output: 4 },
    };

    const price = pricing[selectedModel] || pricing['gpt-4-turbo-preview'];

    return (inputTokens / 1_000_000) * price.input + (outputTokens / 1_000_000) * price.output;
  }
}

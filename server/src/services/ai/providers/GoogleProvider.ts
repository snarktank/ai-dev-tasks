import { BaseAIProvider, AIMessage, AIResponse, AIProviderConfig } from './BaseProvider';
import logger from '@/utils/logger';

/**
 * Google Gemini Provider
 * Uses Google's Generative AI API
 */
export class GoogleProvider extends BaseAIProvider {
  private googleApiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(config: AIProviderConfig) {
    super(config);
    this.googleApiKey = config.apiKey;
  }

  getProviderName(): string {
    return 'Google Gemini';
  }

  getDefaultModel(): string {
    return 'gemini-1.5-pro';
  }

  getAvailableModels(): string[] {
    return [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-pro',
    ];
  }

  async generate(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }): Promise<AIResponse> {
    try {
      const model = options?.model || this.defaultModel;
      const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.googleApiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            maxOutputTokens: options?.maxTokens || this.maxTokens,
            temperature: options?.temperature || this.temperature,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Google API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      const content = data.candidates[0].content.parts[0].text;

      return {
        content,
        tokensUsed: data.usageMetadata?.totalTokenCount,
        model,
      };
    } catch (error: any) {
      logger.error('Google API error:', error);
      throw new Error(`Google API error: ${error.message}`);
    }
  }

  async generateFromMessages(messages: AIMessage[], options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }): Promise<AIResponse> {
    try {
      const model = options?.model || this.defaultModel;
      const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.googleApiKey}`;

      // Convert messages to Gemini format
      const contents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: options?.maxTokens || this.maxTokens,
            temperature: options?.temperature || this.temperature,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Google API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      const content = data.candidates[0].content.parts[0].text;

      return {
        content,
        tokensUsed: data.usageMetadata?.totalTokenCount,
        model,
      };
    } catch (error: any) {
      logger.error('Google API error:', error);
      throw new Error(`Google API error: ${error.message}`);
    }
  }

  estimateCost(inputTokens: number, outputTokens: number, model?: string): number {
    const selectedModel = model || this.defaultModel;

    // Pricing per million tokens (as of 2024)
    const pricing: Record<string, { input: number; output: number }> = {
      'gemini-1.5-pro': { input: 3.5, output: 10.5 },
      'gemini-1.5-flash': { input: 0.35, output: 1.05 },
      'gemini-pro': { input: 0.5, output: 1.5 },
    };

    const price = pricing[selectedModel] || pricing['gemini-1.5-pro'];

    return (inputTokens / 1_000_000) * price.input + (outputTokens / 1_000_000) * price.output;
  }
}

/**
 * Base AI Provider Interface
 * All AI providers must implement this interface
 */

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  tokensUsed?: number;
  model?: string;
}

export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export abstract class BaseAIProvider {
  protected apiKey: string;
  protected defaultModel: string;
  protected maxTokens: number;
  protected temperature: number;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    this.defaultModel = config.model || this.getDefaultModel();
    this.maxTokens = config.maxTokens || 4000;
    this.temperature = config.temperature || 0.7;
  }

  /**
   * Generate text from a prompt
   */
  abstract generate(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }): Promise<AIResponse>;

  /**
   * Generate text from a conversation
   */
  abstract generateFromMessages(messages: AIMessage[], options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }): Promise<AIResponse>;

  /**
   * Get the default model for this provider
   */
  abstract getDefaultModel(): string;

  /**
   * Get available models for this provider
   */
  abstract getAvailableModels(): string[];

  /**
   * Get provider name
   */
  abstract getProviderName(): string;

  /**
   * Estimate cost for tokens
   */
  abstract estimateCost(inputTokens: number, outputTokens: number, model?: string): number;
}

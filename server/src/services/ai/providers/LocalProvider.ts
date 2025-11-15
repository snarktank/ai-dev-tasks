import { BaseAIProvider, AIMessage, AIResponse, AIProviderConfig } from './BaseProvider';
import logger from '@/utils/logger';

export interface LocalProviderConfig extends AIProviderConfig {
  baseUrl: string; // e.g., http://localhost:11434 for Ollama
  provider?: 'ollama' | 'lmstudio' | 'localai' | 'textgen' | 'openai-compatible';
}

/**
 * Local LLM Provider
 * Supports: Ollama, LM Studio, LocalAI, Text Generation WebUI, any OpenAI-compatible API
 */
export class LocalProvider extends BaseAIProvider {
  private baseUrl: string;
  private localProvider: string;

  constructor(config: LocalProviderConfig) {
    super(config);
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
    this.localProvider = config.provider || 'ollama';
  }

  getProviderName(): string {
    return `Local LLM (${this.localProvider})`;
  }

  getDefaultModel(): string {
    // Different defaults based on provider
    switch (this.localProvider) {
      case 'ollama':
        return 'llama3.1:70b'; // or mistral, codellama, etc.
      case 'lmstudio':
        return 'local-model';
      case 'localai':
        return 'llama3';
      case 'textgen':
        return 'model';
      default:
        return 'llama3.1:70b';
    }
  }

  getAvailableModels(): string[] {
    // Common open-source models for local use
    return [
      // Llama family
      'llama3.1:70b',
      'llama3.1:8b',
      'llama3:70b',
      'llama3:8b',
      'llama2:70b',
      'llama2:13b',
      'llama2:7b',

      // Mistral family
      'mistral:latest',
      'mistral-large',
      'mixtral:8x7b',
      'mixtral:8x22b',

      // Other popular models
      'gemma2:27b',
      'gemma2:9b',
      'qwen2.5:72b',
      'qwen2.5:32b',
      'deepseek-coder:33b',
      'codellama:70b',

      // Generic
      'local-model',
    ];
  }

  async generate(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }): Promise<AIResponse> {
    const model = options?.model || this.defaultModel;

    try {
      logger.info(`Generating with local ${this.localProvider} model: ${model}`);

      // Different API formats for different local providers
      if (this.localProvider === 'ollama') {
        return await this.generateOllama(prompt, model, options);
      } else {
        // LM Studio, LocalAI, TextGen use OpenAI-compatible API
        return await this.generateOpenAICompatible(prompt, model, options);
      }
    } catch (error: any) {
      logger.error(`Local ${this.localProvider} API error:`, error);
      throw new Error(`Local LLM error: ${error.message}`);
    }
  }

  async generateFromMessages(messages: AIMessage[], options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }): Promise<AIResponse> {
    const model = options?.model || this.defaultModel;

    try {
      if (this.localProvider === 'ollama') {
        return await this.generateFromMessagesOllama(messages, model, options);
      } else {
        return await this.generateFromMessagesOpenAICompatible(messages, model, options);
      }
    } catch (error: any) {
      logger.error(`Local ${this.localProvider} API error:`, error);
      throw new Error(`Local LLM error: ${error.message}`);
    }
  }

  /**
   * Ollama-specific generation
   */
  private async generateOllama(prompt: string, model: string, options?: any): Promise<AIResponse> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: options?.temperature || this.temperature,
          num_predict: options?.maxTokens || this.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${error}`);
    }

    const data = await response.json();

    return {
      content: data.response,
      tokensUsed: data.eval_count + data.prompt_eval_count,
      model,
    };
  }

  private async generateFromMessagesOllama(messages: AIMessage[], model: string, options?: any): Promise<AIResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: options?.temperature || this.temperature,
          num_predict: options?.maxTokens || this.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${error}`);
    }

    const data = await response.json();

    return {
      content: data.message.content,
      tokensUsed: data.eval_count + data.prompt_eval_count,
      model,
    };
  }

  /**
   * OpenAI-compatible generation (for LM Studio, LocalAI, TextGen)
   */
  private async generateOpenAICompatible(prompt: string, model: string, options?: any): Promise<AIResponse> {
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens || this.maxTokens,
        temperature: options?.temperature || this.temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Local API error: ${error}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      tokensUsed: data.usage?.total_tokens,
      model,
    };
  }

  private async generateFromMessagesOpenAICompatible(messages: AIMessage[], model: string, options?: any): Promise<AIResponse> {
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options?.maxTokens || this.maxTokens,
        temperature: options?.temperature || this.temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Local API error: ${error}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      tokensUsed: data.usage?.total_tokens,
      model,
    };
  }

  estimateCost(inputTokens: number, outputTokens: number, model?: string): number {
    // Local models are FREE! 🎉
    return 0;
  }

  /**
   * Helper: Check if local server is running
   */
  async testConnection(): Promise<boolean> {
    try {
      if (this.localProvider === 'ollama') {
        const response = await fetch(`${this.baseUrl}/api/tags`);
        return response.ok;
      } else {
        const response = await fetch(`${this.baseUrl}/v1/models`);
        return response.ok;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Helper: List available models on local server
   */
  async listLocalModels(): Promise<string[]> {
    try {
      if (this.localProvider === 'ollama') {
        const response = await fetch(`${this.baseUrl}/api/tags`);
        const data = await response.json();
        return data.models.map((m: any) => m.name);
      } else {
        const response = await fetch(`${this.baseUrl}/v1/models`);
        const data = await response.json();
        return data.data.map((m: any) => m.id);
      }
    } catch (error) {
      logger.error('Failed to list local models:', error);
      return [];
    }
  }
}

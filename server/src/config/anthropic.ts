import Anthropic from '@anthropic-ai/sdk';

export const getAnthropicClient = (apiKey?: string): Anthropic => {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;

  if (!key) {
    throw new Error('Anthropic API key is required');
  }

  return new Anthropic({ apiKey: key });
};

export const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'claude-sonnet-4-20250514';

export const MAX_TOKENS = {
  BRIEF: parseInt(process.env.MAX_TOKENS_BRIEF || '4000'),
  CHAPTER: parseInt(process.env.MAX_TOKENS_CHAPTER || '16000'),
  CONTINUITY: parseInt(process.env.MAX_TOKENS_CONTINUITY || '8000'),
  TIMELINE: 6000,
  CHARACTER: 4000,
  STORY_BIBLE: 8000,
};

export default getAnthropicClient;

import { BaseAIProvider } from './providers/BaseProvider';
import { AIProviderFactory, AIProviderType } from './providers/ProviderFactory';
import logger from '@/utils/logger';
import {
  ArchitectParams,
  WriterParams,
  ContinuityParams,
  ContinuityResult,
  TimelineParams,
  CharacterParams,
  StoryBibleCheckParams,
  StoryBibleCheckResult,
} from '@/types';

const MAX_TOKENS = {
  BRIEF: parseInt(process.env.MAX_TOKENS_BRIEF || '4000'),
  CHAPTER: parseInt(process.env.MAX_TOKENS_CHAPTER || '16000'),
  CONTINUITY: parseInt(process.env.MAX_TOKENS_CONTINUITY || '8000'),
  TIMELINE: 6000,
  CHARACTER: 4000,
  STORY_BIBLE: 8000,
};

export class AgentService {
  private provider: BaseAIProvider;

  constructor(apiKey?: string, providerType?: AIProviderType) {
    // If specific provider and key provided, use that
    if (apiKey && providerType) {
      this.provider = AIProviderFactory.createProvider({
        provider: providerType,
        apiKey,
      });
    }
    // If only API key provided, use default provider from env
    else if (apiKey) {
      const defaultProvider = (process.env.AI_PROVIDER || 'anthropic') as AIProviderType;
      this.provider = AIProviderFactory.createProvider({
        provider: defaultProvider,
        apiKey,
      });
    }
    // Otherwise use environment configuration
    else {
      this.provider = AIProviderFactory.createFromEnv();
    }

    logger.info(`AgentService initialized with provider: ${this.provider.getProviderName()}`);
  }

  /**
   * ARCHITECT AGENT
   * Creates detailed chapter briefs that maintain plot continuity
   */
  async runArchitect(params: ArchitectParams): Promise<string> {
    const { chapterNumber } = params;
    const prompt = this.buildArchitectPrompt(params);

    try {
      logger.info(`Running Architect Agent for Chapter ${chapterNumber} using ${this.provider.getProviderName()}`);

      const response = await this.provider.generate(prompt, {
        maxTokens: MAX_TOKENS.BRIEF,
      });

      logger.info(`Architect Agent completed for Chapter ${chapterNumber}`);
      return response.content;
    } catch (error) {
      logger.error('Architect Agent error:', error);
      throw error;
    }
  }

  /**
   * WRITER AGENT
   * Writes chapter content following the brief and maintaining continuity
   */
  async runWriter(params: WriterParams): Promise<string> {
    const { chapterNumber } = params;
    const prompt = this.buildWriterPrompt(params);

    try {
      logger.info(`Running Writer Agent for Chapter ${chapterNumber} using ${this.provider.getProviderName()}`);

      const response = await this.provider.generate(prompt, {
        maxTokens: MAX_TOKENS.CHAPTER,
      });

      logger.info(`Writer Agent completed for Chapter ${chapterNumber}`);
      return response.content;
    } catch (error) {
      logger.error('Writer Agent error:', error);
      throw error;
    }
  }

  /**
   * CONTINUITY AGENT (ENHANCED)
   * Performs deep continuity checking across all aspects
   */
  async runContinuityCheck(params: ContinuityParams): Promise<ContinuityResult> {
    const prompt = this.buildContinuityPrompt(params);

    try {
      logger.info(`Running Continuity Agent for Chapter ${params.chapterNumber} using ${this.provider.getProviderName()}`);

      const response = await this.provider.generate(prompt, {
        maxTokens: MAX_TOKENS.CONTINUITY,
      });

      const result = this.parseContinuityResult(response.content);
      logger.info(`Continuity Agent completed for Chapter ${params.chapterNumber} - Score: ${result.score}`);

      return result;
    } catch (error) {
      logger.error('Continuity Agent error:', error);
      throw error;
    }
  }

  /**
   * STORY BIBLE ENFORCER AGENT (NEW)
   * Validates chapter against story bible rules
   */
  async runStoryBibleCheck(params: StoryBibleCheckParams): Promise<StoryBibleCheckResult> {
    const prompt = this.buildStoryBibleCheckPrompt(params);

    try {
      logger.info(`Running Story Bible Enforcer for Chapter ${params.chapterNumber} using ${this.provider.getProviderName()}`);

      const response = await this.provider.generate(prompt, {
        maxTokens: MAX_TOKENS.STORY_BIBLE,
      });

      const result = this.parseStoryBibleResult(response.content);
      logger.info(`Story Bible Check completed - Compliant: ${result.compliant}`);

      return result;
    } catch (error) {
      logger.error('Story Bible Check error:', error);
      throw error;
    }
  }

  /**
   * TIMELINE AGENT
   * Generates and validates story timeline
   */
  async runTimelineExtraction(params: TimelineParams): Promise<any[]> {
    const prompt = this.buildTimelinePrompt(params);

    try {
      logger.info(`Running Timeline Agent using ${this.provider.getProviderName()}`);

      const response = await this.provider.generate(prompt, {
        maxTokens: MAX_TOKENS.TIMELINE,
      });

      const timeline = this.parseTimelineResult(response.content);
      logger.info(`Timeline Agent completed - ${timeline.length} events extracted`);

      return timeline;
    } catch (error) {
      logger.error('Timeline Agent error:', error);
      throw error;
    }
  }

  /**
   * CHARACTER AGENT
   * Extracts and tracks character information
   */
  async runCharacterExtraction(params: CharacterParams): Promise<any> {
    const prompt = this.buildCharacterPrompt(params);

    try {
      logger.info(`Running Character Agent using ${this.provider.getProviderName()}`);

      const response = await this.provider.generate(prompt, {
        maxTokens: MAX_TOKENS.CHARACTER,
      });

      const characters = this.parseCharacterResult(response.content);
      logger.info('Character Agent completed');

      return characters;
    } catch (error) {
      logger.error('Character Agent error:', error);
      throw error;
    }
  }

  // All the prompt builders remain the same...
  // (Including them for completeness)

  private buildArchitectPrompt(params: ArchitectParams): string {
    const { storyBible, previousChapters, chapterNumber, plotPoints, characters, locations } = params;

    let prompt = `You are the Architect Agent, responsible for creating detailed chapter briefs that maintain perfect story continuity.

STORY BIBLE:
${storyBible}

CHAPTER TO PLAN: Chapter ${chapterNumber}

`;

    if (previousChapters && previousChapters.length > 0) {
      prompt += `PREVIOUS CHAPTERS SUMMARY:\n`;
      previousChapters.forEach((ch) => {
        prompt += `\nChapter ${ch.number}:\nBrief: ${ch.brief}\n`;
      });
    }

    if (plotPoints && plotPoints.length > 0) {
      prompt += `\nACTIVE PLOT POINTS:\n`;
      plotPoints.forEach((pp: any) => {
        prompt += `- ${pp.title}: ${pp.description} (Status: ${pp.status})\n`;
      });
    }

    if (characters && characters.length > 0) {
      prompt += `\nMAIN CHARACTERS:\n`;
      characters.forEach((char: any) => {
        prompt += `- ${char.name}: ${char.description}\n`;
      });
    }

    if (locations && locations.length > 0) {
      prompt += `\nESTABLISHED LOCATIONS:\n`;
      locations.forEach((loc: any) => {
        prompt += `- ${loc.name}: ${loc.description}\n`;
      });
    }

    prompt += `

TASK:
Create a detailed brief for Chapter ${chapterNumber} that:
1. Advances the plot according to the story bible
2. Maintains character consistency with previous chapters
3. Respects established locations and settings
4. Follows logical timeline progression
5. Sets up future plot points appropriately

The brief should include:
- Main events that will occur
- Characters involved and their roles
- Location(s) where the chapter takes place
- Plot points introduced, developed, or resolved
- Character development moments
- Timeline position (when this occurs in story time)
- Target mood/tone

Provide a detailed, structured brief (500-800 words).`;

    return prompt;
  }

  private buildWriterPrompt(params: WriterParams): string {
    const { storyBible, brief, previousChapters, chapterNumber, targetWordCount, writingStyle, characters, locations, plotPoints } = params;

    let prompt = `You are the Writer Agent, an expert novelist tasked with writing Chapter ${chapterNumber} with perfect continuity.

STORY BIBLE:
${storyBible}

CHAPTER BRIEF:
${brief}

`;

    if (previousChapters && previousChapters.length > 0) {
      prompt += `PREVIOUS CHAPTERS (for continuity reference):\n`;
      const recentChapters = previousChapters.slice(-3);
      recentChapters.forEach((ch) => {
        prompt += `\n--- Chapter ${ch.number} ---\n${ch.content.substring(0, 2000)}${ch.content.length > 2000 ? '...' : ''}\n`;
      });
    }

    if (characters && characters.length > 0) {
      prompt += `\nCHARACTERS IN THIS CHAPTER:\n`;
      characters.forEach((char: any) => {
        prompt += `- ${char.name}: ${char.description}\n`;
        if (char.physicalDescription) {
          prompt += `  Physical: ${JSON.stringify(char.physicalDescription)}\n`;
        }
        if (char.traits) {
          prompt += `  Traits: ${char.traits}\n`;
        }
      });
    }

    if (plotPoints && plotPoints.length > 0) {
      prompt += `\nPLOT POINTS TO ADDRESS:\n`;
      plotPoints.forEach((pp: any) => {
        prompt += `- ${pp.title}: ${pp.description}\n`;
      });
    }

    prompt += `

WRITING REQUIREMENTS:
1. Target word count: ${targetWordCount || 5000} words
2. Writing style: ${writingStyle || 'literary fiction with vivid descriptions'}
3. Maintain PERFECT continuity with previous chapters
4. Follow the brief exactly
5. Use consistent character voices and descriptions
6. Respect established world-building and locations
7. Ensure timeline consistency

CRITICAL CONTINUITY RULES:
- Characters must remember what happened in previous chapters
- Physical descriptions must match previous mentions
- Locations must be described consistently
- Character relationships must progress naturally
- Technology/magic systems must follow established rules
- Timeline must be logical (don't skip or repeat time)

Write Chapter ${chapterNumber} now. Output ONLY the chapter content, no commentary.`;

    return prompt;
  }

  private buildContinuityPrompt(params: ContinuityParams): string {
    const { storyBible, chapterContent, chapterNumber, previousChapters, characters, locations, plotPoints, characterStates } = params;

    let prompt = `You are the Continuity Agent, a meticulous editor checking for ANY continuity errors.

STORY BIBLE:
${storyBible}

CHAPTER TO CHECK: Chapter ${chapterNumber}
${chapterContent}

`;

    if (previousChapters && previousChapters.length > 0) {
      prompt += `\nPREVIOUS CHAPTERS (for reference):\n`;
      previousChapters.forEach((ch) => {
        prompt += `\n--- Chapter ${ch.number} ---\n${ch.content.substring(0, 1500)}${ch.content.length > 1500 ? '...' : ''}\n`;
      });
    }

    if (characters && characters.length > 0) {
      prompt += `\nESTABLISHED CHARACTERS:\n`;
      characters.forEach((char: any) => {
        prompt += `- ${char.name}: ${char.description}\n`;
        if (char.physicalDescription) {
          prompt += `  Physical: ${JSON.stringify(char.physicalDescription)}\n`;
        }
      });
    }

    if (characterStates && characterStates.length > 0) {
      prompt += `\nCHARACTER STATES FROM PREVIOUS CHAPTERS:\n`;
      characterStates.forEach((state: any) => {
        prompt += `- ${state.character?.name || 'Unknown'} (Chapter ${state.chapter?.chapterNumber}):\n`;
        if (state.injuries) prompt += `  Injuries: ${JSON.stringify(state.injuries)}\n`;
        if (state.possessions) prompt += `  Possessions: ${JSON.stringify(state.possessions)}\n`;
        if (state.currentLocation) prompt += `  Location: ${state.currentLocation}\n`;
        if (state.knowledge) prompt += `  Knows: ${JSON.stringify(state.knowledge)}\n`;
      });
    }

    if (locations && locations.length > 0) {
      prompt += `\nESTABLISHED LOCATIONS:\n`;
      locations.forEach((loc: any) => {
        prompt += `- ${loc.name}: ${loc.description}\n`;
      });
    }

    if (plotPoints && plotPoints.length > 0) {
      prompt += `\nPLOT POINTS:\n`;
      plotPoints.forEach((pp: any) => {
        prompt += `- ${pp.title} (${pp.status}): ${pp.description}\n`;
      });
    }

    prompt += `

TASK: Perform a THOROUGH continuity check on Chapter ${chapterNumber}. Check for:

1. CHARACTER CONTINUITY:
   - Physical description consistency
   - Character knowledge
   - Character abilities/skills consistency
   - Character relationships and interactions
   - Personality and voice consistency

2. PLOT CONTINUITY:
   - Are plot points addressed in the right order?
   - Do events follow logically?
   - Are there plot holes?
   - Are consequences acknowledged?

3. LOCATION CONTINUITY:
   - Are locations described consistently?
   - Can characters realistically travel?
   - Do locations match descriptions?

4. TIMELINE CONTINUITY:
   - Is time passage logical?
   - Do references make sense?
   - Any temporal impossibilities?

5. STORY BIBLE COMPLIANCE:
   - Does it follow world-building rules?
   - Are systems used consistently?
   - Does it match tone/style?

Respond in this EXACT JSON format:
{
  "overallStatus": "pass|warning|fail",
  "summary": "Brief summary",
  "characterIssues": [{"character": "name", "issue": "desc", "severity": "low|medium|high"}],
  "plotIssues": [{"plotPoint": "name", "issue": "desc", "severity": "low|medium|high"}],
  "locationIssues": [{"location": "name", "issue": "desc", "severity": "low|medium|high"}],
  "timelineIssues": [{"event": "desc", "issue": "desc", "severity": "low|medium|high"}],
  "storyBibleViolations": [{"violation": "desc", "severity": "low|medium|high"}],
  "score": 85
}

Be thorough and strict.`;

    return prompt;
  }

  private buildStoryBibleCheckPrompt(params: StoryBibleCheckParams): string {
    const { storyBible, chapterContent, chapterNumber } = params;

    return `You are the Story Bible Enforcer, ensuring strict adherence to the story's core rules.

STORY BIBLE (SACRED RULES):
${storyBible}

CHAPTER TO VALIDATE: Chapter ${chapterNumber}
${chapterContent}

TASK: Check if this chapter STRICTLY follows ALL rules.

Respond in this EXACT JSON format:
{
  "compliant": true|false,
  "violations": [
    {"rule": "rule", "violation": "how", "severity": "low|medium|high", "suggestion": "fix"}
  ],
  "score": 95
}

Be STRICT.`;
  }

  private buildTimelinePrompt(params: TimelineParams): string {
    const { chapters } = params;

    let prompt = `You are the Timeline Agent. Extract all events in chronological order.

CHAPTERS:
`;

    chapters.forEach((ch) => {
      prompt += `\n--- Chapter ${ch.number} ---\n${ch.content}\n`;
    });

    prompt += `

TASK: Extract all significant events.

Respond in JSON format:
[
  {
    "eventDescription": "desc",
    "chapterNumber": 1,
    "involvedCharacters": ["name1"],
    "location": "location",
    "timeframe": "Day 1",
    "sequenceOrder": 1
  }
]`;

    return prompt;
  }

  private buildCharacterPrompt(params: CharacterParams): string {
    const { chapterContent, existingCharacters } = params;

    let prompt = `You are the Character Agent. Extract all character information.

CHAPTER CONTENT:
${chapterContent}

`;

    if (existingCharacters && existingCharacters.length > 0) {
      prompt += `EXISTING CHARACTERS:\n`;
      existingCharacters.forEach((char: any) => {
        prompt += `- ${char.name}: ${char.description}\n`;
      });
    }

    prompt += `

TASK: Extract character information.

Respond in JSON format with appearances, newCharacters, characterStates, relationships.`;

    return prompt;
  }

  // Parse methods remain the same
  private parseContinuityResult(text: string): ContinuityResult {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      logger.error('Failed to parse continuity result:', error);
    }

    return {
      overallStatus: 'warning',
      summary: 'Could not parse result',
      characterIssues: [],
      plotIssues: [],
      locationIssues: [],
      timelineIssues: [],
      storyBibleViolations: [],
      score: 50,
    };
  }

  private parseStoryBibleResult(text: string): StoryBibleCheckResult {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      logger.error('Failed to parse story bible result:', error);
    }

    return {
      compliant: false,
      violations: [],
      score: 50,
    };
  }

  private parseTimelineResult(text: string): any[] {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      logger.error('Failed to parse timeline result:', error);
    }

    return [];
  }

  private parseCharacterResult(text: string): any {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      logger.error('Failed to parse character result:', error);
    }

    return {
      appearances: [],
      newCharacters: [],
      characterStates: [],
      relationships: [],
    };
  }
}

export default AgentService;

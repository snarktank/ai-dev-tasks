import Anthropic from '@anthropic-ai/sdk';
import { getAnthropicClient, DEFAULT_MODEL, MAX_TOKENS } from '@/config/anthropic';
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

export class AgentService {
  private anthropic: Anthropic;

  constructor(apiKey?: string) {
    this.anthropic = getAnthropicClient(apiKey);
  }

  /**
   * ARCHITECT AGENT
   * Creates detailed chapter briefs that maintain plot continuity
   */
  async runArchitect(params: ArchitectParams): Promise<string> {
    const { storyBible, previousChapters, chapterNumber, plotPoints, characters, locations } = params;

    const prompt = this.buildArchitectPrompt(params);

    try {
      logger.info(`Running Architect Agent for Chapter ${chapterNumber}`);

      const response = await this.anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: MAX_TOKENS.BRIEF,
        messages: [{ role: 'user', content: prompt }],
      });

      const brief = response.content[0].type === 'text' ? response.content[0].text : '';
      logger.info(`Architect Agent completed for Chapter ${chapterNumber}`);

      return brief;
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
    const { storyBible, brief, previousChapters, chapterNumber, targetWordCount = 5000 } = params;

    const prompt = this.buildWriterPrompt(params);

    try {
      logger.info(`Running Writer Agent for Chapter ${chapterNumber}`);

      const response = await this.anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: MAX_TOKENS.CHAPTER,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      logger.info(`Writer Agent completed for Chapter ${chapterNumber}`);

      return content;
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
      logger.info(`Running Continuity Agent for Chapter ${params.chapterNumber}`);

      const response = await this.anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: MAX_TOKENS.CONTINUITY,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const resultText = response.content[0].type === 'text' ? response.content[0].text : '';

      // Parse the structured response
      const result = this.parseContinuityResult(resultText);
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
      logger.info(`Running Story Bible Enforcer for Chapter ${params.chapterNumber}`);

      const response = await this.anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: MAX_TOKENS.STORY_BIBLE,
        messages: [{ role: 'user', content: prompt }],
      });

      const resultText = response.content[0].type === 'text' ? response.content[0].text : '';
      const result = this.parseStoryBibleResult(resultText);

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
      logger.info('Running Timeline Agent');

      const response = await this.anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: MAX_TOKENS.TIMELINE,
        messages: [{ role: 'user', content: prompt }],
      });

      const resultText = response.content[0].type === 'text' ? response.content[0].text : '';
      const timeline = this.parseTimelineResult(resultText);

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
      logger.info('Running Character Agent');

      const response = await this.anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: MAX_TOKENS.CHARACTER,
        messages: [{ role: 'user', content: prompt }],
      });

      const resultText = response.content[0].type === 'text' ? response.content[0].text : '';
      const characters = this.parseCharacterResult(resultText);

      logger.info('Character Agent completed');
      return characters;
    } catch (error) {
      logger.error('Character Agent error:', error);
      throw error;
    }
  }

  // ============================================================================
  // PROMPT BUILDERS (Enhanced for bulletproof continuity)
  // ============================================================================

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
      const recentChapters = previousChapters.slice(-3); // Last 3 chapters for context
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
   - Physical description consistency (hair color, height, age, etc)
   - Character knowledge (do they know things they shouldn't?)
   - Character abilities/skills consistency
   - Character relationships and interactions
   - Personality and voice consistency

2. PLOT CONTINUITY:
   - Are plot points addressed in the right order?
   - Do events follow logically from previous chapters?
   - Are there any plot holes?
   - Are consequences of previous events acknowledged?

3. LOCATION CONTINUITY:
   - Are locations described consistently?
   - Can characters realistically travel between locations?
   - Do locations match their established descriptions?

4. TIMELINE CONTINUITY:
   - Is the passage of time logical?
   - Do references to previous events make sense?
   - Are there any temporal impossibilities?

5. STORY BIBLE COMPLIANCE:
   - Does the chapter follow world-building rules?
   - Are magic/tech systems used consistently?
   - Does it match the tone and style guidelines?

Respond in this EXACT JSON format:
{
  "overallStatus": "pass|warning|fail",
  "summary": "Brief summary of continuity check",
  "characterIssues": [
    {"character": "name", "issue": "description", "severity": "low|medium|high"}
  ],
  "plotIssues": [
    {"plotPoint": "name", "issue": "description", "severity": "low|medium|high"}
  ],
  "locationIssues": [
    {"location": "name", "issue": "description", "severity": "low|medium|high"}
  ],
  "timelineIssues": [
    {"event": "description", "issue": "description", "severity": "low|medium|high"}
  ],
  "storyBibleViolations": [
    {"violation": "description", "severity": "low|medium|high"}
  ],
  "score": 85
}

The score should be 0-100, where:
- 90-100: Perfect continuity
- 75-89: Minor issues only
- 60-74: Some noticeable problems
- Below 60: Significant continuity errors

Be thorough and strict. Even small inconsistencies should be noted.`;

    return prompt;
  }

  private buildStoryBibleCheckPrompt(params: StoryBibleCheckParams): string {
    const { storyBible, chapterContent, chapterNumber } = params;

    return `You are the Story Bible Enforcer, ensuring strict adherence to the story's core rules and vision.

STORY BIBLE (SACRED RULES):
${storyBible}

CHAPTER TO VALIDATE: Chapter ${chapterNumber}
${chapterContent}

TASK: Check if this chapter STRICTLY follows ALL rules, guidelines, and vision from the story bible.

Look for violations in:
1. Genre and tone requirements
2. Character rules and constraints
3. World-building rules (magic systems, technology, society, etc)
4. Plot structure requirements
5. Themes and messages
6. Writing style guidelines
7. Content restrictions (violence, language, etc)

Respond in this EXACT JSON format:
{
  "compliant": true|false,
  "violations": [
    {
      "rule": "The specific rule from story bible",
      "violation": "How the chapter violates it",
      "severity": "low|medium|high",
      "suggestion": "How to fix it"
    }
  ],
  "score": 95
}

Be STRICT. The story bible is law.`;
  }

  private buildTimelinePrompt(params: TimelineParams): string {
    const { chapters } = params;

    let prompt = `You are the Timeline Agent. Extract all events from these chapters in chronological order.

CHAPTERS:
`;

    chapters.forEach((ch) => {
      prompt += `\n--- Chapter ${ch.number} ---\n${ch.content}\n`;
    });

    prompt += `

TASK: Extract all significant events and create a chronological timeline.

For each event, identify:
1. Event description (what happened)
2. Chapter it occurred in
3. Characters involved
4. Location
5. Relative timeframe (e.g., "Day 1", "Three weeks later", "Morning")
6. Sequence order

Respond in this JSON format:
[
  {
    "eventDescription": "description",
    "chapterNumber": 1,
    "involvedCharacters": ["name1", "name2"],
    "location": "location name",
    "timeframe": "Day 1, Morning",
    "sequenceOrder": 1
  }
]

Be comprehensive and precise.`;

    return prompt;
  }

  private buildCharacterPrompt(params: CharacterParams): string {
    const { chapterContent, existingCharacters } = params;

    let prompt = `You are the Character Agent. Extract all character information from this chapter.

CHAPTER CONTENT:
${chapterContent}

`;

    if (existingCharacters && existingCharacters.length > 0) {
      prompt += `EXISTING CHARACTERS (update if they appear):\n`;
      existingCharacters.forEach((char: any) => {
        prompt += `- ${char.name}: ${char.description}\n`;
      });
    }

    prompt += `

TASK: Extract character information including:
1. Character appearances (who appears in this chapter)
2. New character introductions
3. Physical descriptions
4. Character states (emotional, injuries, possessions, knowledge gained)
5. Relationships with other characters

Respond in this JSON format:
{
  "appearances": [
    {
      "name": "character name",
      "role": "what they do in this chapter",
      "emotionalState": "happy|sad|angry|etc",
      "significance": "major|minor|mentioned"
    }
  ],
  "newCharacters": [
    {
      "name": "name",
      "description": "description",
      "physicalDescription": {
        "age": "approximate age",
        "height": "height",
        "hairColor": "color",
        "eyeColor": "color",
        "distinctiveFeatures": "any notable features"
      },
      "role": "protagonist|antagonist|supporting|minor"
    }
  ],
  "characterStates": [
    {
      "name": "character name",
      "knowledge": ["new fact they learned"],
      "injuries": ["any injuries"],
      "possessions": ["items they acquired/lost"],
      "currentLocation": "where they are",
      "emotionalState": "state"
    }
  ],
  "relationships": [
    {
      "from": "character 1",
      "to": "character 2",
      "type": "friend|enemy|family|etc",
      "description": "nature of relationship",
      "strength": 50
    }
  ]
}

Be thorough.`;

    return prompt;
  }

  // ============================================================================
  // RESULT PARSERS
  // ============================================================================

  private parseContinuityResult(text: string): ContinuityResult {
    try {
      // Extract JSON from response (Claude might add commentary)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      logger.error('Failed to parse continuity result:', error);
    }

    // Fallback if parsing fails
    return {
      overallStatus: 'warning',
      summary: 'Could not parse continuity check result',
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

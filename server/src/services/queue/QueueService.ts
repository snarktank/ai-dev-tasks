import Bull, { Job, Queue } from 'bull';
import { redisConfig } from '@/config/redis';
import { prisma } from '@/config/database';
import AgentService from '@/services/ai/AgentService';
import logger from '@/utils/logger';
import { GenerateChapterParams } from '@/types';

export class QueueService {
  private queues: {
    brief: Queue;
    chapter: Queue;
    continuity: Queue;
    timeline: Queue;
    character: Queue;
    storyBible: Queue;
  };

  constructor() {
    this.queues = {
      brief: new Bull('brief-generation', redisConfig),
      chapter: new Bull('chapter-generation', redisConfig),
      continuity: new Bull('continuity-check', redisConfig),
      timeline: new Bull('timeline-extraction', redisConfig),
      character: new Bull('character-extraction', redisConfig),
      storyBible: new Bull('story-bible-check', redisConfig),
    };

    this.setupWorkers();
    this.setupEventHandlers();
  }

  /**
   * Generate a single chapter (brief → write → continuity check)
   */
  async generateChapter(params: GenerateChapterParams & { userId: string }) {
    const { projectId, chapterId, chapterNumber, userId, apiKey } = params;

    // Get user's API key if not provided
    let userApiKey = apiKey;
    if (!userApiKey) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      userApiKey = user?.apiKeyEncrypted || process.env.ANTHROPIC_API_KEY;
    }

    // Step 1: Generate brief
    const briefJob = await this.queues.brief.add({
      projectId,
      chapterId,
      chapterNumber,
      apiKey: userApiKey,
      userId,
    });

    logger.info(`Queued brief generation for Chapter ${chapterNumber}`);
    return briefJob.id;
  }

  /**
   * Batch generate multiple chapters
   */
  async batchGenerate(params: {
    projectId: string;
    startChapter: number;
    endChapter: number;
    userId: string;
    apiKey?: string;
  }) {
    const jobIds: string[] = [];

    for (let i = params.startChapter; i <= params.endChapter; i++) {
      // Find or create chapter
      let chapter = await prisma.chapter.findUnique({
        where: {
          projectId_chapterNumber: {
            projectId: params.projectId,
            chapterNumber: i,
          },
        },
      });

      if (!chapter) {
        chapter = await prisma.chapter.create({
          data: {
            projectId: params.projectId,
            chapterNumber: i,
            status: 'not_started',
          },
        });
      }

      const jobId = await this.generateChapter({
        projectId: params.projectId,
        chapterId: chapter.id,
        chapterNumber: i,
        userId: params.userId,
        apiKey: params.apiKey,
      });

      jobIds.push(jobId!);
    }

    logger.info(`Batch generation started: Chapters ${params.startChapter}-${params.endChapter}`);
    return jobIds;
  }

  /**
   * Setup queue workers
   */
  private setupWorkers() {
    // Brief Generation Worker
    this.queues.brief.process(5, async (job: Job) => {
      return this.processBriefGeneration(job);
    });

    // Chapter Writing Worker (limited concurrency to avoid rate limits)
    this.queues.chapter.process(2, async (job: Job) => {
      return this.processChapterWriting(job);
    });

    // Continuity Check Worker
    this.queues.continuity.process(3, async (job: Job) => {
      return this.processContinuityCheck(job);
    });

    // Story Bible Check Worker
    this.queues.storyBible.process(3, async (job: Job) => {
      return this.processStoryBibleCheck(job);
    });

    // Timeline Extraction Worker
    this.queues.timeline.process(2, async (job: Job) => {
      return this.processTimelineExtraction(job);
    });

    // Character Extraction Worker
    this.queues.character.process(3, async (job: Job) => {
      return this.processCharacterExtraction(job);
    });

    logger.info('✓ Queue workers initialized');
  }

  /**
   * Process brief generation
   */
  private async processBriefGeneration(job: Job): Promise<any> {
    const { projectId, chapterId, chapterNumber, apiKey } = job.data;

    try {
      await job.progress(10);

      // Get project and previous chapters
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          chapters: {
            where: { chapterNumber: { lt: chapterNumber } },
            orderBy: { chapterNumber: 'asc' },
          },
          plotPoints: true,
          characters: true,
          locations: true,
        },
      });

      if (!project) throw new Error('Project not found');

      await job.progress(30);

      // Run Architect Agent
      const agentService = new AgentService(apiKey);
      const brief = await agentService.runArchitect({
        storyBible: project.storyBible || '',
        previousChapters: project.chapters.map((ch) => ({
          number: ch.chapterNumber,
          brief: ch.brief || '',
          content: ch.content || '',
        })),
        chapterNumber,
        plotPoints: project.plotPoints,
        characters: project.characters,
        locations: project.locations,
      });

      await job.progress(80);

      // Save brief
      await prisma.chapter.update({
        where: { id: chapterId },
        data: {
          brief,
          status: 'brief_complete',
        },
      });

      await job.progress(100);

      // Automatically queue chapter writing
      await this.queues.chapter.add({
        projectId,
        chapterId,
        chapterNumber,
        apiKey,
        userId: job.data.userId,
      });

      return { brief };
    } catch (error: any) {
      logger.error('Brief generation failed:', error);
      await prisma.chapter.update({
        where: { id: chapterId },
        data: { status: 'not_started' },
      });
      throw error;
    }
  }

  /**
   * Process chapter writing
   */
  private async processChapterWriting(job: Job): Promise<any> {
    const { projectId, chapterId, chapterNumber, apiKey } = job.data;

    try {
      await job.progress(10);

      // Get chapter with brief
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
          project: {
            include: {
              chapters: {
                where: {
                  chapterNumber: { lt: chapterNumber },
                  status: { in: ['written', 'verified', 'approved'] },
                },
                orderBy: { chapterNumber: 'asc' },
              },
              characters: true,
              locations: true,
              plotPoints: true,
            },
          },
        },
      });

      if (!chapter || !chapter.brief) {
        throw new Error('Chapter or brief not found');
      }

      await job.progress(25);

      // Run Writer Agent
      const agentService = new AgentService(apiKey);
      const content = await agentService.runWriter({
        storyBible: chapter.project.storyBible || '',
        brief: chapter.brief,
        previousChapters: chapter.project.chapters.map((ch) => ({
          number: ch.chapterNumber,
          content: ch.content || '',
        })),
        chapterNumber,
        characters: chapter.project.characters,
        locations: chapter.project.locations,
        plotPoints: chapter.project.plotPoints,
      });

      await job.progress(70);

      const wordCount = content.split(/\s+/).length;

      // Save content
      await prisma.chapter.update({
        where: { id: chapterId },
        data: {
          content,
          wordCount,
          status: 'written',
        },
      });

      // Create first revision
      await prisma.chapterRevision.create({
        data: {
          chapterId,
          content,
          wordCount,
          revisionNumber: 1,
          changeNote: 'Initial AI generation',
        },
      });

      await job.progress(100);

      // Automatically queue continuity check
      await this.queues.continuity.add({
        projectId,
        chapterId,
        chapterNumber,
        apiKey,
      });

      // Automatically queue story bible check
      await this.queues.storyBible.add({
        projectId,
        chapterId,
        chapterNumber,
        apiKey,
      });

      // Queue character extraction
      await this.queues.character.add({
        projectId,
        chapterId,
        apiKey,
      });

      return { content, wordCount };
    } catch (error: any) {
      logger.error('Chapter writing failed:', error);
      throw error;
    }
  }

  /**
   * Process continuity check
   */
  private async processContinuityCheck(job: Job): Promise<any> {
    const { projectId, chapterId, chapterNumber, apiKey } = job.data;

    try {
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
          project: {
            include: {
              chapters: {
                where: { chapterNumber: { lt: chapterNumber } },
                orderBy: { chapterNumber: 'asc' },
                include: {
                  characterStates: {
                    include: { character: true, chapter: true },
                  },
                },
              },
              characters: true,
              locations: true,
              plotPoints: true,
            },
          },
        },
      });

      if (!chapter || !chapter.content) {
        throw new Error('Chapter content not found');
      }

      // Get character states from previous chapters
      const characterStates = chapter.project.chapters
        .flatMap((ch) => ch.characterStates)
        .filter(Boolean);

      const agentService = new AgentService(apiKey);
      const result = await agentService.runContinuityCheck({
        storyBible: chapter.project.storyBible || '',
        chapterContent: chapter.content,
        chapterNumber,
        previousChapters: chapter.project.chapters.map((ch) => ({
          number: ch.chapterNumber,
          content: ch.content || '',
        })),
        characters: chapter.project.characters,
        locations: chapter.project.locations,
        plotPoints: chapter.project.plotPoints,
        characterStates,
      });

      // Save continuity check result
      await prisma.continuityCheck.upsert({
        where: { chapterId },
        create: {
          chapterId,
          overallStatus: result.overallStatus,
          summary: result.summary,
          characterIssues: result.characterIssues,
          plotIssues: result.plotIssues,
          locationIssues: result.locationIssues,
          timelineIssues: result.timelineIssues,
          storyBibleViolations: result.storyBibleViolations,
          score: result.score,
        },
        update: {
          overallStatus: result.overallStatus,
          summary: result.summary,
          characterIssues: result.characterIssues,
          plotIssues: result.plotIssues,
          locationIssues: result.locationIssues,
          timelineIssues: result.timelineIssues,
          storyBibleViolations: result.storyBibleViolations,
          score: result.score,
        },
      });

      // Update chapter status based on continuity
      if (result.score >= 90) {
        await prisma.chapter.update({
          where: { id: chapterId },
          data: { status: 'verified' },
        });
      }

      return result;
    } catch (error: any) {
      logger.error('Continuity check failed:', error);
      throw error;
    }
  }

  /**
   * Process story bible check
   */
  private async processStoryBibleCheck(job: Job): Promise<any> {
    const { projectId, chapterId, chapterNumber, apiKey } = job.data;

    try {
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: { project: true },
      });

      if (!chapter || !chapter.content) {
        throw new Error('Chapter content not found');
      }

      const agentService = new AgentService(apiKey);
      const result = await agentService.runStoryBibleCheck({
        storyBible: chapter.project.storyBible || '',
        chapterContent: chapter.content,
        chapterNumber,
      });

      return result;
    } catch (error: any) {
      logger.error('Story bible check failed:', error);
      throw error;
    }
  }

  /**
   * Process timeline extraction
   */
  private async processTimelineExtraction(job: Job): Promise<any> {
    const { projectId, apiKey } = job.data;

    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          chapters: {
            where: { content: { not: null } },
            orderBy: { chapterNumber: 'asc' },
          },
        },
      });

      if (!project) throw new Error('Project not found');

      const agentService = new AgentService(apiKey);
      const timeline = await agentService.runTimelineExtraction({
        projectId,
        chapters: project.chapters.map((ch) => ({
          number: ch.chapterNumber,
          content: ch.content || '',
        })),
      });

      // Save timeline events
      for (const event of timeline) {
        await prisma.timelineEvent.create({
          data: {
            projectId,
            eventDescription: event.eventDescription,
            eventType: event.eventType || 'action',
            timeframe: event.timeframe,
            sequenceOrder: event.sequenceOrder,
            involvedCharacters: event.involvedCharacters || [],
            location: event.location,
            chapterId: project.chapters.find((ch) => ch.chapterNumber === event.chapterNumber)?.id,
          },
        });
      }

      return timeline;
    } catch (error: any) {
      logger.error('Timeline extraction failed:', error);
      throw error;
    }
  }

  /**
   * Process character extraction
   */
  private async processCharacterExtraction(job: Job): Promise<any> {
    const { projectId, chapterId, apiKey } = job.data;

    try {
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
          project: { include: { characters: true } },
        },
      });

      if (!chapter || !chapter.content) {
        throw new Error('Chapter content not found');
      }

      const agentService = new AgentService(apiKey);
      const result = await agentService.runCharacterExtraction({
        projectId,
        chapterId,
        chapterContent: chapter.content,
        existingCharacters: chapter.project.characters,
      });

      // Create new characters
      for (const newChar of result.newCharacters || []) {
        const existing = await prisma.character.findFirst({
          where: {
            projectId,
            name: newChar.name,
          },
        });

        if (!existing) {
          await prisma.character.create({
            data: {
              projectId,
              name: newChar.name,
              description: newChar.description,
              physicalDescription: newChar.physicalDescription,
              role: newChar.role,
              traits: newChar.traits,
            },
          });
        }
      }

      // Record character appearances
      for (const appearance of result.appearances || []) {
        const character = await prisma.character.findFirst({
          where: { projectId, name: appearance.name },
        });

        if (character) {
          await prisma.characterAppearance.create({
            data: {
              characterId: character.id,
              chapterId,
              role: appearance.role,
              emotionalState: appearance.emotionalState,
              significance: appearance.significance,
            },
          });
        }
      }

      // Record character states
      for (const state of result.characterStates || []) {
        const character = await prisma.character.findFirst({
          where: { projectId, name: state.name },
        });

        if (character) {
          await prisma.characterState.create({
            data: {
              characterId: character.id,
              chapterId,
              knowledge: state.knowledge,
              injuries: state.injuries,
              possessions: state.possessions,
              currentLocation: state.currentLocation,
              emotionalState: state.emotionalState,
            },
          });
        }
      }

      return result;
    } catch (error: any) {
      logger.error('Character extraction failed:', error);
      throw error;
    }
  }

  /**
   * Setup event handlers for job updates
   */
  private setupEventHandlers() {
    Object.entries(this.queues).forEach(([name, queue]) => {
      queue.on('completed', (job, result) => {
        logger.info(`Job completed: ${name} #${job.id}`);
      });

      queue.on('failed', (job, err) => {
        logger.error(`Job failed: ${name} #${job?.id}`, err);
      });

      queue.on('progress', (job, progress) => {
        logger.debug(`Job progress: ${name} #${job.id} - ${progress}%`);
      });
    });
  }

  /**
   * Get job status
   */
  async getJobStatus(queueName: string, jobId: string) {
    const queue = this.queues[queueName as keyof typeof this.queues];
    if (!queue) throw new Error('Invalid queue name');

    const job = await queue.getJob(jobId);
    if (!job) return null;

    return {
      id: job.id,
      state: await job.getState(),
      progress: job.progress(),
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
    };
  }

  /**
   * Cancel a job
   */
  async cancelJob(queueName: string, jobId: string) {
    const queue = this.queues[queueName as keyof typeof this.queues];
    if (!queue) throw new Error('Invalid queue name');

    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
      return true;
    }
    return false;
  }
}

export default new QueueService();

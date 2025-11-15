import { Request } from 'express';

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// AI Agent Parameters
export interface ArchitectParams {
  storyBible: string;
  previousChapters: Array<{ number: number; brief: string; content: string }>;
  chapterNumber: number;
  plotPoints?: any[];
  characters?: any[];
  locations?: any[];
}

export interface WriterParams {
  storyBible: string;
  brief: string;
  previousChapters: Array<{ number: number; content: string }>;
  chapterNumber: number;
  targetWordCount?: number;
  writingStyle?: string;
  characters?: any[];
  locations?: any[];
  plotPoints?: any[];
}

export interface ContinuityParams {
  storyBible: string;
  chapterContent: string;
  chapterNumber: number;
  previousChapters: Array<{ number: number; content: string }>;
  characters?: any[];
  locations?: any[];
  plotPoints?: any[];
  characterStates?: any[];
}

export interface ContinuityResult {
  overallStatus: 'pass' | 'warning' | 'fail';
  summary: string;
  characterIssues: Array<{
    character: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  plotIssues: Array<{
    plotPoint: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  locationIssues: Array<{
    location: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  timelineIssues: Array<{
    event: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  storyBibleViolations: Array<{
    violation: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  score: number; // 0-100
}

export interface TimelineParams {
  projectId: string;
  chapters: Array<{ number: number; content: string }>;
}

export interface CharacterParams {
  projectId: string;
  chapterId: string;
  chapterContent: string;
  existingCharacters?: any[];
}

export interface StoryBibleCheckParams {
  storyBible: string;
  chapterContent: string;
  chapterNumber: number;
}

export interface StoryBibleCheckResult {
  compliant: boolean;
  violations: Array<{
    rule: string;
    violation: string;
    severity: 'low' | 'medium' | 'high';
    suggestion: string;
  }>;
  score: number; // 0-100
}

// Job Types
export type JobType =
  | 'architect'
  | 'writer'
  | 'continuity'
  | 'timeline'
  | 'character'
  | 'story_bible_check';

export interface GenerateChapterParams {
  projectId: string;
  chapterId: string;
  chapterNumber: number;
  apiKey?: string;
}

export interface BatchGenerateParams {
  projectId: string;
  startChapter: number;
  endChapter: number;
  apiKey?: string;
}

// Export Types
export interface ExportParams {
  project: any;
  chapters: any[];
  options?: {
    includeTitle?: boolean;
    includeTOC?: boolean;
    pageNumbers?: boolean;
    font?: string;
    fontSize?: number;
  };
}

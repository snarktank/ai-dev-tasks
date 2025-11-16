# AI Book Writing System - Complete Architecture

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Diagram](#architecture-diagram)
4. [Database Schema](#database-schema)
5. [API Design](#api-design)
6. [Frontend Architecture](#frontend-architecture)
7. [Backend Architecture](#backend-architecture)
8. [File Structure](#file-structure)
9. [Key Features Implementation](#key-features-implementation)
10. [Data Flow](#data-flow)
11. [Deployment Options](#deployment-options)
12. [Development Roadmap](#development-roadmap)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │         React/Next.js Frontend                      │    │
│  │  - Project Dashboard                                │    │
│  │  - Chapter Editor                                   │    │
│  │  - Generation Queue UI                              │    │
│  │  - Export Manager                                   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Node.js/Express Backend                     │    │
│  │  - REST API Endpoints                               │    │
│  │  - WebSocket Server (real-time updates)            │    │
│  │  - Authentication & Authorization                   │    │
│  │  - Business Logic                                   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   AI Agent   │  │  Generation  │  │   Export     │     │
│  │   Service    │  │    Queue     │  │   Service    │     │
│  │              │  │   (Bull)     │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │    Redis     │  │   File       │     │
│  │   Database   │  │   (Cache)    │  │   Storage    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Anthropic   │  │   Cloud      │                        │
│  │     API      │  │   Storage    │                        │
│  │   (Claude)   │  │   (S3/etc)   │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Option A: Web Application (Recommended)

**Frontend:**
- **Framework**: Next.js 14+ (React with App Router)
- **State Management**: Zustand or Redux Toolkit
- **UI Components**: Tailwind CSS + shadcn/ui
- **Rich Text Editor**: TipTap or Lexical
- **Real-time**: Socket.io-client
- **Data Fetching**: React Query (TanStack Query)

**Backend:**
- **Runtime**: Node.js 20+
- **Framework**: Express.js or Fastify
- **Language**: TypeScript
- **WebSocket**: Socket.io
- **Job Queue**: Bull (Redis-based)
- **Authentication**: NextAuth.js or Passport.js
- **Validation**: Zod

**Database & Storage:**
- **Primary Database**: PostgreSQL 15+
- **Cache/Queue**: Redis 7+
- **File Storage**: Local filesystem or AWS S3
- **ORM**: Prisma or Drizzle

**AI Integration:**
- **Provider**: Anthropic Claude API
- **SDK**: @anthropic-ai/sdk

**Document Generation:**
- **DOCX**: docx npm package
- **PDF**: jsPDF or Puppeteer
- **EPUB**: epub-gen

### Option B: Desktop Application

**Additional Technologies:**
- **Desktop Framework**: Electron
- **Database**: SQLite (embedded)
- **Auto-update**: electron-updater
- **Package**: electron-builder

---

## Database Schema

### PostgreSQL Schema (SQL)

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255),
    api_key_encrypted TEXT, -- User's Anthropic API key
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects Table (Books)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    story_bible TEXT,
    genre VARCHAR(100),
    target_word_count INTEGER DEFAULT 130000,
    status VARCHAR(50) DEFAULT 'draft', -- draft, in_progress, complete, published
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- Series Table (for trilogies/series)
CREATE TABLE series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Project-Series Relationship
CREATE TABLE project_series (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    series_id UUID REFERENCES series(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    PRIMARY KEY (project_id, series_id)
);

-- Chapters Table
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    brief TEXT,
    content TEXT,
    word_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'not_started', -- not_started, brief_complete, written, verified
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(project_id, chapter_number),
    INDEX idx_project_id (project_id),
    INDEX idx_status (status)
);

-- Chapter Revisions (version control)
CREATE TABLE chapter_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    word_count INTEGER,
    revision_number INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_chapter_id (chapter_id)
);

-- Continuity Checks
CREATE TABLE continuity_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    overall_status VARCHAR(20), -- pass, warning, fail
    summary TEXT,
    issues JSONB, -- Array of issue objects
    checked_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_chapter_id (chapter_id)
);

-- Characters (tracked across project)
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    traits JSONB, -- Array of character traits
    arc TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_project_id (project_id)
);

-- Character Appearances (which chapters they appear in)
CREATE TABLE character_appearances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    role TEXT, -- What they do in this chapter
    emotional_state TEXT,
    
    INDEX idx_character_id (character_id),
    INDEX idx_chapter_id (chapter_id)
);

-- Timeline Events
CREATE TABLE timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    event_description TEXT NOT NULL,
    timeframe VARCHAR(255),
    sequence_order INTEGER,
    
    INDEX idx_project_id (project_id),
    INDEX idx_chapter_id (chapter_id)
);

-- Generation Jobs (for queue tracking)
CREATE TABLE generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id),
    job_type VARCHAR(50), -- architect, writer, continuity, timeline, character
    status VARCHAR(50) DEFAULT 'queued', -- queued, processing, completed, failed
    progress INTEGER DEFAULT 0,
    result JSONB,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_project_id (project_id),
    INDEX idx_status (status)
);

-- Export History
CREATE TABLE exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    format VARCHAR(20), -- docx, pdf, epub, txt
    file_path VARCHAR(500),
    file_size BIGINT,
    chapters_included JSONB, -- Array of chapter numbers
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_project_id (project_id)
);

-- User Settings
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    default_model VARCHAR(100) DEFAULT 'claude-sonnet-4-20250514',
    auto_save_interval INTEGER DEFAULT 30, -- seconds
    default_export_format VARCHAR(20) DEFAULT 'docx',
    preferences JSONB,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Prisma Schema Alternative

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String    @id @default(uuid())
  email           String    @unique
  name            String?
  passwordHash    String?
  apiKeyEncrypted String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  projects        Project[]
  series          Series[]
  settings        UserSettings?
}

model Project {
  id               String    @id @default(uuid())
  userId           String
  title            String
  storyBible       String?   @db.Text
  genre            String?
  targetWordCount  Int       @default(130000)
  status           String    @default("draft")
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  chapters         Chapter[]
  characters       Character[]
  timelineEvents   TimelineEvent[]
  generationJobs   GenerationJob[]
  exports          Export[]
  projectSeries    ProjectSeries[]
  
  @@index([userId])
  @@index([status])
}

model Series {
  id          String    @id @default(uuid())
  userId      String
  title       String
  description String?   @db.Text
  createdAt   DateTime  @default(now())
  
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  projects    ProjectSeries[]
}

model ProjectSeries {
  projectId      String
  seriesId       String
  sequenceNumber Int
  
  project        Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  series         Series    @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  
  @@id([projectId, seriesId])
}

model Chapter {
  id            String    @id @default(uuid())
  projectId     String
  chapterNumber Int
  brief         String?   @db.Text
  content       String?   @db.Text
  wordCount     Int       @default(0)
  status        String    @default("not_started")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  project       Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  revisions     ChapterRevision[]
  continuityCheck ContinuityCheck?
  characterAppearances CharacterAppearance[]
  timelineEvents TimelineEvent[]
  generationJobs GenerationJob[]
  
  @@unique([projectId, chapterNumber])
  @@index([projectId])
  @@index([status])
}

model ChapterRevision {
  id             String    @id @default(uuid())
  chapterId      String
  content        String    @db.Text
  wordCount      Int?
  revisionNumber Int
  createdAt      DateTime  @default(now())
  
  chapter        Chapter   @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  
  @@index([chapterId])
}

model ContinuityCheck {
  id            String    @id @default(uuid())
  chapterId     String    @unique
  overallStatus String?
  summary       String?   @db.Text
  issues        Json?
  checkedAt     DateTime  @default(now())
  
  chapter       Chapter   @relation(fields: [chapterId], references: [id], onDelete: Cascade)
}

model Character {
  id          String    @id @default(uuid())
  projectId   String
  name        String
  description String?   @db.Text
  traits      Json?
  arc         String?   @db.Text
  createdAt   DateTime  @default(now())
  
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  appearances CharacterAppearance[]
  
  @@index([projectId])
}

model CharacterAppearance {
  id             String    @id @default(uuid())
  characterId    String
  chapterId      String
  role           String?   @db.Text
  emotionalState String?
  
  character      Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  chapter        Chapter   @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  
  @@index([characterId])
  @@index([chapterId])
}

model TimelineEvent {
  id               String    @id @default(uuid())
  projectId        String
  chapterId        String?
  eventDescription String    @db.Text
  timeframe        String?
  sequenceOrder    Int?
  
  project          Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  chapter          Chapter?  @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  
  @@index([projectId])
  @@index([chapterId])
}

model GenerationJob {
  id           String    @id @default(uuid())
  projectId    String
  chapterId    String?
  jobType      String
  status       String    @default("queued")
  progress     Int       @default(0)
  result       Json?
  errorMessage String?   @db.Text
  startedAt    DateTime?
  completedAt  DateTime?
  createdAt    DateTime  @default(now())
  
  project      Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  chapter      Chapter?  @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  
  @@index([projectId])
  @@index([status])
}

model Export {
  id               String    @id @default(uuid())
  projectId        String
  format           String
  filePath         String?
  fileSize         BigInt?
  chaptersIncluded Json?
  createdAt        DateTime  @default(now())
  
  project          Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@index([projectId])
}

model UserSettings {
  userId              String    @id
  defaultModel        String    @default("claude-sonnet-4-20250514")
  autoSaveInterval    Int       @default(30)
  defaultExportFormat String    @default("docx")
  preferences         Json?
  updatedAt           DateTime  @updatedAt
  
  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## API Design

### REST API Endpoints

```
BASE_URL: http://localhost:3000/api/v1

Authentication
├── POST   /auth/register          - Register new user
├── POST   /auth/login             - Login user
├── POST   /auth/logout            - Logout user
└── GET    /auth/me                - Get current user

Projects
├── GET    /projects               - List all user's projects
├── POST   /projects               - Create new project
├── GET    /projects/:id           - Get project details
├── PUT    /projects/:id           - Update project
├── DELETE /projects/:id           - Delete project
└── GET    /projects/:id/stats     - Get project statistics

Series
├── GET    /series                 - List all series
├── POST   /series                 - Create new series
├── GET    /series/:id             - Get series details
├── PUT    /series/:id             - Update series
├── DELETE /series/:id             - Delete series
└── POST   /series/:id/projects    - Add project to series

Chapters
├── GET    /projects/:projectId/chapters              - List all chapters
├── POST   /projects/:projectId/chapters              - Create chapter
├── GET    /projects/:projectId/chapters/:number      - Get chapter
├── PUT    /projects/:projectId/chapters/:number      - Update chapter
├── DELETE /projects/:projectId/chapters/:number      - Delete chapter
└── GET    /projects/:projectId/chapters/:number/revisions - Get revision history

AI Generation
├── POST   /generate/brief         - Generate chapter brief
├── POST   /generate/chapter       - Generate chapter content
├── POST   /generate/continuity    - Run continuity check
├── POST   /generate/timeline      - Generate timeline
├── POST   /generate/characters    - Extract characters
└── POST   /generate/batch         - Batch generate chapters

Generation Jobs
├── GET    /jobs                   - List user's jobs
├── GET    /jobs/:id               - Get job status
├── POST   /jobs/:id/cancel        - Cancel job
└── DELETE /jobs/:id               - Delete completed job

Characters
├── GET    /projects/:projectId/characters           - List characters
├── POST   /projects/:projectId/characters           - Create character
├── GET    /projects/:projectId/characters/:id       - Get character
├── PUT    /projects/:projectId/characters/:id       - Update character
└── DELETE /projects/:projectId/characters/:id       - Delete character

Timeline
├── GET    /projects/:projectId/timeline             - Get timeline
├── POST   /projects/:projectId/timeline             - Add event
├── PUT    /projects/:projectId/timeline/:id         - Update event
└── DELETE /projects/:projectId/timeline/:id         - Delete event

Export
├── POST   /export/docx            - Export to DOCX
├── POST   /export/pdf             - Export to PDF
├── POST   /export/epub            - Export to EPUB
├── POST   /export/txt             - Export to TXT
├── GET    /export/:id             - Download export
└── GET    /exports                - List export history

Settings
├── GET    /settings               - Get user settings
└── PUT    /settings               - Update settings
```

### WebSocket Events

```javascript
// Client → Server
socket.emit('subscribe:project', { projectId })
socket.emit('unsubscribe:project', { projectId })

// Server → Client
socket.on('job:queued', { jobId, type, chapterId })
socket.on('job:started', { jobId, progress: 0 })
socket.on('job:progress', { jobId, progress: 50 })
socket.on('job:completed', { jobId, result })
socket.on('job:failed', { jobId, error })
socket.on('chapter:updated', { chapterId, wordCount })
socket.on('project:updated', { projectId, changes })
```

---

## Frontend Architecture

### Component Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Projects dashboard
│   │   ├── projects/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx     # Project overview
│   │   │   │   ├── setup/       # Story Bible
│   │   │   │   ├── generate/    # Generation UI
│   │   │   │   ├── chapters/
│   │   │   │   │   └── [number]/page.tsx
│   │   │   │   ├── characters/
│   │   │   │   ├── timeline/
│   │   │   │   └── export/
│   │   │   └── new/
│   │   └── series/
│   │       ├── page.tsx
│   │       └── [id]/
│   └── api/                     # API routes
│       └── [...all routes]/
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── editor/
│   │   ├── ChapterEditor.tsx
│   │   ├── StoryBibleEditor.tsx
│   │   └── MarkdownPreview.tsx
│   ├── generation/
│   │   ├── GenerationQueue.tsx
│   │   ├── JobProgress.tsx
│   │   └── BatchGenerator.tsx
│   ├── project/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectSettings.tsx
│   │   ├── ChapterGrid.tsx
│   │   └── ProgressStats.tsx
│   ├── characters/
│   │   ├── CharacterList.tsx
│   │   ├── CharacterCard.tsx
│   │   └── CharacterGraph.tsx
│   ├── timeline/
│   │   ├── TimelineView.tsx
│   │   └── EventCard.tsx
│   └── export/
│       ├── ExportDialog.tsx
│       └── FormatSelector.tsx
├── lib/
│   ├── api/                     # API client functions
│   │   ├── projects.ts
│   │   ├── chapters.ts
│   │   ├── generation.ts
│   │   └── export.ts
│   ├── hooks/                   # Custom React hooks
│   │   ├── useProject.ts
│   │   ├── useChapter.ts
│   │   ├── useGenerationQueue.ts
│   │   └── useWebSocket.ts
│   ├── store/                   # State management
│   │   ├── projectStore.ts
│   │   ├── editorStore.ts
│   │   └── queueStore.ts
│   └── utils/
│       ├── formatting.ts
│       ├── wordCount.ts
│       └── export.ts
└── types/
    ├── project.ts
    ├── chapter.ts
    ├── generation.ts
    └── api.ts
```

### Key Frontend Features

**1. Real-time Chapter Editor**
```typescript
// components/editor/ChapterEditor.tsx
import { useEditor } from '@tiptap/react'
import { useAutoSave } from '@/lib/hooks/useAutoSave'

export function ChapterEditor({ chapterId, initialContent }) {
  const editor = useEditor({
    content: initialContent,
    extensions: [StarterKit, Placeholder],
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      debouncedSave(content)
    }
  })
  
  const { debouncedSave } = useAutoSave({
    chapterId,
    saveInterval: 5000 // 5 seconds
  })
  
  return <EditorContent editor={editor} />
}
```

**2. Generation Queue Monitor**
```typescript
// components/generation/GenerationQueue.tsx
import { useGenerationQueue } from '@/lib/hooks/useGenerationQueue'

export function GenerationQueue({ projectId }) {
  const { jobs, progress } = useGenerationQueue(projectId)
  
  return (
    <div>
      {jobs.map(job => (
        <JobCard 
          key={job.id}
          job={job}
          progress={progress[job.id]}
        />
      ))}
    </div>
  )
}
```

**3. WebSocket Integration**
```typescript
// lib/hooks/useWebSocket.ts
import { useEffect } from 'react'
import { io } from 'socket.io-client'

export function useWebSocket(projectId: string) {
  useEffect(() => {
    const socket = io('http://localhost:3000')
    
    socket.emit('subscribe:project', { projectId })
    
    socket.on('job:progress', (data) => {
      // Update progress bar
    })
    
    socket.on('chapter:updated', (data) => {
      // Refresh chapter data
    })
    
    return () => {
      socket.emit('unsubscribe:project', { projectId })
      socket.disconnect()
    }
  }, [projectId])
}
```

---

## Backend Architecture

### Server Structure

```
server/
├── src/
│   ├── index.ts                 # Entry point
│   ├── app.ts                   # Express app setup
│   ├── server.ts                # HTTP server
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── anthropic.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── validation.ts
│   │   └── rateLimit.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── projects.routes.ts
│   │   ├── chapters.routes.ts
│   │   ├── generation.routes.ts
│   │   ├── export.routes.ts
│   │   └── index.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── projects.controller.ts
│   │   ├── chapters.controller.ts
│   │   ├── generation.controller.ts
│   │   └── export.controller.ts
│   ├── services/
│   │   ├── ai/
│   │   │   ├── AgentService.ts
│   │   │   ├── ArchitectAgent.ts
│   │   │   ├── WriterAgent.ts
│   │   │   ├── ContinuityAgent.ts
│   │   │   ├── TimelineAgent.ts
│   │   │   └── CharacterAgent.ts
│   │   ├── queue/
│   │   │   ├── QueueService.ts
│   │   │   ├── workers/
│   │   │   │   ├── briefWorker.ts
│   │   │   │   ├── chapterWorker.ts
│   │   │   │   └── continuityWorker.ts
│   │   │   └── processors/
│   │   ├── export/
│   │   │   ├── ExportService.ts
│   │   │   ├── DocxExporter.ts
│   │   │   ├── PdfExporter.ts
│   │   │   └── EpubExporter.ts
│   │   ├── storage/
│   │   │   └── StorageService.ts
│   │   └── websocket/
│   │       └── WebSocketService.ts
│   ├── models/                  # Prisma client
│   │   └── prisma.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── crypto.ts
│   │   └── validation.ts
│   └── types/
│       ├── express.d.ts
│       └── api.types.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── unit/
│   └── integration/
└── package.json
```

### Core Service Implementation

**1. AI Agent Service**
```typescript
// services/ai/AgentService.ts
import Anthropic from '@anthropic-ai/sdk'

export class AgentService {
  private anthropic: Anthropic
  
  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey })
  }
  
  async runArchitect(params: ArchitectParams): Promise<string> {
    const { storyBible, previousChapters, chapterNumber } = params
    
    const prompt = this.buildArchitectPrompt({
      storyBible,
      previousChapters,
      chapterNumber
    })
    
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })
    
    return response.content[0].text
  }
  
  async runWriter(params: WriterParams): Promise<string> {
    const { storyBible, brief, previousChapters } = params
    
    const prompt = this.buildWriterPrompt({
      storyBible,
      brief,
      previousChapters
    })
    
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      messages: [{ role: 'user', content: prompt }]
    })
    
    return response.content[0].text
  }
  
  async runContinuityCheck(params: ContinuityParams): Promise<ContinuityResult> {
    // Implementation similar to above
  }
}
```

**2. Queue Service**
```typescript
// services/queue/QueueService.ts
import Bull from 'bull'
import { redisConfig } from '@/config/redis'

export class QueueService {
  private queues: {
    brief: Bull.Queue
    chapter: Bull.Queue
    continuity: Bull.Queue
  }
  
  constructor() {
    this.queues = {
      brief: new Bull('brief-generation', redisConfig),
      chapter: new Bull('chapter-generation', redisConfig),
      continuity: new Bull('continuity-check', redisConfig)
    }
    
    this.setupWorkers()
  }
  
  async generateChapter(params: GenerateChapterParams) {
    // Add jobs in sequence
    const briefJob = await this.queues.brief.add({
      projectId: params.projectId,
      chapterId: params.chapterId,
      chapterNumber: params.chapterNumber
    })
    
    // Wait for brief to complete, then add chapter job
    briefJob.finished().then(() => {
      this.queues.chapter.add({
        projectId: params.projectId,
        chapterId: params.chapterId
      })
    })
  }
  
  async batchGenerate(params: BatchGenerateParams) {
    const { projectId, startChapter, endChapter } = params
    
    // Add all jobs to queue
    for (let i = startChapter; i <= endChapter; i++) {
      await this.generateChapter({
        projectId,
        chapterNumber: i
      })
    }
  }
  
  private setupWorkers() {
    // Process brief generation
    this.queues.brief.process(5, async (job) => {
      const agentService = new AgentService(job.data.apiKey)
      const brief = await agentService.runArchitect(job.data)
      
      // Save to database
      await prisma.chapter.update({
        where: { id: job.data.chapterId },
        data: { brief }
      })
      
      return { brief }
    })
    
    // Process chapter writing (limit concurrency to avoid rate limits)
    this.queues.chapter.process(2, async (job) => {
      const agentService = new AgentService(job.data.apiKey)
      const content = await agentService.runWriter(job.data)
      
      await prisma.chapter.update({
        where: { id: job.data.chapterId },
        data: { 
          content,
          wordCount: content.split(/\s+/).length
        }
      })
      
      // Automatically trigger continuity check
      this.queues.continuity.add({
        chapterId: job.data.chapterId
      })
      
      return { content }
    })
  }
}
```

**3. Export Service**
```typescript
// services/export/DocxExporter.ts
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import * as fs from 'fs'

export class DocxExporter {
  async export(params: ExportParams): Promise<string> {
    const { project, chapters } = params
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Title page
          new Paragraph({
            text: project.title,
            heading: HeadingLevel.TITLE,
            alignment: 'center'
          }),
          
          // Table of contents
          this.generateTOC(chapters),
          
          // Chapters
          ...chapters.flatMap(chapter => 
            this.formatChapter(chapter)
          )
        ]
      }]
    })
    
    const buffer = await Packer.toBuffer(doc)
    const filePath = `/exports/${project.id}-${Date.now()}.docx`
    
    fs.writeFileSync(filePath, buffer)
    
    return filePath
  }
  
  private formatChapter(chapter: Chapter): Paragraph[] {
    return [
      // Chapter heading
      new Paragraph({
        text: `Chapter ${chapter.number}`,
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true
      }),
      
      // Chapter content
      ...this.parseContent(chapter.content)
    ]
  }
  
  private parseContent(content: string): Paragraph[] {
    // Split by paragraphs and create Document paragraphs
    return content.split('\n\n').map(text => 
      new Paragraph({
        children: [new TextRun(text)]
      })
    )
  }
}
```

**4. WebSocket Service**
```typescript
// services/websocket/WebSocketService.ts
import { Server } from 'socket.io'
import { Server as HTTPServer } from 'http'

export class WebSocketService {
  private io: Server
  
  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: { origin: '*' }
    })
    
    this.setupHandlers()
  }
  
  private setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)
      
      socket.on('subscribe:project', ({ projectId }) => {
        socket.join(`project:${projectId}`)
      })
      
      socket.on('unsubscribe:project', ({ projectId }) => {
        socket.leave(`project:${projectId}`)
      })
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }
  
  // Emit to all clients watching a project
  emitToProject(projectId: string, event: string, data: any) {
    this.io.to(`project:${projectId}`).emit(event, data)
  }
  
  // Emit job progress
  emitJobProgress(projectId: string, jobId: string, progress: number) {
    this.emitToProject(projectId, 'job:progress', { jobId, progress })
  }
  
  emitJobCompleted(projectId: string, jobId: string, result: any) {
    this.emitToProject(projectId, 'job:completed', { jobId, result })
  }
}
```

---

## Data Flow

### Chapter Generation Flow

```
1. User clicks "Generate Chapter 1"
   ↓
2. Frontend sends POST /generate/chapter
   ↓
3. Backend creates GenerationJob in DB (status: queued)
   ↓
4. Backend adds job to Bull queue
   ↓
5. WebSocket notifies frontend: job:queued
   ↓
6. Bull worker picks up job
   ↓
7. Worker updates job status to "processing"
   ↓
8. WebSocket notifies: job:started
   ↓
9. Worker calls ArchitectAgent
   ↓
10. Brief generated, saved to Chapter.brief
   ↓
11. WebSocket notifies: job:progress (33%)
   ↓
12. Worker calls WriterAgent
   ↓
13. Content generated, saved to Chapter.content
   ↓
14. WebSocket notifies: job:progress (66%)
   ↓
15. Worker calls ContinuityAgent
   ↓
16. Continuity check saved to ContinuityCheck table
   ↓
17. Job status updated to "completed"
   ↓
18. WebSocket notifies: job:completed
   ↓
19. Frontend refreshes chapter data
```

### Real-time Updates Flow

```
User A edits Chapter 1
   ↓
Auto-save triggers (debounced 5s)
   ↓
PUT /chapters/1 { content: "..." }
   ↓
Backend saves to database
   ↓
Backend emits via WebSocket
   ↓
User B (watching same project) gets update
   ↓
User B's UI shows "Chapter 1 updated by User A"
```

---

## File Structure

### Complete Project Structure

```
ai-book-writer/
├── client/                      # Frontend (Next.js)
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   ├── public/
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                      # Backend (Node.js)
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   ├── prisma/
│   ├── tests/
│   └── package.json
│
├── shared/                      # Shared types/utils
│   ├── types/
│   └── constants/
│
├── docs/
│   ├── api.md
│   ├── architecture.md
│   └── deployment.md
│
├── scripts/
│   ├── setup-db.sh
│   └── seed-data.ts
│
├── docker/
│   ├── Dockerfile.client
│   ├── Dockerfile.server
│   └── docker-compose.yml
│
├── .env.example
├── .gitignore
├── README.md
└── package.json                 # Root package (workspaces)
```

---

## Key Features Implementation

### Feature 1: Background Generation Queue

**What it does:**
- Queue up multiple chapter generations
- Process 2-5 chapters simultaneously
- Track progress in real-time
- Handle failures gracefully

**Implementation:**
```typescript
// Example: Generate entire Act I
POST /generate/batch
{
  "projectId": "uuid",
  "startChapter": 1,
  "endChapter": 7,
  "options": {
    "concurrency": 3
  }
}

// Backend creates 7 jobs
// Processes 3 at a time
// User can watch progress via WebSocket
// Estimated time: 10-15 minutes for 7 chapters
```

### Feature 2: Version Control

**What it does:**
- Save every version of each chapter
- Compare versions side-by-side
- Rollback to previous version
- See edit history

**Implementation:**
```typescript
// Auto-save creates revision
PUT /chapters/:id
→ Creates new ChapterRevision entry

// Get all revisions
GET /chapters/:id/revisions
→ Returns list with timestamps

// Rollback
POST /chapters/:id/rollback
{
  "revisionId": "uuid"
}
→ Sets chapter.content to revision.content
```

### Feature 3: Professional Export

**What it does:**
- Export to DOCX with proper formatting
- Generate PDF with custom styling
- Create EPUB for e-readers
- Include table of contents

**Implementation:**
```typescript
POST /export/docx
{
  "projectId": "uuid",
  "chapters": [1, 2, 3, ...], // or "all"
  "options": {
    "includeTitle": true,
    "includeTOC": true,
    "pageNumbers": true,
    "font": "Times New Roman",
    "fontSize": 12
  }
}

→ Generates DOCX file
→ Returns download link
→ File available for 7 days
```

### Feature 4: Series Management

**What it does:**
- Link books in a series
- Track series-wide characters
- Maintain continuity across books
- Export entire series

**Implementation:**
```typescript
// Create series
POST /series
{
  "title": "The Dark Tower",
  "description": "Epic fantasy series"
}

// Add books to series
POST /series/:id/projects
{
  "projectId": "book-1-uuid",
  "sequenceNumber": 1
}

// Get series with all books
GET /series/:id
→ Returns series with ordered projects
→ Shows combined stats
```

### Feature 5: Character Tracking

**What it does:**
- Extract characters from chapters
- Track appearances
- Monitor character arcs
- Visualize relationships

**Implementation:**
```typescript
// After chapter generation, run character extraction
POST /generate/characters
{
  "projectId": "uuid",
  "chapterId": "uuid"
}

// AI extracts characters from chapter
→ Creates Character entries if new
→ Creates CharacterAppearance for this chapter
→ Updates character traits/arc

// Get character graph
GET /projects/:id/characters/graph
→ Returns nodes (characters) and edges (relationships)
```

---

## Deployment Options

### Option 1: Self-Hosted (Recommended for MVP)

**Tech Stack:**
- VPS: DigitalOcean Droplet ($12/month)
- Database: Managed PostgreSQL ($15/month)
- Redis: Managed Redis ($10/month)
- Storage: S3-compatible (Backblaze B2)

**Total: ~$40/month**

**Setup:**
```bash
# Install dependencies
apt update && apt install docker docker-compose

# Clone repo
git clone <repo>

# Configure environment
cp .env.example .env
# Edit .env with API keys, DB credentials

# Start services
docker-compose up -d

# Run migrations
docker exec server npm run prisma:migrate

# Access at https://yourapp.com
```

### Option 2: Cloud Platform (Easier but more expensive)

**Vercel + Railway**
- Frontend: Vercel (Free tier)
- Backend: Railway ($20/month)
- Database: Railway PostgreSQL (included)
- Redis: Upstash (Free tier)

**Total: ~$20/month**

**Deploy:**
```bash
# Frontend
vercel deploy

# Backend
railway up

# Set environment variables in Railway dashboard
```

### Option 3: Full AWS (Production-ready)

**AWS Services:**
- EC2 or ECS for backend
- RDS PostgreSQL
- ElastiCache Redis
- S3 for storage
- CloudFront CDN
- Route53 for DNS

**Cost: $100-200/month depending on usage**

---

## Development Roadmap

### Phase 1: MVP (2 weeks)
**Week 1:**
- ✅ Set up project structure
- ✅ Database schema & migrations
- ✅ Basic authentication
- ✅ Project CRUD operations
- ✅ Chapter CRUD operations
- ✅ Basic AI agent integration

**Week 2:**
- ✅ Generation queue setup
- ✅ WebSocket real-time updates
- ✅ Basic frontend UI
- ✅ Chapter editor
- ✅ Generation UI
- ✅ Simple export (TXT)

### Phase 2: Core Features (2 weeks)
**Week 3:**
- ✅ Advanced AI agents (all 5)
- ✅ Batch generation
- ✅ Continuity checking
- ✅ Character extraction
- ✅ Timeline generation

**Week 4:**
- ✅ Version control
- ✅ DOCX export
- ✅ Project dashboard improvements
- ✅ Progress visualization
- ✅ Error handling & recovery

### Phase 3: Polish (1 week)
**Week 5:**
- ✅ Series management
- ✅ Advanced export (PDF, EPUB)
- ✅ Character graph visualization
- ✅ Timeline visualization
- ✅ Settings & preferences
- ✅ Testing & bug fixes

### Phase 4: Deployment (3-5 days)
- ✅ Set up production environment
- ✅ Configure CI/CD
- ✅ Domain & SSL setup
- ✅ Monitoring & logging
- ✅ Backup strategy

**Total: 5-6 weeks from start to production**

---

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/aibooks"

# Redis
REDIS_URL="redis://localhost:6379"

# Anthropic API
ANTHROPIC_API_KEY="sk-ant-..."

# JWT Secret
JWT_SECRET="your-super-secret-key"

# Storage
STORAGE_TYPE="local" # or "s3"
STORAGE_PATH="./uploads"

# AWS (if using S3)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET=""

# App
NODE_ENV="development"
PORT=3000
CLIENT_URL="http://localhost:3001"

# WebSocket
WS_PORT=3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Next Steps

1. **Set up development environment**
   - Install Node.js, PostgreSQL, Redis
   - Initialize Git repository
   - Set up package workspaces

2. **Create database schema**
   - Write Prisma schema
   - Generate migrations
   - Seed with test data

3. **Build backend skeleton**
   - Express app with routes
   - Authentication middleware
   - Database connection

4. **Implement AI services**
   - Agent classes
   - Queue workers
   - WebSocket handlers

5. **Build frontend**
   - Next.js setup
   - Core components
   - API integration

6. **Testing & deployment**
   - Unit tests
   - Integration tests
   - Deploy to staging
   - Production deployment

---

This architecture provides a complete blueprint for building a production-ready AI book writing system. Every component is designed to scale, handle errors gracefully, and provide an excellent user experience.

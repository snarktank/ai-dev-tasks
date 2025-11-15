# Quick Start Guide: Building with Claude Code

## Getting Started in 30 Minutes

This guide shows you how to start building the AI Book Writing System using Claude Code.

---

## Prerequisites

**Install these first:**
```bash
# Node.js 20+
node --version  # Should be v20.x.x or higher

# PostgreSQL 15+
psql --version

# Redis
redis-cli --version

# Git
git --version
```

---

## Step 1: Project Setup (5 minutes)

### Initialize the project
```bash
# Create project directory
mkdir ai-book-writer
cd ai-book-writer

# Initialize git
git init

# Create package.json for monorepo
npm init -y

# Set up workspaces
cat > package.json << EOF
{
  "name": "ai-book-writer",
  "private": true,
  "workspaces": [
    "client",
    "server",
    "shared"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev"
  }
}
EOF

# Install concurrently for running both servers
npm install -D concurrently
```

---

## Step 2: Set Up Backend (10 minutes)

### Create server directory
```bash
mkdir -p server/src
cd server

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express cors dotenv
npm install prisma @prisma/client
npm install @anthropic-ai/sdk
npm install bull redis
npm install socket.io
npm install bcrypt jsonwebtoken
npm install zod

# Install dev dependencies
npm install -D typescript @types/node @types/express
npm install -D ts-node-dev nodemon
npm install -D @types/bcrypt @types/jsonwebtoken
```

### Create TypeScript config
```bash
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOF
```

### Initialize Prisma
```bash
npx prisma init

# This creates:
# - prisma/schema.prisma
# - .env file
```

### Configure Prisma schema
```bash
# Edit prisma/schema.prisma
# Copy the schema from architecture.md
```

### Create environment file
```bash
cat > .env << EOF
DATABASE_URL="postgresql://localhost:5432/aibooks?schema=public"
REDIS_URL="redis://localhost:6379"
ANTHROPIC_API_KEY="your-api-key-here"
JWT_SECRET="your-secret-key-here"
PORT=3000
NODE_ENV="development"
EOF
```

### Run migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Step 3: Basic Backend Structure (10 minutes)

### Create entry point
```bash
cat > src/index.ts << 'EOF'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Projects endpoint (placeholder)
app.get('/api/v1/projects', (req, res) => {
  res.json({ projects: [] })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
EOF
```

### Add start scripts to package.json
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### Test the server
```bash
npm run dev

# In another terminal:
curl http://localhost:3000/health
# Should return: {"status":"ok"}
```

---

## Step 4: Set Up Frontend (5 minutes)

### Create Next.js app
```bash
cd ..
npx create-next-app@latest client --typescript --tailwind --app --no-src-dir

cd client

# Install additional dependencies
npm install zustand
npm install @tanstack/react-query
npm install socket.io-client
npm install lucide-react
```

### Create basic project page
```bash
mkdir -p app/projects
cat > app/projects/page.tsx << 'EOF'
'use client'

import { useEffect, useState } from 'react'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    fetch('http://localhost:3000/api/v1/projects')
      .then(res => res.json())
      .then(data => setProjects(data.projects))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">My Projects</h1>
      <div className="grid gap-4">
        {projects.length === 0 ? (
          <p>No projects yet. Create your first book!</p>
        ) : (
          projects.map((project: any) => (
            <div key={project.id} className="border p-4 rounded">
              {project.title}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
EOF
```

### Test the frontend
```bash
npm run dev
# Open http://localhost:3001/projects
```

---

## Step 5: Using Claude Code to Build

Now that you have the skeleton, use Claude Code to accelerate development:

### Example: Generate a complete controller

**Prompt to Claude Code:**
```
Create a complete projects controller for my AI book writing app.

Context:
- Using Express + TypeScript
- Prisma ORM with PostgreSQL
- Need CRUD operations for projects
- Each project has: title, storyBible, chapters
- Include error handling and validation

File location: server/src/controllers/projects.controller.ts
```

### Example: Generate AI service

**Prompt to Claude Code:**
```
Create the ArchitectAgent service that generates chapter briefs.

Context:
- Uses Anthropic Claude API
- Takes storyBible, previousChapters, chapterNumber
- Returns a structured brief (400-600 words)
- Include retry logic and error handling
- Use TypeScript

File location: server/src/services/ai/ArchitectAgent.ts
```

### Example: Create database migrations

**Prompt to Claude Code:**
```
I need to add a 'series' feature to link books together.

Create:
1. Prisma migration to add series table
2. Update Project model to include series relationship
3. Create API endpoints for series CRUD
4. Update frontend to show series

Current schema is in: server/prisma/schema.prisma
```

---

## Step 6: Key Features to Build (In Order)

### Week 1: Core Foundation
1. ✅ Authentication system
2. ✅ Project CRUD
3. ✅ Chapter CRUD
4. ✅ Basic AI integration
5. ✅ Simple chapter editor

**Claude Code prompt:**
```
Build a complete authentication system with:
- User registration and login
- JWT tokens
- Password hashing with bcrypt
- Protected routes middleware
- Login/register pages in Next.js

Use the database schema I already have.
```

### Week 2: AI Agents
1. ✅ Architect agent
2. ✅ Writer agent
3. ✅ Continuity agent
4. ✅ Queue system
5. ✅ WebSocket updates

**Claude Code prompt:**
```
Create a complete queue system for chapter generation using Bull.

Requirements:
- Queue brief generation → chapter writing → continuity check
- Process 2-3 chapters concurrently
- WebSocket progress updates
- Error handling and retry logic
- Store job status in database

Show me the complete implementation.
```

### Week 3: Polish
1. ✅ Export to DOCX
2. ✅ Version control
3. ✅ Character tracking
4. ✅ Timeline view
5. ✅ Series management

**Claude Code prompt:**
```
Build a DOCX export service that:
- Takes a project and selected chapters
- Creates professional Word document
- Includes title page, TOC, formatted chapters
- Uses the 'docx' npm package
- Returns download link

File: server/src/services/export/DocxExporter.ts
```

---

## Step 7: Testing Your Work

### Test backend endpoints
```bash
# Create a test script
cat > server/test-api.sh << 'EOF'
#!/bin/bash

# Test project creation
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Novel",
    "storyBible": "A tale of adventure..."
  }'

# Test chapter generation
curl -X POST http://localhost:3000/api/v1/generate/chapter \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "uuid-here",
    "chapterNumber": 1
  }'
EOF

chmod +x server/test-api.sh
./server/test-api.sh
```

---

## Claude Code Pro Tips

### 1. Be Specific with Context
**Bad:**
```
Create a user model
```

**Good:**
```
Create a User model using Prisma ORM with:
- id (UUID)
- email (unique, required)
- name (optional)
- passwordHash
- createdAt, updatedAt timestamps

Include the model in: server/prisma/schema.prisma
Also create types in: server/src/types/user.types.ts
```

### 2. Reference Existing Code
**Good prompt:**
```
I already have a projects controller at server/src/controllers/projects.controller.ts

Create a similar chapters controller that:
- Follows the same pattern
- Includes the same error handling
- Uses the same response format
- Add CRUD operations for chapters

File: server/src/controllers/chapters.controller.ts
```

### 3. Ask for Complete Implementations
**Good prompt:**
```
Create a COMPLETE queue worker for chapter generation including:

1. Bull queue setup
2. Worker processor function
3. Error handling and retries
4. Progress tracking
5. WebSocket notifications
6. Database updates
7. Tests

Show me ALL the code needed. Don't summarize or skip parts.
```

### 4. Iterate and Improve
```
# First pass
"Create an AI agent service"

# After reviewing
"The agent service looks good but needs:
- Better error messages
- Rate limit handling
- Retry logic with exponential backoff
- Request/response logging

Update the service with these improvements."
```

---

## Common Issues & Solutions

### Issue: Database connection fails
```bash
# Check PostgreSQL is running
pg_isready

# Check your DATABASE_URL
echo $DATABASE_URL

# Reset database
npx prisma migrate reset
```

### Issue: Redis connection fails
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Start Redis
redis-server
```

### Issue: Type errors
```bash
# Regenerate Prisma client
npx prisma generate

# Clear TypeScript cache
rm -rf node_modules/.cache
```

---

## Next Steps

Once you have the basic structure working:

1. **Add authentication**
   - JWT tokens
   - Protected routes
   - User sessions

2. **Implement AI agents**
   - One agent at a time
   - Test thoroughly
   - Add to queue

3. **Build queue system**
   - Start with single jobs
   - Add batch processing
   - Implement WebSocket updates

4. **Create export features**
   - Start with TXT
   - Add DOCX
   - Add PDF/EPUB

5. **Polish UI**
   - Add loading states
   - Error messages
   - Progress indicators

---

## Useful Commands

```bash
# Start everything
npm run dev

# Just backend
cd server && npm run dev

# Just frontend
cd client && npm run dev

# Database commands
npx prisma studio              # Open database GUI
npx prisma migrate dev         # Create new migration
npx prisma migrate reset       # Reset database

# Redis commands
redis-cli                      # Open Redis CLI
redis-cli FLUSHALL            # Clear all Redis data

# View logs
tail -f server/logs/app.log   # Backend logs
```

---

## Resource Links

- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Anthropic API**: https://docs.anthropic.com
- **Bull Queue**: https://github.com/OptimalBits/bull
- **Socket.io**: https://socket.io/docs

---

## Getting Help from Claude Code

When you're stuck, ask Claude Code:

```
I'm getting this error: [paste error]

Here's my code: [paste code]

What's wrong and how do I fix it?
```

Or:

```
I want to add [feature] to my app.

Current architecture: [describe]

Show me the complete implementation including:
- Database changes
- Backend API
- Frontend UI
- Tests
```

---

**You're now ready to build!** 🚀

Start with the basic structure, then use Claude Code to accelerate each feature. Build one component at a time, test it, then move to the next.

The architecture document has all the details. Use this quick start to get the foundation running, then expand from there.

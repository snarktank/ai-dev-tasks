# 🚀 AI Book Writer - Setup Instructions for Non-Coders

**Welcome!** This guide will walk you through setting up your bulletproof AI book writing system step-by-step. No coding experience required!

---

## 📋 What You Need

Before we begin, you'll need:

1. **A Computer** (Windows, Mac, or Linux)
2. **Anthropic API Key** (for Claude AI)
3. **Docker Desktop** (we'll install this)
4. **About 30 minutes**

---

## Step 1: Get Your Anthropic API Key

The AI writing system uses Claude by Anthropic. You'll need an API key:

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Click on "API Keys" in the left sidebar
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)
6. **Save this somewhere safe!** You'll need it in Step 4

**Cost estimate:** Generating a full novel (130,000 words / ~26 chapters) costs approximately $15-30 depending on the model used.

---

## Step 2: Install Docker Desktop

Docker will run all the software you need automatically.

### For Windows:

1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Run the installer
3. Follow the installation wizard (use default settings)
4. Restart your computer if prompted
5. Open Docker Desktop - wait for it to say "Docker Desktop is running"

### For Mac:

1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Drag Docker to your Applications folder
3. Open Docker from Applications
4. Click "Open" if macOS asks for permission
5. Wait for Docker to start (icon appears in menu bar)

### For Linux (Ubuntu/Debian):

```bash
# Open Terminal and run these commands:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Log out and back in
```

**Verify Docker is working:**
- Open Terminal (Mac/Linux) or Command Prompt (Windows)
- Type: `docker --version`
- You should see something like: `Docker version 24.0.0`

---

## Step 3: Download the AI Book Writer Code

### Option A: Download ZIP (Easiest)

1. Go to the GitHub repository (where you got this file)
2. Click the green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file to a folder like `C:\AIBookWriter` (Windows) or `~/AIBookWriter` (Mac/Linux)

### Option B: Use Git (If you have it)

```bash
git clone <repository-url> AIBookWriter
cd AIBookWriter
```

---

## Step 4: Configure Your API Key

1. In the `AIBookWriter` folder, find the file named `.env.example`
2. Make a copy of it and name it `.env` (remove the `.example` part)
3. Open `.env` with Notepad (Windows) or TextEdit (Mac)
4. Find the line that says:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-your-api-key-here
   ```
5. Replace `sk-ant-api03-your-api-key-here` with your actual API key from Step 1
6. Save the file

**Important:** The `.env` file should look like this:
```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
JWT_SECRET=please-change-this-to-a-random-string
```

**Generate a secure JWT_SECRET:**
- Windows: Just type any random long string (20+ characters)
- Mac/Linux: Run this in Terminal: `openssl rand -base64 32`

---

## Step 5: Start the System

Now for the magic! ✨

1. Open Terminal (Mac/Linux) or Command Prompt (Windows)
2. Navigate to the AIBookWriter folder:
   ```bash
   # Windows:
   cd C:\AIBookWriter

   # Mac/Linux:
   cd ~/AIBookWriter
   ```

3. Run this single command:
   ```bash
   docker-compose up -d
   ```

4. Wait 3-5 minutes while Docker downloads and sets everything up

5. **You'll know it's ready when you see:**
   ```
   ✓ Container aibooks-postgres   Started
   ✓ Container aibooks-redis      Started
   ✓ Container aibooks-server     Started
   ✓ Container aibooks-client     Started
   ```

---

## Step 6: Set Up the Database

This is a one-time setup:

```bash
# Run database migrations
docker exec aibooks-server npx prisma migrate deploy
```

You should see messages about tables being created.

---

## Step 7: Open Your Book Writing System

🎉 **You're done with setup!**

1. Open your web browser
2. Go to: **http://localhost:3001**
3. You should see the AI Book Writer login page!

---

## 🎯 Quick Start Guide

### Creating Your First Project:

1. **Register an Account**
   - Click "Create Account"
   - Enter your email and password
   - Click "Sign Up"

2. **Create a New Project**
   - Click "+ New Project"
   - Enter your book title
   - Choose a genre
   - **IMPORTANT:** Write a detailed Story Bible:
     ```
     Example Story Bible:

     SETTING: Medieval fantasy kingdom called Eldoria

     MAIN CHARACTERS:
     - Princess Elena: 18 years old, red hair, green eyes, brave but inexperienced
     - Sir Marcus: 35, her royal guard, graying hair, scar on left cheek
     - Lord Malric: The villain, black robes, power-hungry sorcerer

     PLOT: Elena must reclaim her throne from Malric who usurped it

     MAGIC SYSTEM: Only those with royal blood can use magic. It drains their energy.

     RULES:
     - Writing style: Dramatic, literary fiction with vivid descriptions
     - Tone: Serious with moments of hope
     - Each chapter should be around 5,000 words
     - No modern technology or language

     KEY PLOT POINTS:
     1. Elena discovers her magical powers
     2. She meets the resistance
     3. She learns Malric is her uncle
     4. Final confrontation at the palace
     ```

3. **Generate Your First Chapter**
   - Click on your project
   - Click "Generate Chapter 1"
   - Wait 2-3 minutes
   - The AI will:
     - Create a detailed brief (outline)
     - Write the full chapter
     - Check continuity automatically
     - Extract characters and timeline

4. **Review and Edit**
   - Click on the chapter to read it
   - Edit any parts you want to change
   - The system saves automatically

5. **Generate More Chapters**
   - Generate chapters one at a time, OR
   - Use "Batch Generate" to queue up chapters 1-10
   - Each chapter takes 2-3 minutes

6. **Check Continuity**
   - The system automatically checks after each chapter
   - Look for the continuity score (0-100)
   - 90+ = Perfect continuity
   - 75-89 = Minor issues
   - Below 75 = Review the flagged issues

---

## 🎨 Customizing AI Model

By default, the system uses `claude-sonnet-4-20250514` (best balance of quality and cost).

To change the model, edit your `.env` file:

```bash
# For faster/cheaper (less detailed):
DEFAULT_MODEL=claude-sonnet-4-20250514

# For highest quality (more expensive):
DEFAULT_MODEL=claude-opus-4-20250514

# For budget mode:
DEFAULT_MODEL=claude-haiku-4-20250514
```

Restart after changing: `docker-compose restart server`

---

## 📊 Understanding Continuity Scores

The system checks 5 types of continuity:

1. **Character Continuity** ✓
   - Physical descriptions match
   - Characters remember previous events
   - Personality stays consistent
   - Character knowledge is realistic

2. **Plot Continuity** ✓
   - Events happen in logical order
   - No plot holes
   - Consequences are acknowledged

3. **Location Continuity** ✓
   - Places described consistently
   - Travel distances are realistic

4. **Timeline Continuity** ✓
   - Time passes logically
   - No temporal impossibilities

5. **Story Bible Compliance** ✓
   - Follows your world-building rules
   - Respects tone and style guidelines

**Overall Score:**
- 90-100: Perfect - ready to publish
- 75-89: Good - minor tweaks needed
- 60-74: Review - some noticeable issues
- Below 60: Needs revision

---

## 🛠️ Common Issues & Solutions

### "Cannot connect to server"
**Solution:** Make sure Docker is running and all containers are started:
```bash
docker-compose ps
# All should show "Up"

# If any are stopped:
docker-compose up -d
```

### "Invalid API key"
**Solution:** Check your `.env` file:
- Make sure there are no spaces around the `=`
- Make sure the key starts with `sk-ant-`
- Restart: `docker-compose restart server`

### "Port 3000 already in use"
**Solution:** Another program is using that port:
```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID <number> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### "Out of memory" error
**Solution:** Increase Docker's memory:
- Open Docker Desktop
- Go to Settings → Resources
- Increase Memory to at least 4GB
- Click "Apply & Restart"

### Chapter generation is slow
**This is normal!** Each chapter takes 2-3 minutes:
- Brief generation: 30 seconds
- Chapter writing: 1-2 minutes
- Continuity check: 30 seconds
- Character extraction: 15 seconds

You can queue multiple chapters to generate in parallel.

---

## 🔄 Daily Usage

### Starting the System:
```bash
cd AIBookWriter
docker-compose up -d
```

### Stopping the System:
```bash
docker-compose down
```

### Viewing Logs (if something goes wrong):
```bash
docker-compose logs -f
```

### Updating the System (when new versions release):
```bash
git pull  # or download new ZIP
docker-compose down
docker-compose build
docker-compose up -d
```

---

## 💾 Backup Your Data

Your books are stored in a Docker volume. To backup:

```bash
# Backup database
docker exec aibooks-postgres pg_dump -U aibooks_user aibooks > backup.sql

# To restore later:
docker exec -i aibooks-postgres psql -U aibooks_user aibooks < backup.sql
```

**Pro tip:** Also export your finished books as DOCX regularly!

---

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs:**
   ```bash
   docker-compose logs server
   ```

2. **Restart everything:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

3. **Full reset (WARNING: Deletes all data!):**
   ```bash
   docker-compose down -v
   docker-compose up -d
   docker exec aibooks-server npx prisma migrate deploy
   ```

---

## 🎓 Best Practices for Great Results

### 1. Write a Detailed Story Bible
The more detail you provide, the better the continuity:
- Character physical descriptions
- World-building rules (magic, technology, society)
- Plot outline (main story arc)
- Tone and style preferences
- Any constraints or requirements

### 2. Generate in Order
Generate chapters sequentially (1, 2, 3...) for best continuity.

### 3. Review and Edit
The AI is excellent but not perfect. Always review:
- Read each chapter
- Check the continuity report
- Edit as needed before generating the next

### 4. Use Batch Generation Wisely
You can queue up 5-10 chapters at once, but:
- Check the first few before generating all
- Make sure the story is going where you want

### 5. Save Your Story Bible
Keep your story bible document separately as a backup.

---

## 📈 Estimating Costs

**Anthropic Claude API costs** (as of 2024):

**Per 1,000 words generated:**
- Claude Sonnet: ~$0.50-1.00
- Claude Opus: ~$2.00-3.00
- Claude Haiku: ~$0.10-0.20

**For a full novel (130,000 words / 26 chapters):**
- Claude Sonnet: ~$65-130
- Claude Opus: ~$260-390
- Claude Haiku: ~$13-26

**Recommended:** Use Sonnet for best quality/cost balance.

---

## 🎉 You're Ready!

You now have a professional-grade AI book writing system with:
- ✓ 6 Specialized AI agents
- ✓ Automatic continuity checking
- ✓ Character and timeline tracking
- ✓ Plot point management
- ✓ Location consistency
- ✓ Story bible enforcement
- ✓ Version control for chapters
- ✓ Professional export (DOCX/PDF/EPUB)

**Start writing your masterpiece!**

---

## 📝 Quick Reference Commands

```bash
# Start system
docker-compose up -d

# Stop system
docker-compose down

# View logs
docker-compose logs -f server

# Access database
docker exec -it aibooks-postgres psql -U aibooks_user aibooks

# Restart after config changes
docker-compose restart

# Check system status
docker-compose ps

# Update database schema
docker exec aibooks-server npx prisma migrate deploy

# View server logs specifically
docker logs aibooks-server -f
```

---

**Happy Writing! 📚✨**

For questions or issues, check the logs first, then refer to the Common Issues section above.

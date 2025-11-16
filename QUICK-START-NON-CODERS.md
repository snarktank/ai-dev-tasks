# 🚀 Quick Start for Non-Coders

**You don't need to know how to code!** Just follow these simple steps.

---

## ✅ Step 1: Install Docker Desktop

**This is the ONLY thing you need to install manually.**

### For Windows:
1. Go to: https://www.docker.com/products/docker-desktop/
2. Click "Download for Windows"
3. Run the installer (double-click the downloaded file)
4. Follow the installation wizard (just click "Next" and "OK")
5. Start Docker Desktop (it will appear in your system tray)
6. Wait for it to say "Docker is running"

### For Mac:
1. Go to: https://www.docker.com/products/docker-desktop/
2. Click "Download for Mac" (choose Intel or Apple chip)
3. Open the downloaded .dmg file
4. Drag Docker to your Applications folder
5. Open Docker from Applications
6. Wait for it to say "Docker is running"

**That's it!** Docker will handle everything else automatically.

---

## ✅ Step 2: Get the Code

### Option A: Download as ZIP (Easier)
1. Go to: https://github.com/JamesHD2023/ai-dev-tasks--new
2. Click the green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file to your Desktop or Documents folder
5. Remember where you extracted it!

### Option B: Use Git (if you have it)
Open Terminal (Mac) or Command Prompt (Windows) and type:
```bash
git clone https://github.com/JamesHD2023/ai-dev-tasks--new.git
cd ai-dev-tasks--new
```

---

## ✅ Step 3: Run the Easy Setup Script

**This is the magic step that does everything for you!**

### For Windows:

1. Open the folder where you extracted the files
2. Find the file called: **`setup.bat`**
3. **Double-click it**
4. Answer the simple questions
5. Done!

### For Mac/Linux:

1. Open Terminal
2. Type: `cd ` (with a space after cd)
3. Drag the project folder into the Terminal window
4. Press Enter
5. Type: `chmod +x setup.sh`
6. Press Enter
7. Type: `./setup.sh`
8. Answer the simple questions
9. Done!

---

## 📝 What the Setup Script Asks You

### Question 1: Which AI do you want to use?

**For testing/learning (FREE):**
- Choose **Option 1: Kimi** - Get 3 million tokens FREE per day!

**For best quality:**
- Choose **Option 2: Claude** - Best for creative writing

**For budget:**
- Choose **Option 4: Gemini** - Cheapest paid option

**For completely FREE forever:**
- Choose **Option 6: Local LLM** - Runs on your computer (needs 16GB RAM)

### Question 2: API Key

**If you chose Kimi (Option 1) - RECOMMENDED FOR TESTING:**

1. The script will show you: https://platform.moonshot.ai/
2. Click that link in your browser
3. Sign up (it's FREE!)
4. Go to "API Keys" section
5. Click "Create API Key"
6. Copy the key (it looks like: `sk-xxxxxxxxxxxxxxxx`)
7. Paste it into the Terminal/Command Prompt
8. Press Enter

**Other providers work the same way** - just visit their website, get a key, paste it.

**If you chose Local LLM (Option 6):**

First install Ollama:
1. Visit: https://ollama.com/download
2. Download and install for your system
3. Open Terminal/Command Prompt
4. Type: `ollama pull llama3.1:8b`
5. Wait for download (about 5GB)
6. Then run the setup script

### Question 3: Start now?

Type **`y`** and press Enter.

The script will:
- ✅ Create your configuration automatically
- ✅ Download and set up the database
- ✅ Start all services
- ✅ Open the app for you!

**Wait 30-60 seconds** for everything to start.

---

## 🎉 Step 4: Open the App

After setup completes, open your web browser and go to:

**http://localhost:3001**

You should see the AI Book Writer!

---

## 📚 Now What?

### 1. Create Your Account
- Click "Sign Up"
- Enter an email and password
- Click "Create Account"

### 2. Create a Book Project
- Click "New Project"
- Enter your book title (e.g., "My First Novel")
- Add a story bible (optional but recommended):
  ```
  Genre: Fantasy
  Setting: Medieval kingdom with magic
  Main Character: Sarah, a young wizard
  Plot: Sarah must save the kingdom from darkness
  ```
- Click "Save"

### 3. Generate Your First Chapter
- Click "Generate Chapter"
- The AI will:
  1. Create a chapter brief (outline)
  2. Write the full chapter
  3. Check for continuity errors
- Watch the progress in real-time!

### 4. Review and Edit
- Read the generated chapter
- Edit if needed
- Click "Save Changes"

### 5. Generate More Chapters
- Click "Generate Chapter" again
- The AI remembers previous chapters
- Maintains continuity automatically!

### 6. Export Your Book
- When ready, click "Export"
- Choose format: PDF, Word (DOCX), EPUB, or TXT
- Download your book!

---

## 🔧 Common Commands

**To stop the app:**
```bash
docker-compose down
```

**To start it again:**
```bash
docker-compose up -d
```

**To see if it's running:**
```bash
docker-compose ps
```
(All should say "Up")

**To reset everything (start fresh):**
```bash
docker-compose down -v
docker-compose up -d
```
⚠️ This deletes all your books! Export first!

---

## 🆘 Troubleshooting

### "Port already in use" error

Another program is using port 3001. Try:
1. Close other web servers
2. Or edit `docker-compose.yml` and change `3001:3001` to `3002:3001`

### "Cannot connect to Docker daemon"

Docker Desktop isn't running. Start it from your Applications or Start Menu.

### "Connection refused" when opening http://localhost:3001

Wait 30 more seconds. Services take time to start. Then try again.

### AI isn't generating chapters

Check your API key is correct in the `.env` file. Look for the line with your provider's API key.

---

## 💰 Costs

### FREE Options:
- **Kimi:** 3 million tokens/day FREE (perfect for testing!)
- **Local LLM:** 100% FREE forever (uses your computer)

### Paid Options (for a full 130,000 word novel):
- **Kimi (paid):** ~$18-30
- **Gemini:** ~$50-90
- **Claude:** ~$65-130
- **GPT-4:** ~$80-130
- **Genspark:** ~$80-130

**Pro tip:** Start with Kimi's FREE tier to test everything, then switch to a paid option when you're ready to write your real book!

---

## 📖 Need More Help?

Read these guides:
- **USER-GUIDE.md** - Complete user manual (400+ lines)
- **AI-PROVIDER-GUIDE.md** - Compare all AI providers
- **LOCAL-LLM-GUIDE.md** - How to use 100% FREE local AI

---

## 🎯 Summary for the Truly Impatient

1. Install Docker Desktop
2. Download this project
3. Double-click **`setup.bat`** (Windows) or run **`./setup.sh`** (Mac)
4. Choose "1" for Kimi FREE tier
5. Get API key from https://platform.moonshot.ai/
6. Paste it, press Enter
7. Type "y" to start
8. Wait 60 seconds
9. Open http://localhost:3001
10. Start writing your book! 📚✨

**That's it!** No coding required.

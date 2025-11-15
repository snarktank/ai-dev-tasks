# 🤖 Multi-AI Provider Guide

Your AI Book Writer system supports **multiple AI providers**! Choose the AI that best fits your needs, budget, and preferences.

---

## 📋 Supported AI Providers

| Provider | Models | Best For | Cost Range |
|----------|--------|----------|------------|
| **Anthropic Claude** | Opus, Sonnet, Haiku | Literary quality, nuance | $0.25-$75 per 1M tokens |
| **OpenAI GPT** | GPT-4, GPT-3.5 | Versatile, well-documented | $0.5-$60 per 1M tokens |
| **Google Gemini** | Gemini 1.5 Pro/Flash | Fast, cost-effective | $0.35-$10.5 per 1M tokens |

---

## 🚀 Quick Setup

### Step 1: Choose Your AI Provider

Copy the multi-AI configuration template:

```bash
cp .env.multi-ai-example .env
```

### Step 2: Get Your API Keys

#### For Anthropic Claude:
1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Go to "API Keys" → "Create Key"
4. Copy the key (starts with `sk-ant-`)

#### For OpenAI GPT:
1. Visit https://platform.openai.com/
2. Sign up or log in
3. Go to "API Keys" → "Create new secret key"
4. Copy the key (starts with `sk-`)

#### For Google Gemini:
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

### Step 3: Configure Your .env File

Edit `.env` and set your provider and API key:

```bash
# Choose your provider
AI_PROVIDER=anthropic
# or: AI_PROVIDER=openai
# or: AI_PROVIDER=google

# Add your API key
ANTHROPIC_API_KEY=sk-ant-your-key-here
# or: OPENAI_API_KEY=sk-your-key-here
# or: GOOGLE_API_KEY=your-key-here

# Optional: Specify model
DEFAULT_MODEL=claude-sonnet-4-20250514
```

### Step 4: Restart the System

```bash
docker-compose restart server
```

**Done!** Your system now uses your chosen AI provider.

---

## 📊 Provider Comparison

### Anthropic Claude

**Strengths:**
- ✅ Excellent literary quality and nuance
- ✅ Best for creative fiction writing
- ✅ Strong adherence to complex instructions
- ✅ Very good at continuity tracking
- ✅ Large context window (200K tokens)

**Models:**
- **Claude Opus 4** - Highest quality, most creative
  - Best for: Literary fiction, complex plots
  - Cost: ~$15-75 per 1M tokens
  - Speed: Slower

- **Claude Sonnet 4** (Recommended)
  - Best for: Most use cases, best balance
  - Cost: ~$3-15 per 1M tokens
  - Speed: Fast

- **Claude Haiku 4** - Fastest, cheapest
  - Best for: Drafts, simple stories
  - Cost: ~$0.25-1.25 per 1M tokens
  - Speed: Very fast

**Cost for Full Novel (130K words):**
- Opus: ~$200-300
- Sonnet: ~$65-130 ✅ (Recommended)
- Haiku: ~$13-26

**Configuration:**
```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key
DEFAULT_MODEL=claude-sonnet-4-20250514
```

---

### OpenAI GPT

**Strengths:**
- ✅ Well-established, reliable
- ✅ Good documentation and community
- ✅ Versatile across many writing styles
- ✅ Fast response times
- ✅ Good balance of quality and cost

**Models:**
- **GPT-4 Turbo** - Best quality
  - Best for: High-quality fiction
  - Cost: ~$10-30 per 1M tokens
  - Speed: Fast

- **GPT-4** - Standard
  - Best for: Quality fiction
  - Cost: ~$30-60 per 1M tokens
  - Speed: Moderate

- **GPT-3.5 Turbo** - Budget option
  - Best for: Drafts, simple content
  - Cost: ~$0.5-1.5 per 1M tokens
  - Speed: Very fast

**Cost for Full Novel (130K words):**
- GPT-4 Turbo: ~$80-130 ✅ (Recommended)
- GPT-4: ~$150-250
- GPT-3.5: ~$15-30

**Configuration:**
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key
DEFAULT_MODEL=gpt-4-turbo-preview
```

---

### Google Gemini

**Strengths:**
- ✅ Very cost-effective
- ✅ Fast generation speeds
- ✅ Large context window (1M tokens)
- ✅ Good for high-volume projects
- ✅ Strong multilingual support

**Models:**
- **Gemini 1.5 Pro** - Best quality
  - Best for: Quality fiction, good balance
  - Cost: ~$3.5-10.5 per 1M tokens
  - Speed: Fast

- **Gemini 1.5 Flash** - Ultra-fast
  - Best for: Rapid drafting
  - Cost: ~$0.35-1.05 per 1M tokens
  - Speed: Very fast

- **Gemini Pro** - Standard
  - Best for: Budget projects
  - Cost: ~$0.5-1.5 per 1M tokens
  - Speed: Fast

**Cost for Full Novel (130K words):**
- Gemini 1.5 Pro: ~$50-90 ✅ (Recommended)
- Gemini 1.5 Flash: ~$8-15
- Gemini Pro: ~$15-30

**Configuration:**
```bash
AI_PROVIDER=google
GOOGLE_API_KEY=your-google-key
DEFAULT_MODEL=gemini-1.5-pro
```

---

## 🎯 Which AI Should You Choose?

### For Literary Fiction (Quality First):
**→ Anthropic Claude Sonnet 4**
- Best prose quality
- Excellent character development
- Superior continuity tracking
- Worth the cost for publishable work

### For Commercial Fiction (Balance):
**→ OpenAI GPT-4 Turbo**
- Great quality at reasonable cost
- Reliable and consistent
- Good for genre fiction

### For High-Volume / Budget Projects:
**→ Google Gemini 1.5 Pro**
- Excellent value for money
- Fast generation
- Good quality for the price
- Perfect for multiple books

### For Rapid Drafting:
**→ Google Gemini Flash** or **Claude Haiku**
- Lightning fast
- Very affordable
- Get first draft done quickly
- Edit with higher-tier model later

---

## 💡 Pro Tips

### Mix and Match Strategy

Use different models for different tasks:

1. **Chapter Briefs** → Cheaper model (Haiku, GPT-3.5, Gemini Flash)
2. **Chapter Writing** → Premium model (Claude Sonnet, GPT-4, Gemini Pro)
3. **Continuity Checks** → Mid-tier model (Claude Sonnet, Gemini Pro)

**To implement this, edit QueueService.ts** to use different providers per task.

### Cost Optimization

**Strategy 1: Draft → Polish**
1. Generate full novel with Gemini Flash ($10-15)
2. Edit and polish manually
3. Regenerate weak chapters with Claude Sonnet ($5-10)
4. **Total: ~$20 instead of $130**

**Strategy 2: Hybrid Approach**
1. Use Claude Sonnet for first 3 chapters (establish tone)
2. Switch to GPT-4 Turbo for middle chapters
3. Use Claude Sonnet for climax and ending
4. **Total: ~$80 instead of $130**

### Testing Models

Try each model with your first chapter:

```bash
# Generate Chapter 1 with Claude
AI_PROVIDER=anthropic docker-compose restart server
# Review output

# Generate Chapter 1 with GPT-4
AI_PROVIDER=openai docker-compose restart server
# Review output

# Generate Chapter 1 with Gemini
AI_PROVIDER=google docker-compose restart server
# Review output

# Choose the best!
```

---

## 🔧 Advanced Configuration

### Per-User Provider Selection

Want users to choose their own AI? Edit `server/src/config/database.ts`:

```typescript
// Add to UserSettings model
aiProvider: String @default("anthropic")
aiApiKey: String? // Encrypted
aiModel: String?
```

Then users can configure their preferred AI in settings!

### Multiple API Keys

Have credits with multiple providers? Configure all in `.env`:

```bash
AI_PROVIDER=anthropic  # Default

# All keys configured
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx
GOOGLE_API_KEY=xxxxx
```

Then switch by changing `AI_PROVIDER` without reconfiguring keys.

### Per-Project AI Selection

Different books use different AIs:

1. Store `aiProvider` in Project model
2. Pass provider to AgentService:
   ```typescript
   new AgentService(apiKey, project.aiProvider)
   ```
3. Each project can use optimal AI!

---

## 📈 Cost Estimator

### Full Novel (130,000 words ≈ 26 chapters ≈ 200K tokens output)

| Provider & Model | Input Tokens | Output Tokens | Total Cost |
|------------------|--------------|---------------|------------|
| Claude Opus 4 | 150K | 200K | **~$260** |
| Claude Sonnet 4 | 150K | 200K | **~$95** ✅ |
| Claude Haiku 4 | 150K | 200K | **~$13** |
| GPT-4 Turbo | 150K | 200K | **~$105** |
| GPT-4 | 150K | 200K | **~$210** |
| GPT-3.5 Turbo | 150K | 200K | **~$18** |
| Gemini 1.5 Pro | 150K | 200K | **~$70** ✅ |
| Gemini Flash | 150K | 200K | **~$7** |

**Most Recommended:**
- **Best Quality:** Claude Sonnet 4 (~$95)
- **Best Value:** Gemini 1.5 Pro (~$70)
- **Budget Option:** Gemini Flash (~$7)

---

## 🆘 Troubleshooting

### "Invalid API key" Error

**For Anthropic:**
```bash
# Key should start with: sk-ant-api03-
# Check at: https://console.anthropic.com/settings/keys
```

**For OpenAI:**
```bash
# Key should start with: sk-
# Check at: https://platform.openai.com/api-keys
```

**For Google:**
```bash
# Check at: https://makersuite.google.com/app/apikey
# Make sure Gemini API is enabled
```

### Provider Not Responding

Check your `.env`:
```bash
# Make sure provider name is lowercase
AI_PROVIDER=anthropic  # ✅ Correct
AI_PROVIDER=Anthropic  # ❌ Wrong
```

### Rate Limit Errors

Each provider has different rate limits:

**Anthropic:**
- Free tier: Very limited
- Paid: Higher limits

**OpenAI:**
- Tier 1: $100/month, 10K requests/min
- Scale as you use more

**Google:**
- Free tier: 60 requests/minute
- Paid: Much higher

**Solution:** Reduce `QUEUE_CONCURRENCY_CHAPTER` in `.env`:
```bash
QUEUE_CONCURRENCY_CHAPTER=1  # Generate 1 at a time
```

---

## 🎓 Model Selection Guide

### For Your Genre:

**Literary Fiction:** Claude Opus/Sonnet
**Thriller/Mystery:** Claude Sonnet or GPT-4 Turbo
**Romance:** Claude Sonnet or GPT-4
**Sci-Fi/Fantasy:** Claude Sonnet or Gemini Pro
**Young Adult:** GPT-4 Turbo or Gemini Pro
**Children's Books:** GPT-3.5 or Gemini Flash

### For Your Budget:

**$200+ per book:** Claude Opus (ultimate quality)
**$100-200:** Claude Sonnet, GPT-4 Turbo (excellent quality)
**$50-100:** Gemini 1.5 Pro, Claude Sonnet (great value)
**Under $50:** Gemini Flash, Claude Haiku (budget-friendly)

### For Your Timeline:

**Need it NOW:** Gemini Flash (lightning fast)
**1-2 weeks:** Any provider works
**Quality over speed:** Claude Opus (take your time)

---

## 📚 Example Configurations

### Configuration 1: Premium Quality
```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-xxxxx
DEFAULT_MODEL=claude-sonnet-4-20250514
AI_TEMPERATURE=0.7
```
**Best for:** Literary fiction, publishable work
**Cost:** ~$95 per novel

### Configuration 2: Best Value
```bash
AI_PROVIDER=google
GOOGLE_API_KEY=xxxxx
DEFAULT_MODEL=gemini-1.5-pro
AI_TEMPERATURE=0.8
```
**Best for:** Commercial fiction, multiple books
**Cost:** ~$70 per novel

### Configuration 3: Rapid Drafting
```bash
AI_PROVIDER=google
GOOGLE_API_KEY=xxxxx
DEFAULT_MODEL=gemini-1.5-flash
AI_TEMPERATURE=0.9
```
**Best for:** First drafts, high volume
**Cost:** ~$7 per novel

### Configuration 4: Hybrid (Manual switching)
```bash
# Week 1: Premium for first 5 chapters
AI_PROVIDER=anthropic
DEFAULT_MODEL=claude-sonnet-4-20250514

# Week 2: Budget for middle chapters
AI_PROVIDER=google
DEFAULT_MODEL=gemini-1.5-pro

# Week 3: Premium for ending
AI_PROVIDER=anthropic
DEFAULT_MODEL=claude-sonnet-4-20250514
```
**Best for:** Optimizing quality and cost
**Cost:** ~$60 per novel

---

## ✅ Recommended Setup

For most users, we recommend:

```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-key-here
DEFAULT_MODEL=claude-sonnet-4-20250514
AI_TEMPERATURE=0.7
```

**Why?**
- Best balance of quality and cost
- Excellent continuity tracking
- Great for all fiction genres
- Reliable and consistent

**Alternative (More Budget-Friendly):**
```bash
AI_PROVIDER=google
GOOGLE_API_KEY=your-key-here
DEFAULT_MODEL=gemini-1.5-pro
AI_TEMPERATURE=0.8
```

**Why?**
- 30% cheaper than Claude
- Fast generation
- Still excellent quality
- Great for commercial fiction

---

## 🔄 Switching Providers

You can switch providers anytime:

1. Edit `.env` file
2. Change `AI_PROVIDER=xxx`
3. Restart: `docker-compose restart server`
4. Continue with new AI!

**Your existing chapters aren't affected** - each chapter stores which AI generated it.

---

**Ready to write with your preferred AI?** Choose your provider, add your API key, and start creating! 📚✨

For more help, see:
- [Setup Instructions](SETUP-INSTRUCTIONS.md)
- [User Guide](USER-GUIDE.md)
- [Main README](README-AIBOOK.md)

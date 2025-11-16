# 🖥️ Local LLM Guide - Run AI Book Writer 100% Free & Private

**Use your AI Book Writer with locally installed LLMs - completely free, private, and unlimited!**

---

## 🎯 Why Use Local LLMs?

### **Advantages:**
- ✅ **100% FREE** - No API costs, unlimited generation
- ✅ **Complete Privacy** - Your stories never leave your computer
- ✅ **No Rate Limits** - Generate as much as you want
- ✅ **Works Offline** - No internet required after setup
- ✅ **Open Source Models** - Full control and transparency
- ✅ **Great for Testing** - Experiment without costs

### **Trade-offs:**
- ⚠️ Requires powerful computer (16GB+ RAM recommended)
- ⚠️ Slower than cloud APIs (depends on your hardware)
- ⚠️ Quality varies by model (best local models approaching GPT-4 quality)
- ⚠️ Initial setup required

---

## 📋 Supported Local LLM Solutions

| Solution | Best For | Difficulty | GPU Support |
|----------|----------|------------|-------------|
| **Ollama** | Easiest, most popular | ⭐ Easy | Yes |
| **LM Studio** | GUI interface | ⭐ Easy | Yes |
| **LocalAI** | Self-hosted server | ⭐⭐ Medium | Yes |
| **Text Gen WebUI** | Advanced users | ⭐⭐⭐ Hard | Yes |

---

## 🚀 Quick Start: Ollama (Recommended)

**Ollama is the easiest way to run local LLMs.**

### Step 1: Install Ollama

**macOS/Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from: https://ollama.com/download

### Step 2: Download a Model

```bash
# Recommended: Llama 3.1 70B (best quality, requires 40GB RAM)
ollama pull llama3.1:70b

# Alternative: Llama 3.1 8B (fast, requires 8GB RAM)
ollama pull llama3.1:8b

# Or: Mistral (excellent quality, requires 16GB RAM)
ollama pull mistral:latest

# Budget: Gemma 2 9B (good quality, requires 12GB RAM)
ollama pull gemma2:9b
```

**Available models:** https://ollama.com/library

### Step 3: Verify Ollama is Running

```bash
# Check if Ollama is running
ollama list

# Test generation
ollama run llama3.1:8b "Write a short story opening"
```

### Step 4: Configure AI Book Writer

Edit `.env`:
```bash
# Use local LLM
AI_PROVIDER=local

# Ollama configuration
LOCAL_LLM_URL=http://localhost:11434
LOCAL_LLM_PROVIDER=ollama

# Choose your model
DEFAULT_MODEL=llama3.1:70b
# or: DEFAULT_MODEL=llama3.1:8b
# or: DEFAULT_MODEL=mistral:latest
```

### Step 5: Restart & Write!

```bash
docker-compose restart server
```

**Done!** Open http://localhost:3001 and start writing for **FREE!** 🎉

---

## 💻 System Requirements

### **Minimum (Budget Models):**
- CPU: 4 cores
- RAM: 8GB
- Storage: 10GB free
- **Models:** llama3.1:8b, gemma2:9b

### **Recommended (Quality Models):**
- CPU: 8 cores
- RAM: 16GB
- Storage: 50GB free
- GPU: 8GB+ VRAM (optional but faster)
- **Models:** mistral:latest, llama3:13b

### **Optimal (Best Quality):**
- CPU: 12+ cores
- RAM: 32GB+
- Storage: 100GB+ free
- GPU: 16GB+ VRAM
- **Models:** llama3.1:70b, mixtral:8x7b

---

## 🎨 Recommended Models for Book Writing

### **For Literary Fiction (Best Quality):**

**Llama 3.1 70B** (Recommended)
```bash
ollama pull llama3.1:70b
# Requirements: 40GB RAM
# Quality: ⭐⭐⭐⭐⭐ (Comparable to GPT-4)
# Speed: Slow (1-2 min per chapter)
# Best for: Final drafts, publishable quality
```

**Mixtral 8x22B**
```bash
ollama pull mixtral:8x22b
# Requirements: 80GB RAM
# Quality: ⭐⭐⭐⭐⭐ (Excellent)
# Speed: Slow
# Best for: Highest quality local generation
```

### **For Commercial Fiction (Good Balance):**

**Mistral Latest**
```bash
ollama pull mistral:latest
# Requirements: 16GB RAM
# Quality: ⭐⭐⭐⭐ (Very good)
# Speed: Medium (30-60s per chapter)
# Best for: Genre fiction, daily writing
```

**Llama 3.1 8B**
```bash
ollama pull llama3.1:8b
# Requirements: 8GB RAM
# Quality: ⭐⭐⭐⭐ (Good)
# Speed: Fast (20-30s per chapter)
# Best for: Rapid drafting, practice
```

### **For Rapid Drafting (Speed):**

**Gemma 2 9B**
```bash
ollama pull gemma2:9b
# Requirements: 12GB RAM
# Quality: ⭐⭐⭐ (Decent)
# Speed: Very fast (10-20s per chapter)
# Best for: Quick drafts, outlines
```

**Qwen 2.5 7B**
```bash
ollama pull qwen2.5:7b
# Requirements: 8GB RAM
# Quality: ⭐⭐⭐ (Good for size)
# Speed: Very fast
# Best for: Budget hardware
```

---

## 🖥️ Alternative: LM Studio

**LM Studio provides a beautiful GUI for running local LLMs.**

### Setup:

1. **Download LM Studio:**
   - Visit: https://lmstudio.ai/
   - Download for your OS (Mac, Windows, Linux)
   - Install and open

2. **Download a Model:**
   - Click "Search" tab
   - Search for: "Llama-3.1-70B-Instruct"
   - Click Download
   - Wait for download to complete

3. **Start Local Server:**
   - Click "Local Server" tab
   - Select your model
   - Click "Start Server"
   - Note the port (default: 1234)

4. **Configure AI Book Writer:**
   ```bash
   AI_PROVIDER=local
   LOCAL_LLM_URL=http://localhost:1234
   LOCAL_LLM_PROVIDER=lmstudio
   DEFAULT_MODEL=local-model
   ```

5. **Restart:**
   ```bash
   docker-compose restart server
   ```

**Benefits of LM Studio:**
- Beautiful GUI
- Easy model management
- GPU acceleration built-in
- Chat interface for testing
- Model performance monitoring

---

## 🔧 Alternative: LocalAI

**LocalAI is a self-hosted OpenAI-compatible server.**

### Docker Setup:

```bash
# Create docker-compose.localai.yml
version: '3.8'
services:
  localai:
    image: quay.io/go-skynet/local-ai:latest
    ports:
      - "8080:8080"
    environment:
      - THREADS=4
    volumes:
      - ./models:/models
```

```bash
# Start LocalAI
docker-compose -f docker-compose.localai.yml up -d

# Download a model
docker exec -it localai sh
cd /models
wget https://huggingface.co/TheBloke/Llama-2-70B-GGUF/resolve/main/llama-2-70b.Q4_K_M.gguf

# Configure AI Book Writer
AI_PROVIDER=local
LOCAL_LLM_URL=http://localhost:8080
LOCAL_LLM_PROVIDER=localai
DEFAULT_MODEL=llama3
```

---

## ⚙️ Advanced Configuration

### GPU Acceleration (NVIDIA)

**For Ollama:**
Ollama automatically uses GPU if available. Verify:
```bash
ollama run llama3.1:8b "test"
# Check terminal - should show GPU usage
```

**For LM Studio:**
- Settings → Hardware
- Enable "GPU Offload"
- Slide "GPU Layers" to max

### Multiple Models Strategy

Use different models for different tasks:

**Edit `QueueService.ts`:**
```typescript
// Brief generation (cheap/fast model)
const briefModel = 'gemma2:9b'

// Chapter writing (quality model)
const chapterModel = 'llama3.1:70b'

// Continuity check (medium model)
const continuityModel = 'mistral:latest'
```

### Performance Tuning

**In `.env`:**
```bash
# Reduce token output for faster generation
MAX_TOKENS_CHAPTER=8000  # Instead of 16000

# Lower temperature for more consistent output
AI_TEMPERATURE=0.5  # Instead of 0.7

# Increase concurrency if you have RAM
QUEUE_CONCURRENCY_CHAPTER=3  # Generate 3 at once
```

---

## 📊 Performance Comparison

### Generation Time (5,000 word chapter)

| Hardware | Model | Time | Quality |
|----------|-------|------|---------|
| M1 Mac | llama3.1:8b | 30s | ⭐⭐⭐⭐ |
| M1 Mac | llama3.1:70b | 3min | ⭐⭐⭐⭐⭐ |
| RTX 4090 | llama3.1:70b | 45s | ⭐⭐⭐⭐⭐ |
| RTX 3060 | mistral:latest | 1min | ⭐⭐⭐⭐ |
| CPU only | gemma2:9b | 2min | ⭐⭐⭐ |

### Quality Comparison (vs Cloud APIs)

| Model | vs GPT-4 | vs Claude Sonnet | Best For |
|-------|----------|------------------|----------|
| llama3.1:70b | 90% | 85% | Literary fiction |
| mixtral:8x22b | 92% | 87% | Complex plots |
| mistral:latest | 80% | 75% | Genre fiction |
| llama3.1:8b | 70% | 65% | Drafts |
| gemma2:9b | 65% | 60% | Practice |

---

## 💡 Tips for Best Results

### 1. Start with Smaller Model

Don't jump straight to 70B models:
```bash
# Week 1: Test with small model
ollama pull llama3.1:8b
# Generate a few chapters, see if quality is acceptable

# Week 2: If quality isn't enough, upgrade
ollama pull llama3.1:70b
# Compare results
```

### 2. Use GPU if Possible

**Check GPU availability:**
```bash
# NVIDIA
nvidia-smi

# AMD (on Linux)
rocm-smi

# Apple Silicon
# Ollama automatically uses Metal
```

### 3. Monitor Resource Usage

```bash
# Monitor while generating
htop  # or Activity Monitor on Mac

# If RAM is maxed out, use smaller model
# If CPU is bottleneck, consider GPU
```

### 4. Optimize Prompts for Local Models

Local models work better with:
- Shorter prompts (under 4K tokens)
- Clear, direct instructions
- Examples in the prompt
- Lower temperature (0.5-0.7)

### 5. Mix Local & Cloud

**Strategy:**
1. Generate all chapters locally (FREE)
2. Review and edit
3. Regenerate best 5-10 chapters with Claude ($20)
4. **Total cost: ~$20 instead of $95**

---

## 🆘 Troubleshooting

### "Cannot connect to Ollama"

**Check if Ollama is running:**
```bash
ollama list
# If error, start Ollama:
ollama serve
```

**Check URL:**
```bash
curl http://localhost:11434/api/tags
# Should return JSON with models
```

### "Out of Memory"

**Use smaller model:**
```bash
# Instead of:
ollama pull llama3.1:70b  # 40GB RAM

# Try:
ollama pull llama3.1:8b   # 8GB RAM
```

**Or increase Docker memory:**
- Docker Desktop → Settings → Resources
- Increase Memory to max available

### Generation is Very Slow

**Use GPU acceleration:**
```bash
# Check if GPU is being used
nvidia-smi  # Should show Ollama process

# If not, reinstall Ollama with GPU support
```

**Or use quantized model:**
```bash
# Q4 quantization (faster, slightly lower quality)
ollama pull llama3.1:70b-q4

# Q8 quantization (balance)
ollama pull llama3.1:70b-q8
```

### Low Quality Output

**Try better model:**
```bash
# If using gemma2:9b, upgrade to:
ollama pull mistral:latest

# If using mistral, upgrade to:
ollama pull llama3.1:70b
```

**Or adjust temperature:**
```bash
# In .env:
AI_TEMPERATURE=0.6  # More focused
# or
AI_TEMPERATURE=0.8  # More creative
```

---

## 📚 Model Recommendations by Genre

### **Literary Fiction:**
- **Best:** llama3.1:70b, mixtral:8x22b
- **Good:** mistral:latest, qwen2.5:72b
- **Budget:** llama3.1:8b

### **Genre Fiction (Thriller, Mystery, Romance):**
- **Best:** llama3.1:70b, mistral:latest
- **Good:** llama3.1:8b, gemma2:27b
- **Budget:** gemma2:9b

### **Fantasy/Sci-Fi:**
- **Best:** mixtral:8x22b, llama3.1:70b
- **Good:** mistral:latest, qwen2.5:72b
- **Budget:** llama3.1:8b

### **Young Adult:**
- **Best:** llama3.1:70b, mistral:latest
- **Good:** llama3.1:8b, gemma2:9b
- **Budget:** gemma2:9b

### **Non-Fiction:**
- **Best:** llama3.1:70b, qwen2.5:72b
- **Good:** mistral:latest, llama3.1:8b
- **Budget:** gemma2:9b

---

## 🔄 Switching Between Local and Cloud

You can easily switch between local and cloud:

### Use Local for Drafting:
```bash
AI_PROVIDER=local
DEFAULT_MODEL=llama3.1:8b
```
Generate all 26 chapters (FREE, ~2 hours)

### Switch to Cloud for Polish:
```bash
AI_PROVIDER=anthropic
DEFAULT_MODEL=claude-sonnet-4-20250514
```
Regenerate chapters 1, 13, and 24-26 (~$15)

**Total: $15 instead of $95** (84% savings!)

---

## 📈 Cost Analysis

### Traditional Cloud API (Claude Sonnet):
- **130,000 word novel:** ~$95
- **Trilogy (3 books):** ~$285

### Local LLM:
- **Initial Setup:** Free (or GPU: $300-1500)
- **Per Novel:** $0 (FREE!)
- **Unlimited novels:** $0

**Break-even point:**
- If you write 3+ novels: Local LLM pays for itself
- If you have existing GPU: Local is always cheaper
- If practicing/drafting: Local is no-brainer

---

## 🎓 Advanced: Running Your Own Model Server

For maximum control, run your own model server:

### Using VLLM (Production-grade):

```bash
# Install
pip install vllm

# Run server
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.1-70B-Instruct \
  --port 8000

# Configure AI Book Writer
AI_PROVIDER=local
LOCAL_LLM_URL=http://localhost:8000
LOCAL_LLM_PROVIDER=openai-compatible
```

### Using Text Generation WebUI:

```bash
# Clone
git clone https://github.com/oobabooga/text-generation-webui
cd text-generation-webui

# Install
./start_linux.sh  # or start_windows.bat

# Enable API in settings
# Download model via GUI

# Configure
AI_PROVIDER=local
LOCAL_LLM_URL=http://localhost:5000
LOCAL_LLM_PROVIDER=openai-compatible
```

---

## ✅ Recommended Setup

**For most users:**

```bash
# Install Ollama (easiest)
# Download llama3.1:8b for testing
# Upgrade to llama3.1:70b if quality needed

AI_PROVIDER=local
LOCAL_LLM_URL=http://localhost:11434
LOCAL_LLM_PROVIDER=ollama
DEFAULT_MODEL=llama3.1:8b
AI_TEMPERATURE=0.7
```

**For power users:**

```bash
# Use LM Studio for GPU acceleration
# Or Ollama with quantized 70B model

AI_PROVIDER=local
LOCAL_LLM_URL=http://localhost:11434
LOCAL_LLM_PROVIDER=ollama
DEFAULT_MODEL=llama3.1:70b
AI_TEMPERATURE=0.6
QUEUE_CONCURRENCY_CHAPTER=2
```

---

## 🎉 Summary

**Local LLMs give you:**
- ✅ **$0 cost** for unlimited writing
- ✅ **Complete privacy** - stories never leave your computer
- ✅ **No rate limits** - write as much as you want
- ✅ **Offline capability** - works without internet
- ✅ **Control** - choose models, tune parameters

**Best approach:**
1. Start with Ollama + llama3.1:8b (FREE, easy)
2. Test quality on first 3 chapters
3. Upgrade to llama3.1:70b if needed (still FREE!)
4. Optionally use cloud AI for final polish

**With local LLMs, you can write unlimited novels for FREE!** 📚✨

---

For more help:
- Ollama docs: https://ollama.com/
- LM Studio: https://lmstudio.ai/
- [AI Provider Guide](AI-PROVIDER-GUIDE.md)
- [User Guide](USER-GUIDE.md)

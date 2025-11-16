#!/bin/bash

# AI Book Writer - Easy Setup Script
# For non-coders - just answer the questions!

clear
echo "============================================="
echo "   📚 AI Book Writer - Easy Setup"
echo "============================================="
echo ""
echo "Welcome! I'll help you set up your AI Book Writer."
echo "Just answer a few simple questions."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo ""
    echo "Please start Docker Desktop first, then run this script again."
    echo ""
    exit 1
fi

echo "✅ Docker is running!"
echo ""

# Ask which AI provider to use
echo "Which AI provider do you want to use?"
echo ""
echo "1. Kimi (Moonshot AI) - 🆓 FREE tier available! (Recommended for testing)"
echo "   - 3 million tokens FREE per day"
echo "   - No credit card needed"
echo "   - Great for long documents"
echo ""
echo "2. Anthropic Claude - Best quality for creative writing"
echo "   - Cost: ~\$65-130 per full novel"
echo "   - Excellent literary quality"
echo ""
echo "3. OpenAI GPT - Reliable and versatile"
echo "   - Cost: ~\$80-130 per full novel"
echo "   - Well-documented"
echo ""
echo "4. Google Gemini - Fast and affordable"
echo "   - Cost: ~\$50-90 per full novel"
echo "   - Very cost-effective"
echo ""
echo "5. Genspark AI - Advanced AI with agent capabilities"
echo "   - Cost: ~\$80-130 per full novel"
echo "   - Cutting-edge GPT-4.1"
echo ""
echo "6. Local LLM (Ollama) - 🆓 100% FREE & Private"
echo "   - Runs on your computer"
echo "   - No API costs ever"
echo "   - Requires good computer (16GB+ RAM recommended)"
echo ""

read -p "Enter your choice (1-6): " provider_choice

case $provider_choice in
    1)
        PROVIDER="kimi"
        PROVIDER_NAME="Kimi (Moonshot AI)"
        API_KEY_URL="https://platform.moonshot.ai/"
        API_KEY_NAME="KIMI_API_KEY"
        DEFAULT_MODEL="moonshot-v1-128k"
        ;;
    2)
        PROVIDER="anthropic"
        PROVIDER_NAME="Anthropic Claude"
        API_KEY_URL="https://console.anthropic.com/settings/keys"
        API_KEY_NAME="ANTHROPIC_API_KEY"
        DEFAULT_MODEL="claude-sonnet-4-20250514"
        ;;
    3)
        PROVIDER="openai"
        PROVIDER_NAME="OpenAI GPT"
        API_KEY_URL="https://platform.openai.com/api-keys"
        API_KEY_NAME="OPENAI_API_KEY"
        DEFAULT_MODEL="gpt-4-turbo-preview"
        ;;
    4)
        PROVIDER="google"
        PROVIDER_NAME="Google Gemini"
        API_KEY_URL="https://makersuite.google.com/app/apikey"
        API_KEY_NAME="GOOGLE_API_KEY"
        DEFAULT_MODEL="gemini-1.5-pro"
        ;;
    5)
        PROVIDER="genspark"
        PROVIDER_NAME="Genspark AI"
        API_KEY_URL="https://www.genspark.ai/"
        API_KEY_NAME="GENSPARK_API_KEY"
        DEFAULT_MODEL="gpt-4.1"
        ;;
    6)
        PROVIDER="local"
        PROVIDER_NAME="Local LLM (Ollama)"
        DEFAULT_MODEL="llama3.1:8b"
        ;;
    *)
        echo "Invalid choice. Using Kimi FREE tier as default."
        PROVIDER="kimi"
        PROVIDER_NAME="Kimi (Moonshot AI)"
        API_KEY_URL="https://platform.moonshot.ai/"
        API_KEY_NAME="KIMI_API_KEY"
        DEFAULT_MODEL="moonshot-v1-128k"
        ;;
esac

echo ""
echo "✅ You selected: $PROVIDER_NAME"
echo ""

# Get API key (unless using local)
if [ "$PROVIDER" != "local" ]; then
    echo "To use $PROVIDER_NAME, you need an API key."
    echo ""
    echo "📝 How to get your API key:"
    echo "   1. Visit: $API_KEY_URL"
    echo "   2. Sign up or log in"
    echo "   3. Create a new API key"
    echo "   4. Copy it"
    echo ""
    read -p "Paste your API key here: " API_KEY

    if [ -z "$API_KEY" ]; then
        echo ""
        echo "❌ No API key provided. Setup cancelled."
        echo ""
        exit 1
    fi

    echo ""
    echo "✅ API key saved!"
else
    echo "Setting up Local LLM (Ollama)..."
    echo ""
    echo "📝 Make sure you have:"
    echo "   1. Installed Ollama from https://ollama.com/download"
    echo "   2. Pulled a model with: ollama pull llama3.1:8b"
    echo ""
    read -p "Have you done this? (y/n): " ollama_ready

    if [ "$ollama_ready" != "y" ]; then
        echo ""
        echo "Please install Ollama and pull a model first, then run this script again."
        echo ""
        exit 1
    fi

    API_KEY="not-needed"
fi

echo ""
echo "Creating your configuration file..."

# Create .env file
cat > .env << EOF
# AI PROVIDER CONFIGURATION
AI_PROVIDER=$PROVIDER
DEFAULT_MODEL=$DEFAULT_MODEL

# API KEYS
ANTHROPIC_API_KEY=${PROVIDER}=="anthropic" && echo "$API_KEY" || echo "your-anthropic-key-here"
OPENAI_API_KEY=${PROVIDER}=="openai" && echo "$API_KEY" || echo "your-openai-key-here"
GOOGLE_API_KEY=${PROVIDER}=="google" && echo "$API_KEY" || echo "your-google-key-here"
KIMI_API_KEY=${PROVIDER}=="kimi" && echo "$API_KEY" || echo "your-kimi-key-here"
GENSPARK_API_KEY=${PROVIDER}=="genspark" && echo "$API_KEY" || echo "your-genspark-key-here"

# KIMI CONFIGURATION
KIMI_BASE_URL=https://api.moonshot.ai/v1

# GENSPARK CONFIGURATION
GENSPARK_BASE_URL=https://api.genspark.ai/v1

# LOCAL LLM CONFIGURATION
LOCAL_LLM_URL=http://localhost:11434
LOCAL_LLM_PROVIDER=ollama

# AI GENERATION SETTINGS
MAX_TOKENS_BRIEF=4000
MAX_TOKENS_CHAPTER=16000
MAX_TOKENS_CONTINUITY=8000
AI_TEMPERATURE=0.7

# JWT SECRET (auto-generated)
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "$(date +%s)-$(uuidgen 2>/dev/null || echo $RANDOM$RANDOM$RANDOM)")

# DATABASE
DATABASE_URL=postgresql://aibooks_user:aibooks_password_change_in_production@postgres:5432/aibooks

# REDIS
REDIS_URL=redis://redis:6379

# APPLICATION
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:3001

# STORAGE
STORAGE_TYPE=local
STORAGE_PATH=./uploads

# QUEUE SETTINGS
QUEUE_CONCURRENCY_BRIEF=5
QUEUE_CONCURRENCY_CHAPTER=2
QUEUE_CONCURRENCY_CONTINUITY=3

# RATE LIMITING
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

# Fix the API key in .env file
if [ "$PROVIDER" == "anthropic" ]; then
    sed -i.bak "s/ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$API_KEY/" .env
elif [ "$PROVIDER" == "openai" ]; then
    sed -i.bak "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$API_KEY/" .env
elif [ "$PROVIDER" == "google" ]; then
    sed -i.bak "s/GOOGLE_API_KEY=.*/GOOGLE_API_KEY=$API_KEY/" .env
elif [ "$PROVIDER" == "kimi" ]; then
    sed -i.bak "s/KIMI_API_KEY=.*/KIMI_API_KEY=$API_KEY/" .env
elif [ "$PROVIDER" == "genspark" ]; then
    sed -i.bak "s/GENSPARK_API_KEY=.*/GENSPARK_API_KEY=$API_KEY/" .env
fi

rm -f .env.bak

echo "✅ Configuration file created!"
echo ""

# Ask if they want to start now
read -p "Do you want to start the AI Book Writer now? (y/n): " start_now

if [ "$start_now" == "y" ]; then
    echo ""
    echo "🚀 Starting AI Book Writer..."
    echo ""
    echo "This will take about 30-60 seconds..."
    echo "(Docker is downloading and setting up everything)"
    echo ""

    docker-compose up -d

    echo ""
    echo "⏳ Waiting for services to initialize..."
    sleep 30

    echo ""
    echo "============================================="
    echo "   🎉 Setup Complete!"
    echo "============================================="
    echo ""
    echo "✅ Your AI Book Writer is running!"
    echo ""
    echo "📱 Open in your browser:"
    echo "   http://localhost:3001"
    echo ""
    echo "🤖 AI Provider: $PROVIDER_NAME"
    echo "📊 Model: $DEFAULT_MODEL"
    echo ""
    echo "📚 What's next?"
    echo "   1. Create an account"
    echo "   2. Create a book project"
    echo "   3. Start writing!"
    echo ""
    echo "🛑 To stop: docker-compose down"
    echo "🔄 To restart: docker-compose up -d"
    echo "📖 For help: Read USER-GUIDE.md"
    echo ""
else
    echo ""
    echo "============================================="
    echo "   ✅ Configuration Complete!"
    echo "============================================="
    echo ""
    echo "When you're ready to start, run:"
    echo "   docker-compose up -d"
    echo ""
    echo "Then open: http://localhost:3001"
    echo ""
fi

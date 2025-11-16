@echo off
REM AI Book Writer - Easy Setup Script for Windows
REM For non-coders - just answer the questions!

cls
echo =============================================
echo    📚 AI Book Writer - Easy Setup
echo =============================================
echo.
echo Welcome! I'll help you set up your AI Book Writer.
echo Just answer a few simple questions.
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running!
    echo.
    echo Please start Docker Desktop first, then run this script again.
    echo.
    pause
    exit /b 1
)

echo ✅ Docker is running!
echo.

REM Ask which AI provider to use
echo Which AI provider do you want to use?
echo.
echo 1. Kimi (Moonshot AI) - 🆓 FREE tier available! (Recommended for testing^)
echo    - 3 million tokens FREE per day
echo    - No credit card needed
echo    - Great for long documents
echo.
echo 2. Anthropic Claude - Best quality for creative writing
echo    - Cost: ~$65-130 per full novel
echo    - Excellent literary quality
echo.
echo 3. OpenAI GPT - Reliable and versatile
echo    - Cost: ~$80-130 per full novel
echo    - Well-documented
echo.
echo 4. Google Gemini - Fast and affordable
echo    - Cost: ~$50-90 per full novel
echo    - Very cost-effective
echo.
echo 5. Genspark AI - Advanced AI with agent capabilities
echo    - Cost: ~$80-130 per full novel
echo    - Cutting-edge GPT-4.1
echo.
echo 6. Local LLM (Ollama^) - 🆓 100%% FREE ^& Private
echo    - Runs on your computer
echo    - No API costs ever
echo    - Requires good computer (16GB+ RAM recommended^)
echo.

set /p provider_choice="Enter your choice (1-6): "

if "%provider_choice%"=="1" (
    set PROVIDER=kimi
    set PROVIDER_NAME=Kimi (Moonshot AI^)
    set API_KEY_URL=https://platform.moonshot.ai/
    set DEFAULT_MODEL=moonshot-v1-128k
) else if "%provider_choice%"=="2" (
    set PROVIDER=anthropic
    set PROVIDER_NAME=Anthropic Claude
    set API_KEY_URL=https://console.anthropic.com/settings/keys
    set DEFAULT_MODEL=claude-sonnet-4-20250514
) else if "%provider_choice%"=="3" (
    set PROVIDER=openai
    set PROVIDER_NAME=OpenAI GPT
    set API_KEY_URL=https://platform.openai.com/api-keys
    set DEFAULT_MODEL=gpt-4-turbo-preview
) else if "%provider_choice%"=="4" (
    set PROVIDER=google
    set PROVIDER_NAME=Google Gemini
    set API_KEY_URL=https://makersuite.google.com/app/apikey
    set DEFAULT_MODEL=gemini-1.5-pro
) else if "%provider_choice%"=="5" (
    set PROVIDER=genspark
    set PROVIDER_NAME=Genspark AI
    set API_KEY_URL=https://www.genspark.ai/
    set DEFAULT_MODEL=gpt-4.1
) else if "%provider_choice%"=="6" (
    set PROVIDER=local
    set PROVIDER_NAME=Local LLM (Ollama^)
    set DEFAULT_MODEL=llama3.1:8b
) else (
    echo Invalid choice. Using Kimi FREE tier as default.
    set PROVIDER=kimi
    set PROVIDER_NAME=Kimi (Moonshot AI^)
    set API_KEY_URL=https://platform.moonshot.ai/
    set DEFAULT_MODEL=moonshot-v1-128k
)

echo.
echo ✅ You selected: %PROVIDER_NAME%
echo.

REM Get API key (unless using local)
if not "%PROVIDER%"=="local" (
    echo To use %PROVIDER_NAME%, you need an API key.
    echo.
    echo 📝 How to get your API key:
    echo    1. Visit: %API_KEY_URL%
    echo    2. Sign up or log in
    echo    3. Create a new API key
    echo    4. Copy it
    echo.
    set /p API_KEY="Paste your API key here: "

    if "!API_KEY!"=="" (
        echo.
        echo ❌ No API key provided. Setup cancelled.
        echo.
        pause
        exit /b 1
    )

    echo.
    echo ✅ API key saved!
) else (
    echo Setting up Local LLM (Ollama^)...
    echo.
    echo 📝 Make sure you have:
    echo    1. Installed Ollama from https://ollama.com/download
    echo    2. Pulled a model with: ollama pull llama3.1:8b
    echo.
    set /p ollama_ready="Have you done this? (y/n^): "

    if not "!ollama_ready!"=="y" (
        echo.
        echo Please install Ollama and pull a model first, then run this script again.
        echo.
        pause
        exit /b 1
    )

    set API_KEY=not-needed
)

echo.
echo Creating your configuration file...

REM Generate a random JWT secret
for /f %%i in ('powershell -Command "[guid]::NewGuid().ToString()"') do set JWT_SECRET=%%i

REM Create .env file
(
echo # AI PROVIDER CONFIGURATION
echo AI_PROVIDER=%PROVIDER%
echo DEFAULT_MODEL=%DEFAULT_MODEL%
echo.
echo # API KEYS
echo ANTHROPIC_API_KEY=your-anthropic-key-here
echo OPENAI_API_KEY=your-openai-key-here
echo GOOGLE_API_KEY=your-google-key-here
echo KIMI_API_KEY=your-kimi-key-here
echo GENSPARK_API_KEY=your-genspark-key-here
echo.
echo # KIMI CONFIGURATION
echo KIMI_BASE_URL=https://api.moonshot.ai/v1
echo.
echo # GENSPARK CONFIGURATION
echo GENSPARK_BASE_URL=https://api.genspark.ai/v1
echo.
echo # LOCAL LLM CONFIGURATION
echo LOCAL_LLM_URL=http://localhost:11434
echo LOCAL_LLM_PROVIDER=ollama
echo.
echo # AI GENERATION SETTINGS
echo MAX_TOKENS_BRIEF=4000
echo MAX_TOKENS_CHAPTER=16000
echo MAX_TOKENS_CONTINUITY=8000
echo AI_TEMPERATURE=0.7
echo.
echo # JWT SECRET
echo JWT_SECRET=%JWT_SECRET%
echo.
echo # DATABASE
echo DATABASE_URL=postgresql://aibooks_user:aibooks_password_change_in_production@postgres:5432/aibooks
echo.
echo # REDIS
echo REDIS_URL=redis://redis:6379
echo.
echo # APPLICATION
echo NODE_ENV=development
echo PORT=3000
echo CLIENT_URL=http://localhost:3001
echo.
echo # STORAGE
echo STORAGE_TYPE=local
echo STORAGE_PATH=./uploads
echo.
echo # QUEUE SETTINGS
echo QUEUE_CONCURRENCY_BRIEF=5
echo QUEUE_CONCURRENCY_CHAPTER=2
echo QUEUE_CONCURRENCY_CONTINUITY=3
echo.
echo # RATE LIMITING
echo RATE_LIMIT_WINDOW_MS=900000
echo RATE_LIMIT_MAX_REQUESTS=100
) > .env

REM Update the correct API key
if "%PROVIDER%"=="anthropic" (
    powershell -Command "(Get-Content .env) -replace 'ANTHROPIC_API_KEY=.*', 'ANTHROPIC_API_KEY=%API_KEY%' | Set-Content .env"
) else if "%PROVIDER%"=="openai" (
    powershell -Command "(Get-Content .env) -replace 'OPENAI_API_KEY=.*', 'OPENAI_API_KEY=%API_KEY%' | Set-Content .env"
) else if "%PROVIDER%"=="google" (
    powershell -Command "(Get-Content .env) -replace 'GOOGLE_API_KEY=.*', 'GOOGLE_API_KEY=%API_KEY%' | Set-Content .env"
) else if "%PROVIDER%"=="kimi" (
    powershell -Command "(Get-Content .env) -replace 'KIMI_API_KEY=.*', 'KIMI_API_KEY=%API_KEY%' | Set-Content .env"
) else if "%PROVIDER%"=="genspark" (
    powershell -Command "(Get-Content .env) -replace 'GENSPARK_API_KEY=.*', 'GENSPARK_API_KEY=%API_KEY%' | Set-Content .env"
)

echo ✅ Configuration file created!
echo.

REM Ask if they want to start now
set /p start_now="Do you want to start the AI Book Writer now? (y/n^): "

if /i "%start_now%"=="y" (
    echo.
    echo 🚀 Starting AI Book Writer...
    echo.
    echo This will take about 30-60 seconds...
    echo (Docker is downloading and setting up everything^)
    echo.

    docker-compose up -d

    echo.
    echo ⏳ Waiting for services to initialize...
    timeout /t 30 /nobreak >nul

    echo.
    echo =============================================
    echo    🎉 Setup Complete!
    echo =============================================
    echo.
    echo ✅ Your AI Book Writer is running!
    echo.
    echo 📱 Open in your browser:
    echo    http://localhost:3001
    echo.
    echo 🤖 AI Provider: %PROVIDER_NAME%
    echo 📊 Model: %DEFAULT_MODEL%
    echo.
    echo 📚 What's next?
    echo    1. Create an account
    echo    2. Create a book project
    echo    3. Start writing!
    echo.
    echo 🛑 To stop: docker-compose down
    echo 🔄 To restart: docker-compose up -d
    echo 📖 For help: Read USER-GUIDE.md
    echo.
) else (
    echo.
    echo =============================================
    echo    ✅ Configuration Complete!
    echo =============================================
    echo.
    echo When you're ready to start, run:
    echo    docker-compose up -d
    echo.
    echo Then open: http://localhost:3001
    echo.
)

pause

#!/bin/bash

# Kill any existing Expo processes
pkill -f "expo start" 2>/dev/null || true

# Increase file descriptor limit
ulimit -n 4096

# Set environment variables
export EXPO_NO_TELEMETRY=1
export CI=false

# Start Expo
npx expo start --lan

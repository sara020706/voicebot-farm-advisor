@echo off
title VoiceBot Frontend Server
echo ========================================
echo VoiceBot Frontend Server
echo ========================================
echo.
cd /d "%~dp0..\frontend"

if not exist "node_modules" (
  echo node_modules not found, running npm install...
  call npm install
) else (
  echo Checking for dependency updates...
  call npm install
)

echo.
echo Starting Vite dev server...
echo Frontend will be available at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run dev

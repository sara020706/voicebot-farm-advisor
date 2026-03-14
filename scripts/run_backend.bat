@echo off
title VoiceBot Backend Server
echo ========================================
echo VoiceBot Backend Server
echo ========================================
echo.
cd /d "%~dp0..\backend"

echo Checking Python installation...
py --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo Installing Python dependencies...
py -m pip install -r requirements.txt --quiet --no-warn-script-location

echo.
echo Starting FastAPI server on http://localhost:5000
echo API Documentation: http://localhost:5000/docs
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

py -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000

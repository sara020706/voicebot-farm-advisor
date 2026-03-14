@echo off
title VoiceBot Backend Services
echo ========================================
echo VoiceBot Backend Services
echo ========================================
echo.

echo [1/2] Starting CUD Service (Port 5000)...
start "CUD Service" cmd /k "cd /d "%~dp0..\backend\cud_service" && echo Installing dependencies... && pip install -r requirements.txt && echo Starting CUD service... && uvicorn app.main:app --reload --host 0.0.0.0 --port 5000"

echo Waiting for CUD service to initialize...
timeout /t 5 /nobreak >nul

echo [2/2] Starting GraphQL Service (Port 5001)...
start "GraphQL Service" cmd /k "cd /d "%~dp0..\backend\graphql_service" && echo Installing dependencies... && pip install -r requirements.txt && echo Starting GraphQL service... && uvicorn app.main:app --reload --host 0.0.0.0 --port 5001"

echo.
echo ========================================
echo Backend services are starting...
echo ========================================
echo CUD Service:     http://localhost:5000
echo GraphQL Service: http://localhost:5001
echo CUD API Docs:    http://localhost:5000/docs
echo GraphQL IDE:     http://localhost:5001/graphql
echo.
echo Each service runs in its own window.
echo Wait 10-15 seconds for full initialization.
echo Check each window for any error messages.
echo.
echo Press any key to close this launcher window...
pause >nul
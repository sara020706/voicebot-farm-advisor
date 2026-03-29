@echo off
color 0A
title VoiceBot Launcher

cls
echo.
echo  ╔════════════════════════════════════════════════════════════╗
echo  ║                                                            ║
echo  ║              VOICEBOT - Agricultural Assistant             ║
echo  ║                                                            ║
echo  ╚════════════════════════════════════════════════════════════╝
echo.
echo  Starting VoiceBot Application...
echo.
echo  [1/4] Starting CUD Service (FastAPI - Port 5000)...
start "VoiceBot CUD :5000" cmd /k "cd /d "%~dp0backend\cud_service" && py -m pip install -r requirements.txt --quiet --no-warn-script-location && echo. && echo CUD Service running on http://localhost:5000 && echo API Docs: http://localhost:5000/docs && echo. && py -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000"

timeout /t 4 /nobreak >nul

echo  [2/4] Starting GraphQL Service (FastAPI - Port 5001)...
start "VoiceBot GraphQL :5001" cmd /k "cd /d "%~dp0backend\graphql_service" && py -m pip install -r requirements.txt --quiet --no-warn-script-location && echo. && echo GraphQL Service running on http://localhost:5001 && echo GraphQL IDE: http://localhost:5001/graphql && echo. && py -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5001"

timeout /t 4 /nobreak >nul

echo  [3/4] Starting Frontend Server (Vite + React)...
start "VoiceBot Frontend :5173" cmd /k "cd /d "%~dp0frontend" && npm install && echo. && echo Frontend running on http://localhost:5173 && echo. && npm run dev"

echo  [4/4] Waiting for servers to initialize...
timeout /t 10 /nobreak >nul

echo.
echo  ✓ CUD Service Started
echo  ✓ GraphQL Service Started
echo  ✓ Frontend Server Started
echo.
echo  Opening VoiceBot in your browser...
start http://localhost:5173

echo.
echo  ╔════════════════════════════════════════════════════════════╗
echo  ║                    APPLICATION RUNNING                     ║
echo  ╠════════════════════════════════════════════════════════════╣
echo  ║  Frontend:        http://localhost:5173                   ║
echo  ║  CUD Service:     http://localhost:5000                   ║
echo  ║  CUD API Docs:    http://localhost:5000/docs              ║
echo  ║  GraphQL Service: http://localhost:5001                   ║
echo  ║  GraphQL IDE:     http://localhost:5001/graphql           ║
echo  ╠════════════════════════════════════════════════════════════╣
echo  ║  Three terminal windows are now open:                     ║
echo  ║  - VoiceBot CUD :5000 (Create/Update/Delete API)          ║
echo  ║  - VoiceBot GraphQL :5001 (Read-only GraphQL API)         ║
echo  ║  - VoiceBot Frontend :5173 (React app)                    ║
echo  ║                                                            ║
echo  ║  To stop the servers:                                     ║
echo  ║  Press Ctrl+C in each terminal window                     ║
echo  ╚════════════════════════════════════════════════════════════╝
echo.
echo  Press any key to close this launcher window...
pause >nul

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
echo  [1/3] Starting Backend Server (FastAPI)...
start "VoiceBot Backend" cmd /k "cd /d "%~dp0backend" && py -m pip install -r requirements.txt --quiet --no-warn-script-location && echo. && echo Backend running on http://localhost:5000 && echo API Docs: http://localhost:5000/docs && echo. && py -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000"

timeout /t 4 /nobreak >nul

echo  [2/3] Starting Frontend Server (Vite + React)...
start "VoiceBot Frontend" cmd /k "cd /d "%~dp0frontend" && npm install && echo. && echo Frontend running on http://localhost:5173 && echo. && npm run dev"

echo  [3/3] Waiting for servers to initialize...
timeout /t 10 /nobreak >nul

echo.
echo  ✓ Backend Server Started
echo  ✓ Frontend Server Started
echo.
echo  Opening VoiceBot in your browser...
start http://localhost:5173

echo.
echo  ╔════════════════════════════════════════════════════════════╗
echo  ║                    APPLICATION RUNNING                     ║
echo  ╠════════════════════════════════════════════════════════════╣
echo  ║  Frontend:  http://localhost:5173                         ║
echo  ║  Backend:   http://localhost:5000                         ║
echo  ║  API Docs:  http://localhost:5000/docs                    ║
echo  ╠════════════════════════════════════════════════════════════╣
echo  ║  Two terminal windows are now open:                       ║
echo  ║  - VoiceBot Backend (FastAPI server)                      ║
echo  ║  - VoiceBot Frontend (Vite dev server)                    ║
echo  ║                                                            ║
echo  ║  To stop the servers:                                     ║
echo  ║  Press Ctrl+C in each terminal window                     ║
echo  ╚════════════════════════════════════════════════════════════╝
echo.
echo  Press any key to close this launcher window...
pause >nul

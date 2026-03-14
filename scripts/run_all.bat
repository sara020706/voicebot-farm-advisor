@echo off
echo ========================================
echo Starting VoiceBot Application
echo ========================================
echo.
echo [1/2] Starting Backend Server (Port 5000)...
start "VoiceBot Backend" cmd /k "%~dp0run_backend.bat"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server (Port 5173)...
start "VoiceBot Frontend" cmd /k "%~dp0run_frontend.bat"

echo.
echo Waiting for servers to initialize...
echo This may take 10-15 seconds on first run...
timeout /t 12 /nobreak >nul

echo.
echo Opening browser...
start http://localhost:5173

echo.
echo ========================================
echo VoiceBot is running!
echo ========================================
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo API Docs: http://localhost:5000/docs
echo.
echo Both servers are running in separate windows.
echo To stop: Press Ctrl+C in each window or close them.
echo.
echo Press any key to close this launcher window...
pause >nul

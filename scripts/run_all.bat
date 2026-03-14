@echo off
echo Starting VoiceBot...
start "VoiceBot Backend" cmd /k "%~dp0run_backend.bat"
timeout /t 5 /nobreak
start "VoiceBot Frontend" cmd /k "%~dp0run_frontend.bat"
echo.
echo Services starting...
echo Frontend:        http://localhost:5173
echo CUD Service:     http://localhost:5000
echo GraphQL Service: http://localhost:5001
echo CUD API Docs:    http://localhost:5000/docs
echo GraphQL IDE:     http://localhost:5001/graphql
echo.
echo All services are starting in separate windows.
echo Wait 10-15 seconds for full initialization.
pause

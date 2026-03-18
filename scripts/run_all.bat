@echo off
echo ================================================
echo  VoiceBot - Starting All Services
echo ================================================
echo.

echo [1/3] Starting CUD Service (port 5000)...
start "VoiceBot CUD :5000" cmd /k "%~dp0run_cud.bat"

echo Waiting 4 seconds for CUD to start...
timeout /t 4 /nobreak > nul

echo [2/3] Starting GraphQL Service (port 5001)...
start "VoiceBot GraphQL :5001" cmd /k "%~dp0run_graphql.bat"

echo Waiting 4 seconds for GraphQL to start...
timeout /t 4 /nobreak > nul

echo [3/3] Starting Frontend (port 5173)...
start "VoiceBot Frontend :5173" cmd /k "%~dp0run_frontend.bat"

echo.
echo ================================================
echo  All services starting...
echo ================================================
echo  Frontend:        http://localhost:5173
echo  CUD Service:     http://localhost:5000
echo  CUD API Docs:    http://localhost:5000/docs
echo  GraphQL Service: http://localhost:5001
echo  GraphQL IDE:     http://localhost:5001/graphql
echo  Health CUD:      http://localhost:5000/health
echo  Health GraphQL:  http://localhost:5001/health
echo ================================================
pause

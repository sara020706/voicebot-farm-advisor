@echo off
title Stop VoiceBot Servers

echo.
echo Stopping VoiceBot servers...
echo.

REM Kill Node.js processes (Frontend)
echo Stopping Frontend server...
taskkill /F /IM node.exe /T 2>nul
if %errorlevel% equ 0 (
    echo ✓ Frontend server stopped
) else (
    echo ✗ No frontend server found running
)

REM Kill Python/Uvicorn processes (Backend)
echo Stopping Backend server...
taskkill /F /IM python.exe /T 2>nul
if %errorlevel% equ 0 (
    echo ✓ Backend server stopped
) else (
    echo ✗ No backend server found running
)

echo.
echo All VoiceBot servers have been stopped.
echo.
pause

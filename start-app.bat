@echo off
REM Campus Placement Portal - Auto Start Script
REM This script automatically starts both backend and frontend servers

cd /d "%~dp0"
echo.
echo =========================================
echo Campus Placement Portal - Auto Start
echo =========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Starting Campus Placement Portal...
echo.

REM Start the development servers
echo Launching backend and frontend servers...
call npm run dev

REM Keep window open if there are any errors
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to start servers. Press any key to exit.
    pause
    exit /b 1
)

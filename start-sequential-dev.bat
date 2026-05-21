@echo off
REM Campus Placement Portal - Sequential Startup Script
REM Starts backend first, waits for it to be ready, then starts frontend

cd /d "%~dp0"
echo.
echo =========================================
echo Campus Placement Portal - Sequential Start
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

echo [1/3] Starting Backend Server...
echo.

REM Start backend in a new window
start "Backend Server" /d "server" cmd /k "npm run dev"

REM Wait for backend to be ready
echo [2/3] Waiting for Backend to be ready...
echo.

setlocal enabledelayedexpansion
set retries=0
set max_retries=60

:wait_loop
if %retries% geq %max_retries% (
    echo ERROR: Backend failed to start after %max_retries% attempts
    echo Please check the Backend Server window for errors
    pause
    exit /b 1
)

echo Checking backend health... (Attempt %retries%/60)

REM Use curl or PowerShell to check if backend is ready
curl -s http://localhost:5000/api/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Backend is ready!
    echo.
    goto backend_ready
)

timeout /t 1 /nobreak >nul
set /a retries+=1
goto wait_loop

:backend_ready
echo [3/3] Starting Frontend...
echo.

REM Start frontend in a new window
start "Frontend Client" /d "client" cmd /k "npm run dev"

echo.
echo =========================================
echo ✓ Both servers started successfully!
echo =========================================
echo.
echo Backend Server:  http://localhost:5000
echo Frontend Client: http://localhost:5173 (or similar)
echo.
echo Close these windows to stop the servers.
echo.
pause

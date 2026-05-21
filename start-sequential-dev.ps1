# Campus Placement Portal - Sequential Startup Script (PowerShell)
# Starts backend first, waits for it to be ready, then starts frontend

Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptPath

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Campus Placement Portal - Sequential Start" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
$nodeExists = $null -ne (Get-Command node -ErrorAction SilentlyContinue)

if (-not $nodeExists) {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[1/3] Starting Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Start backend server in a new PowerShell window
Start-Process PowerShell -ArgumentList {
    cd "$PSScriptRoot\server"
    npm run dev
} -WindowStyle Normal

# Wait for backend to be ready
Write-Host "[2/3] Waiting for Backend to be ready..." -ForegroundColor Cyan
Write-Host ""

$retries = 0
$maxRetries = 60
$backendReady = $false

while ($retries -lt $maxRetries -and -not $backendReady) {
    Write-Host "Checking backend health... (Attempt $($retries + 1)/$maxRetries)" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host ""
            Write-Host "✓ Backend is ready!" -ForegroundColor Green
            Write-Host ""
            break
        }
    }
    catch {
        # Backend not ready yet, continue waiting
    }
    
    Start-Sleep -Seconds 1
    $retries++
}

if (-not $backendReady) {
    Write-Host ""
    Write-Host "ERROR: Backend failed to start after $maxRetries attempts" -ForegroundColor Red
    Write-Host "Please check the Backend Server window for errors" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[3/3] Starting Frontend..." -ForegroundColor Cyan
Write-Host ""

# Start frontend client in a new PowerShell window
Start-Process PowerShell -ArgumentList {
    cd "$PSScriptRoot\client"
    npm run dev
} -WindowStyle Normal

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "✓ Both servers started successfully!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend Server:  http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend Client: http://localhost:5173 (or similar)" -ForegroundColor Green
Write-Host ""
Write-Host "Close these windows to stop the servers." -ForegroundColor Yellow
Write-Host ""

# Keep this window open
Read-Host "Press Enter to exit"

# Campus Placement Portal - Auto Start Script (PowerShell)
# This script automatically starts both backend and frontend servers

Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptPath

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Campus Placement Portal - Auto Start" -ForegroundColor Green
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

Write-Host "Starting Campus Placement Portal..." -ForegroundColor Cyan
Write-Host ""

# Check if npm packages are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "Launching backend and frontend servers..." -ForegroundColor Cyan
Write-Host ""

# Start the development servers
npm run dev

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to start servers" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

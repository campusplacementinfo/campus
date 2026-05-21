# Campus Placement Portal - Backend Connection Setup Guide

## Problem Solved
When you restart your system, the backend server doesn't automatically start, causing "Backend not connected" errors. This guide provides permanent solutions.

---

## Quick Start (Immediate Solution)

### Using Auto-Start Scripts

#### Option 1: Batch Script (Easiest)
1. Double-click `start-app.bat` in the project root folder
2. Two terminal windows will open - one for backend, one for frontend
3. Wait for "Vite dev server is ready" to appear

#### Option 2: PowerShell Script
1. Open PowerShell as Administrator
2. Navigate to the project folder: `cd C:\Users\abhay\Campus-Placement-Portal`
3. Run: `.\start-app.ps1`
4. If you see an error about execution policy, that's normal - PowerShell will fix it automatically

---

## Permanent Solutions (Choose One)

### ✅ Solution 1: Windows Task Scheduler (Recommended - Automatic)

This automatically starts the application when your computer starts.

#### Steps:
1. **Open Task Scheduler**
   - Press `Win + R`, type `taskschd.msc`, press Enter
   - Or search for "Task Scheduler" in Windows

2. **Create Basic Task**
   - Click "Create Basic Task" on the right panel
   - Name: `Campus Placement Portal`
   - Description: `Auto-start backend and frontend servers`
   - Click "Next"

3. **Set Trigger**
   - Select "At startup"
   - Click "Next"

4. **Set Action**
   - Select "Start a program"
   - Click "Next"
   - Program/script: `C:\Users\abhay\Campus-Placement-Portal\start-app.bat`
   - Start in: `C:\Users\abhay\Campus-Placement-Portal`
   - Click "Next"

5. **Finish**
   - Check "Open the Properties dialog for this task when I click Finish"
   - Click "Finish"

6. **Configure Properties**
   - In the "General" tab:
     - Check "Run with highest privileges"
   - Click "OK"

#### Now:
- ✓ Servers will automatically start when you boot up
- ✓ You can still stop them manually in the terminal
- ✓ Restart your PC to test

---

### ✅ Solution 2: Startup Folder (Semi-Automatic)

This creates a shortcut that launches when Windows starts.

#### Steps:
1. **Create Batch Wrapper Script**
   - Create a file called `start-app-hidden.bat` in the project folder with this content:
   ```batch
   @echo off
   start "" /D "%~dp0" cmd /c npm run dev
   ```

2. **Create Shortcut**
   - Right-click on desktop → New → Shortcut
   - Location: `C:\Users\abhay\Campus-Placement-Portal\start-app.bat`
   - Name: `Campus Placement Portal`
   - Right-click shortcut → Properties → Advanced → Check "Run as administrator" → OK

3. **Move to Startup Folder**
   - Press `Win + R`, type: `shell:startup`
   - Move the shortcut here
   - Now it will launch automatically on startup

---

### ✅ Solution 3: Scheduled Task with Delay (Alternative)

If you want a slight delay before the app starts:

1. Follow "Solution 1" steps 1-4
2. In step 4, click "Advanced" instead of "Next"
3. Set a delay (e.g., 30 seconds) to ensure network is ready
4. Continue with remaining steps

---

## What These Changes Include

### 1. **Enhanced Backend Health Checks** (`client/src/services/api.js`)
- Monitors backend connection every 30 seconds
- Automatically retries failed requests with exponential backoff
- Saves connection configuration to browser storage
- Handles network timeouts gracefully

### 2. **Connection Status Display** 
- New component shows "Backend Disconnected" warning if needed
- Users can manually retry connection
- Automatically hides when connection is restored

### 3. **Improved Error Messages**
- Clear messages about what's wrong
- Suggestions on how to fix it
- Better debugging information in console

---

## How to Use Going Forward

### After System Restart:
1. If using **Task Scheduler** or **Startup Folder**: App starts automatically
2. If **manual start**: Double-click `start-app.bat` or run `npm run dev`
3. Wait 30 seconds for both servers to be ready
4. Open browser to `http://localhost:5173`

### If Backend Disconnects:
1. You'll see a warning banner at the top
2. Click "Retry" or restart the servers:
   - In the terminal running the app, press `Ctrl+C`
   - Run `npm run dev` again

### Check Backend Status:
- In browser console: `import { getAPIStatus } from '/src/services/api.js'; console.log(getAPIStatus())`
- Watch for 30-second health checks in console

---

## Verification

### ✓ Test if setup is working:

1. **Start the app** using any method above
2. **Open browser** to `http://localhost:5173`
3. **Check console** (F12 → Console tab):
   - Should see: `Backend health: ✓ Connected`
4. **Try logging in** - if it works, backend is properly connected
5. **Restart computer** - app should auto-start (if using Task Scheduler)

---

## Troubleshooting

### Issue: `npm: command not found`
- **Solution**: Install Node.js from https://nodejs.org/ (LTS version recommended)
- Restart your computer after installation

### Issue: Port already in use (Error: listen EADDRINUSE)
- **Solution**: 
  - A server is already running on that port
  - Kill existing process: `netstat -ano | findstr :5000` (get PID, then `taskkill /PID [number]`)
  - Or change PORT in `server/.env` and `VITE_API_URL` in `client/.env`

### Issue: Backend starts but can't connect to MongoDB
- **Check `server/.env`**:
  - Verify `MONGO_URI` is correct
  - If using MongoDB Atlas, ensure your IP is whitelisted
  - Connection string format: `mongodb+srv://user:password@cluster.mongodb.net/?appName=AppName`

### Issue: Task Scheduler task doesn't run
- **Verify**:
  - Task is "Enabled" (not "Disabled")
  - "Run with highest privileges" is checked
  - Path to `start-app.bat` is correct (try copy from File Explorer)
  - Manual test: Right-click task → Run

### Issue: App doesn't start automatically
- **Check**:
  - Are Task Scheduler/Startup folder actually configured? (Run one of the solutions above)
  - Is Windows Defender blocking something? (Check Windows Defender Firewall)
  - Try manual start first to verify everything works

---

## Configuration Files

### `.env` Files Created:
- **Root `.env`**: MongoDB connection
- **`server/.env`**: Backend configuration
- **`client/.env`**: Frontend API URL configuration

### Key Settings:

**`client/.env`:**
```
VITE_API_URL=http://localhost:5000/api
```
- Change `localhost:5000` if backend is on different port/machine
- Make sure it ends with `/api`

**`server/.env`:**
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

---

## For Developers

### Manual Testing:

1. **Check backend health endpoint:**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"status":"OK","message":"Backend is running..."}`

2. **View connection status in frontend:**
   ```javascript
   // In browser console:
   import { getAPIStatus, checkBackendHealth } from '/src/services/api.js'
   console.log(getAPIStatus())
   await checkBackendHealth()
   ```

3. **Disable auto-health checks** (for testing):
   ```javascript
   import { stopAPIHealthChecks } from '/src/services/api.js'
   stopAPIHealthChecks()
   ```

---

## Summary

| Method | Auto-Start | Pros | Cons |
|--------|-----------|------|------|
| Manual `start-app.bat` | ❌ | Simple, full control | Must remember to start |
| Task Scheduler | ✅ | Fully automatic, most reliable | Requires setup |
| Startup Folder | ⚠️ Semi | Easy setup | May have timing issues |
| PowerShell Script | ❌ | More powerful scripting | Requires understanding |

**Recommended**: Use **Task Scheduler** for production/personal use.

---

## Questions or Issues?

Check the console (F12 → Console) for error messages with suggestions.
All API requests will show detailed error information if something fails.

---

**Last Updated**: April 2026  
**Status**: Production-Ready ✓

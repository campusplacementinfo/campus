# Sequential Backend-First Connection System

## Overview

This document explains the new **sequential connection system** for the Campus Placement Portal. Instead of connecting to the backend and frontend simultaneously (which can lead to repeated connection attempts), the system now:

1. **Starts the backend server first**
2. **Waits for the backend to be fully ready** (MongoDB connected, health check passing)
3. **Starts the frontend** only after backend is confirmed ready
4. **Frontend waits to connect** until backend is responding

## Why This System?

**Problems with simultaneous startup:**
- Frontend tries to connect before backend is ready ❌
- Repeated failed connection attempts cause errors
- Resources are wasted on retry logic
- User experience is inconsistent

**Benefits of sequential startup:**
- Backend is guaranteed ready before frontend attempts connection ✓
- No repeated connection failures
- Clean, predictable startup flow
- Better resource management
- Improved user experience with clear loading states

## How to Use

### Option 1: Windows Batch File (Recommended for Windows)
```bash
start-sequential-dev.bat
```

**What it does:**
1. Validates Node.js installation
2. Starts backend server in a new window
3. Polls backend health check endpoint until ready (max 60 attempts)
4. Starts frontend in a new window
5. Displays connection confirmation

**Features:**
- Auto-detects backend readiness using `http://localhost:5000/api/health`
- Timeout protection (60 seconds max)
- Clear status messages in console
- Easy to stop: close the terminal windows

### Option 2: PowerShell Script (Alternative for Windows)
```powershell
.\start-sequential-dev.ps1
```

**What it does:** Same as batch file, with better error handling and colored output

**Features:**
- Cleaner terminal output with colors
- Better error messages
- Same 60-second timeout protection

### Option 3: Parallel Start (Legacy - Not Recommended)
```bash
npm run dev
```
This still runs both servers simultaneously. Use only if you prefer the old behavior.

## Understanding the Flow

### 1. Backend Startup

When the backend starts:
```
✓ MongoDB Connected
✓ Server running on port 5000
✓ Health check endpoint available at /api/health
```

### 2. Health Check Polling

The startup script continuously checks:
```
GET http://localhost:5000/api/health

Response (when ready):
{
  "status": "OK",
  "message": "Backend is running. MongoDB: Connected"
}

HTTP Status: 200
```

### 3. Frontend Connection Wait

Once backend is confirmed ready, frontend starts and shows loading screen:
```
🔄 Connecting to Backend Server...
```

When backend responds, frontend renders the full application:
```
✓ Backend is ready and connected!
```

## Configuration

### Customize Backend Port

If you're running backend on a different port:

**In start-sequential-dev.bat:**
```batch
curl -s http://localhost:YOUR_PORT/api/health >nul 2>&1
```

**In start-sequential-dev.ps1:**
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:YOUR_PORT/api/health"
```

**In server/server.js:**
```javascript
const PORT = process.env.PORT || YOUR_PORT;
```

### Customize Timeout

**In start-sequential-dev.bat:**
```batch
set max_retries=120    # 120 seconds instead of 60
```

**In start-sequential-dev.ps1:**
```powershell
$maxRetries = 120      # 120 attempts * 1 second = 120 seconds
```

**In client/src/main.jsx:**
```javascript
waitForBackend(120, 1000)  # 120 retries, 1 second delay
```

## Troubleshooting

### Backend Fails to Start

**Error: "Backend failed to start after 60 attempts"**

Check the Backend Server window for:
- Port 5000 already in use: `netstat -ano | findstr :5000`
- MongoDB connection issues
- Node.js errors

**Solution:**
```bash
# Kill existing process on port 5000 (if using netstat)
taskkill /PID <PID> /F

# Or use a different port:
PORT=5001 npm run dev
```

### Frontend Shows "Connection Failed"

**Error: "Unable to connect to the backend server"**

Check:
1. Backend server window is still running
2. MongoDB is connected
3. Port 5000 is accessible
4. No firewall blocking localhost:5000

**Solution:**
- Click "Retry Connection" button in frontend
- Check backend server console for errors
- Restart both servers

### Port Already in Use

**Error: "EADDRINUSE: address already in use"**

**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill it
taskkill /PID <PID> /F

# Or use different port
PORT=5001 npm run dev
```

## How Frontend Waits for Backend

### Loading Screen
When frontend first loads, it shows:
```jsx
🔄 Connecting to Backend Server...
⏳ This may take a moment
```

### Health Check Function
File: `client/src/services/api.js`

```javascript
async waitForBackend(maxRetries = 60, delayMs = 1000) {
  // Polls backend every 1 second
  // Waits up to 60 seconds
  // Returns true when backend responds with 200 status
  // Returns false if timeout reached
}
```

### Retry Button
If connection fails, user can click "Retry Connection" to try again

## Server-Side Health Check

File: `server/server.js`

```javascript
app.get("/api/health", (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.status(mongoStatus === "Connected" ? 200 : 503).json({ 
    status: mongoStatus === "Connected" ? "OK" : "Service Unavailable", 
    message: `Backend is running. MongoDB: ${mongoStatus}` 
  });
});
```

This endpoint:
- Returns **200 OK** when MongoDB is connected ✓
- Returns **503 Service Unavailable** when MongoDB is disconnected ✗
- Includes status information in response body

## Monitoring Connections

### Check Backend Status Anytime

In browser console:
```javascript
import { checkBackendHealth } from './services/api.js'
await checkBackendHealth()
```

### View Connection Details

```javascript
import { getAPIStatus } from './services/api.js'
console.log(getAPIStatus())
```

Output:
```javascript
{
  apiUrl: "http://localhost:5000/api",
  backendAvailable: true,
  lastHealthCheck: "2026-04-29T10:30:45.123Z"
}
```

## Architecture Diagram

```
User runs: start-sequential-dev.bat
              |
              v
    ┌─────────────────────┐
    │ 1. Start Backend    │
    │ (server/server.js)  │
    └─────────────────────┘
              |
              v (wait)
    ┌─────────────────────┐
    │ 2. Poll Health      │
    │ GET /api/health     │
    │ (every 1 second)    │
    └─────────────────────┘
              |
         (ready?)
          /      \
        YES       NO
       /           \
      v             v
    START      RETRY
   FRONTEND   (max 60x)
      |
      v
   ┌──────────────────────┐
   │ Frontend Loading     │
   │ (show spinner)       │
   └──────────────────────┘
      |
      v
   ┌──────────────────────┐
   │ 3. Frontend Connects │
   │ waitForBackend()     │
   │ (client/main.jsx)    │
   └──────────────────────┘
      |
      v
   ┌──────────────────────┐
   │ 4. Render App        │
   │ Full App Loads       │
   └──────────────────────┘
```

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Startup Order** | Parallel | Sequential |
| **Connection Attempts** | Repeated failures | Single successful connection |
| **User Experience** | Confusing errors | Clear loading state |
| **Startup Time** | Faster but chaotic | Slightly slower but reliable |
| **Error Recovery** | Auto-retry with backoff | Clean retry button |
| **Resource Usage** | Wasted on failed retries | Efficient polling |

## Quick Reference

```bash
# Sequential startup (RECOMMENDED)
.\start-sequential-dev.bat          # Windows Batch
.\start-sequential-dev.ps1          # PowerShell

# Old parallel startup (not recommended)
npm run dev

# View backend health
curl http://localhost:5000/api/health

# Check connection from frontend console
import { getAPIStatus } from './services/api.js'
console.log(getAPIStatus())
```

---

**Created:** April 29, 2026
**System:** Campus Placement Portal v1.0

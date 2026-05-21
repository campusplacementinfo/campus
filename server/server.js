 const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const serverEnvPath = path.join(__dirname, ".env");
const rootEnvPath = path.join(__dirname, "../.env");
require("dotenv").config({ path: rootEnvPath });
const serverEnvLoaded = fs.existsSync(serverEnvPath) && require("dotenv").config({ path: serverEnvPath, override: true }).parsed;
console.log(`Loaded environment from ${rootEnvPath}`);
if (serverEnvLoaded) {
  console.log(`Loaded additional environment from ${serverEnvPath}`);
}

const app = express();

console.log('Admin creation token configured:', !!process.env.ADMIN_CREATION_TOKEN);

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// MongoDB connection with retry logic
const mongoOptions = {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority',
};

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let isConnecting = false;

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.log("MONGO_URI not found in .env file. Please create a valid .env with MONGO_URI=<your-connection-string>");
    return;
  }

  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    return;
  }

  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }

  isConnecting = true;
  try {
    await mongoose.connect(MONGO_URI, mongoOptions);
    reconnectAttempts = 0; // Reset on successful connection
    isConnecting = false;
  } catch (err) {
    isConnecting = false;
    
    reconnectAttempts++;
    console.error("MongoDB Connection Error:", err.message);
    console.error("MongoDB Connection Details:", {
      serverSelectionTimeoutMS: mongoOptions.serverSelectionTimeoutMS,
      connectTimeoutMS: mongoOptions.connectTimeoutMS,
      reconnectAttempt: reconnectAttempts
    });

    if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
      const delayMs = Math.min(5000 * reconnectAttempts, 30000);
      console.log(`Retrying in ${delayMs / 1000} seconds (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
      setTimeout(connectDB, delayMs);
    } else {
      console.error("Max reconnection attempts reached. Please check your MongoDB Atlas connection.");
    }
  }
};

connectDB();

mongoose.connection.once('open', () => {
  console.log('✅ MongoDB Connected Successfully');
  reconnectAttempts = 0;
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected! Attempting to reconnect...');
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    setTimeout(connectDB, 5000);
  }
});

mongoose.connection.on('error', (err) => {
  console.log('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
  reconnectAttempts = 0;
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));

// Health check route
app.get("/api/health", (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.status(mongoStatus === "Connected" ? 200 : 503).json({ 
    status: mongoStatus === "Connected" ? "OK" : "Service Unavailable", 
    message: `Backend is running. MongoDB: ${mongoStatus}` 
  });
});

// Catch-all handler: send back index.html for any non-API routes (for SPA)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  try {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("Campus Placement Portal Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
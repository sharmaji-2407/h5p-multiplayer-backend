const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const config = require("../dist/config").default;
const gameSessionRoutes = require("../dist/routes/gameSessionRoutes").default;
const initializeSocket = require("../dist/socket").default;
const authRoutes = require("../dist/routes/auth.routes").default;

// Create Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());

// Routes
app.use("/api", gameSessionRoutes);
app.use("/auth", authRoutes);

// Root route for Vercel
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ status: "ok", message: "H5P Multiplayer Backend API" });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Connect to MongoDB (if not in serverless environment)
if (process.env.NODE_ENV !== "production") {
  mongoose
    .connect(config.mongoUri)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error);
    });
} else {
  // In production (Vercel), connect to MongoDB
  mongoose
    .connect(config.mongoUri)
    .then(() => {
      console.log("Connected to MongoDB in serverless mode");
    })
    .catch((error) => {
      console.error("MongoDB connection error in serverless mode:", error);
    });
}

// For local development
if (process.env.NODE_ENV !== "production") {
  const http = require("http");
  const server = http.createServer(app);

  // Initialize Socket.IO for local development
  const io = initializeSocket(server);

  server.listen(config.port || 3001, () => {
    console.log(`Server running on port ${config.port || 3001}`);
  });
}

// Export the Express app for Vercel serverless deployment
module.exports = app;

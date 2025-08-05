import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import config from "./config";
import gameSessionRoutes from "./routes/gameSessionRoutes";
import initializeSocket from "./socket";

// Create Express app
const app = express();
const server = http.createServer(app);

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

// Initialize Socket.IO
const io = initializeSocket(server);

// Connect to MongoDB only if not in serverless environment
if (process.env.NODE_ENV !== "production") {
  mongoose
    .connect(config.mongoUri)
    .then(() => {
      console.log("Connected to MongoDB");

      // Start server
      server.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
      });
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    });
} else {
  // In production (Vercel), connect to MongoDB without starting the server
  mongoose
    .connect(config.mongoUri)
    .then(() => {
      console.log("Connected to MongoDB in serverless mode");
    })
    .catch((error) => {
      console.error("MongoDB connection error in serverless mode:", error);
    });
}

// Handle server shutdown
const gracefulShutdown = () => {
  console.log("Shutting down gracefully...");
  server.close(() => {
    mongoose.connection.close().then(() => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
};

// Handle termination signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Export the Express app for Vercel serverless deployment
export default app;

import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import config from "./config";
import gameSessionRoutes from "./routes/gameSessionRoutes";
import initializeSocket from "./socket";

const app = express();
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

// Routes
app.use("/api", gameSessionRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Initialize Socket.IO
const io = initializeSocket(server);

// Connect to MongoDB
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

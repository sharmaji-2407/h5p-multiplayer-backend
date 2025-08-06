import dotenv from "dotenv";

dotenv.config();

export default {
  port: process.env.PORT || 3001,
  mongoUri:
    process.env.MONGO_URI || "mongodb://localhost:27017/h5p-multiplayer",
  corsOrigin: "*",
  jwt: {
    secret: process.env.JWT_SECRET || "h5p-multiplayer-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },
};

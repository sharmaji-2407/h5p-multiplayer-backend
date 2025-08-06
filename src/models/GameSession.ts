import mongoose from "mongoose";
import { GameSession } from "../types";

const gameUserSchema = new mongoose.Schema({
  id: { type: String, required: true },
  email: { type: String, required: true },
  isActive: { type: Boolean, default: true },
});

const gameSessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  gameId: { type: String, required: true },
  users: [gameUserSchema],
  gameState: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

gameSessionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<GameSession & mongoose.Document>(
  "GameSession",
  gameSessionSchema
);

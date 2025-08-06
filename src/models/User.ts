import mongoose from "mongoose";
import { User } from "../types";

const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  gameData: { type: mongoose.Schema.Types.Mixed },
});

export default mongoose.model<User & mongoose.Document>("User", userSchema);

import { Router } from "express";
import {
  createGameSession,
  joinGameSession,
  getGameSession,
  updateGameState,
  leaveGameSession,
} from "../controllers/gameSessionController";

const router = Router();

router.post("/sessions", createGameSession);
router.post("/sessions/:sessionId/join", joinGameSession);
router.get("/sessions/:sessionId", getGameSession);
router.put("/sessions/:sessionId/state", updateGameState);
router.post("/sessions/:sessionId/leave", leaveGameSession);

export default router;

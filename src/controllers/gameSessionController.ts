import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import GameSessionModel from "../models/GameSession";
import { User } from "../types";

export const createGameSession = async (req: Request, res: Response) => {
  try {
    const { gameId, userId, userEmail } = req.body;

    console.log(
      `Create session request: gameId=${gameId}, userId=${userId}, userEmail=${userEmail}`
    );

    if (!gameId || !userId || !userEmail) {
      console.log("Missing required fields:", { gameId, userId, userEmail });
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sessionId = uuidv4();
    console.log(`Generated new session ID: ${sessionId}`);
    const user: Partial<User> = {
      id: userId,
      email: userEmail,
      isActive: true,
    };

    const gameSession = new GameSessionModel({
      id: sessionId,
      gameId,
      users: [user],
      gameState: {
        status: "waiting",
        currentTurn: userId,
      },
    });

    await gameSession.save();

    return res.status(201).json({
      message: "Game session created successfully",
      sessionId,
      gameSession,
    });
  } catch (error) {
    console.error("Error creating game session:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const joinGameSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { userId, userEmail } = req.body;

    console.log(
      `Join request for session: ${sessionId}, user: ${userId}, email: ${userEmail}`
    );

    if (!sessionId || !userId || !userEmail) {
      console.log("Missing required fields:", { sessionId, userId, userEmail });
      return res.status(400).json({ message: "Missing required fields" });
    }

    console.log(`Looking for session with id: ${sessionId}`);
    const gameSession = await GameSessionModel.findOne({ id: sessionId });

    if (!gameSession) {
      console.log(`Session not found with id: ${sessionId}`);
      return res.status(404).json({ message: "Game session not found" });
    }

    console.log(`Found session: ${gameSession.id}`);

    // Check if user already exists in the session
    const existingUserIndex = gameSession.users.findIndex(
      (user) => user.id === userId
    );

    if (existingUserIndex !== -1) {
      // Update existing user to active
      gameSession.users[existingUserIndex].isActive = true;
    } else {
      // Add new user
      const newUser: Partial<User> = {
        id: userId,
        email: userEmail,
        isActive: true,
      };
      gameSession.users.push(newUser as User);
    }

    await gameSession.save();

    return res.status(200).json({
      message: "Joined game session successfully",
      gameSession,
    });
  } catch (error) {
    console.error("Error joining game session:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getGameSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const gameSession = await GameSessionModel.findOne({ id: sessionId });

    if (!gameSession) {
      return res.status(404).json({ message: "Game session not found" });
    }

    return res.status(200).json({ gameSession });
  } catch (error) {
    console.error("Error getting game session:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateGameState = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { gameState } = req.body;

    if (!sessionId || !gameState) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const gameSession = await GameSessionModel.findOne({ id: sessionId });

    if (!gameSession) {
      return res.status(404).json({ message: "Game session not found" });
    }

    gameSession.gameState = { ...gameSession.gameState, ...gameState };
    await gameSession.save();

    return res.status(200).json({
      message: "Game state updated successfully",
      gameSession,
    });
  } catch (error) {
    console.error("Error updating game state:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const leaveGameSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.body;

    if (!sessionId || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const gameSession = await GameSessionModel.findOne({ id: sessionId });

    if (!gameSession) {
      return res.status(404).json({ message: "Game session not found" });
    }

    const userIndex = gameSession.users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found in session" });
    }

    // Mark user as inactive instead of removing
    gameSession.users[userIndex].isActive = false;
    await gameSession.save();

    return res.status(200).json({
      message: "Left game session successfully",
      gameSession,
    });
  } catch (error) {
    console.error("Error leaving game session:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

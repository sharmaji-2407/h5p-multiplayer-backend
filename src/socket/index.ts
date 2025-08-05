import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { GameAction, WebSocketEvents } from "../types";
import GameSessionModel from "../models/GameSession";
import config from "../config";

export default (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin,
      methods: ["GET", "POST"],
    },
  });

  // Map to track which users are in which game sessions
  const userSessionMap = new Map<string, string>();

  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on(
      WebSocketEvents.JOIN_GAME,
      async ({ sessionId, userId, userName }) => {
        try {
          if (!sessionId || !userId || !userName) {
            socket.emit(WebSocketEvents.ERROR, {
              message: "Missing required fields",
            });
            return;
          }

          // Find the game session
          const gameSession = await GameSessionModel.findOne({ id: sessionId });

          if (!gameSession) {
            socket.emit(WebSocketEvents.ERROR, {
              message: "Game session not found",
            });
            return;
          }

          // Join the socket room for this game session
          socket.join(sessionId);

          // Track which session this user is in
          userSessionMap.set(socket.id, sessionId);

          // Check if user already exists
          const existingUserIndex = gameSession.users.findIndex(
            (user) => user.id === userId
          );

          if (existingUserIndex !== -1) {
            // Update existing user to active
            gameSession.users[existingUserIndex].isActive = true;
          } else {
            // Add new user
            gameSession.users.push({
              id: userId,
              name: userName,
              isActive: true,
            });
          }

          await gameSession.save();

          // Notify everyone in the room that a user has joined
          io.to(sessionId).emit(WebSocketEvents.USER_JOINED, {
            userId,
            userName,
            gameSession,
          });

          // Send the current game state to the joining user
          socket.emit(WebSocketEvents.GAME_STATE_UPDATE, {
            gameState: gameSession.gameState,
            users: gameSession.users,
          });

          console.log(
            `User ${userName} (${userId}) joined game session ${sessionId}`
          );
        } catch (error) {
          console.error("Error in JOIN_GAME event:", error);
          socket.emit(WebSocketEvents.ERROR, {
            message: "Internal server error",
          });
        }
      }
    );

    socket.on(WebSocketEvents.GAME_ACTION, async (action: GameAction) => {
      try {
        const { gameSessionId, userId, type, payload } = action;

        if (!gameSessionId || !userId || !type) {
          socket.emit(WebSocketEvents.ERROR, {
            message: "Invalid game action",
          });
          return;
        }

        const gameSession = await GameSessionModel.findOne({
          id: gameSessionId,
        });

        if (!gameSession) {
          socket.emit(WebSocketEvents.ERROR, {
            message: "Game session not found",
          });
          return;
        }

        // Process the action and update game state
        // This is where you would implement game-specific logic
        switch (type) {
          case "MOVE":
            // Handle move action
            if (gameSession.gameState.currentTurn !== userId) {
              socket.emit(WebSocketEvents.ERROR, { message: "Not your turn" });
              return;
            }

            // Update game state based on the move
            gameSession.gameState = {
              ...gameSession.gameState,
              ...payload,
              lastAction: { type, userId, payload },
              // Find the next active user for turn
              currentTurn:
                gameSession.users
                  .filter((user) => user.isActive && user.id !== userId)
                  .map((user) => user.id)[0] || userId,
            };
            break;

          case "CHAT":
            // Handle chat message
            if (!gameSession.gameState.messages) {
              gameSession.gameState.messages = [];
            }
            gameSession.gameState.messages.push({
              userId,
              userName: gameSession.users.find((user) => user.id === userId)
                ?.name,
              message: payload.message,
              timestamp: new Date(),
            });
            break;

          default:
            // For any other action, just store it in the game state
            gameSession.gameState = {
              ...gameSession.gameState,
              ...payload,
              lastAction: { type, userId, payload },
            };
        }

        await gameSession.save();

        // Broadcast the updated game state to all users in the session
        io.to(gameSessionId).emit(WebSocketEvents.GAME_STATE_UPDATE, {
          gameState: gameSession.gameState,
          users: gameSession.users,
          lastAction: { type, userId, payload },
        });

        console.log(
          `Game action processed: ${type} by user ${userId} in session ${gameSessionId}`
        );
      } catch (error) {
        console.error("Error in GAME_ACTION event:", error);
        socket.emit(WebSocketEvents.ERROR, {
          message: "Internal server error",
        });
      }
    });

    socket.on(WebSocketEvents.LEAVE_GAME, async ({ sessionId, userId }) => {
      try {
        if (!sessionId || !userId) {
          socket.emit(WebSocketEvents.ERROR, {
            message: "Missing required fields",
          });
          return;
        }

        const gameSession = await GameSessionModel.findOne({ id: sessionId });

        if (!gameSession) {
          socket.emit(WebSocketEvents.ERROR, {
            message: "Game session not found",
          });
          return;
        }

        // Find the user in the session
        const userIndex = gameSession.users.findIndex(
          (user) => user.id === userId
        );

        if (userIndex !== -1) {
          // Mark user as inactive
          gameSession.users[userIndex].isActive = false;
          await gameSession.save();

          // Remove from socket room
          socket.leave(sessionId);

          // Remove from tracking map
          userSessionMap.delete(socket.id);

          // Notify others that user has left
          io.to(sessionId).emit(WebSocketEvents.USER_LEFT, {
            userId,
            userName: gameSession.users[userIndex].name,
            gameSession,
          });

          console.log(`User ${userId} left game session ${sessionId}`);
        }
      } catch (error) {
        console.error("Error in LEAVE_GAME event:", error);
        socket.emit(WebSocketEvents.ERROR, {
          message: "Internal server error",
        });
      }
    });

    socket.on("disconnect", async () => {
      try {
        const sessionId = userSessionMap.get(socket.id);

        if (sessionId) {
          // Find the game session
          const gameSession = await GameSessionModel.findOne({ id: sessionId });

          if (gameSession) {
            // Since we don't know the userId directly from the socket,
            // we can't mark a specific user as inactive
            // This would be better handled with authentication
            console.log(
              `Socket ${socket.id} disconnected from session ${sessionId}`
            );
          }

          // Remove from tracking map
          userSessionMap.delete(socket.id);
        }

        console.log(`Socket disconnected: ${socket.id}`);
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });
  });

  return io;
};

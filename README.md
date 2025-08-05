# H5P Multiplayer Backend

This is a backend service for enabling multiplayer functionality in H5P games. It provides WebSocket-based communication for real-time game state synchronization between players.

## Features

- Real-time game state synchronization via WebSocket
- RESTful API for game session management
- MongoDB integration for persistent game sessions
- Support for multiple concurrent game sessions
- Player management (join/leave)

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Configure environment variables:

   - Create a `.env` file with the following variables:
     ```
     PORT=3001
     MONGO_URI=mongodb://localhost:27017/h5p-multiplayer
     CORS_ORIGIN=http://localhost:5173
     ```

3. Start MongoDB (ensure MongoDB is installed and running)

4. Run the development server:
   ```
   npm run dev
   ```

## API Endpoints

- `POST /api/sessions` - Create a new game session
- `POST /api/sessions/:sessionId/join` - Join an existing game session
- `GET /api/sessions/:sessionId` - Get game session details
- `PUT /api/sessions/:sessionId/state` - Update game state
- `POST /api/sessions/:sessionId/leave` - Leave a game session

## WebSocket Events

- `join_game` - Join a game session
- `leave_game` - Leave a game session
- `game_action` - Send a game action
- `game_state_update` - Receive game state updates
- `user_joined` - Notification when a user joins
- `user_left` - Notification when a user leaves
- `error` - Error notifications

## Integration with H5P Games

This backend is designed to work with H5P games that use the postMessage API for communication. It relays game actions between players and maintains a synchronized game state.

## Dummy Users

For testing purposes, the system includes dummy users that can be used to simulate multiplayer interactions without requiring actual user authentication.

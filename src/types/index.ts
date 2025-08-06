export interface User {
  id: string;
  name?: string;
  email: string;
  password: string;
  isActive: boolean;
  gameData?: any;
}

export interface GameUser {
  id: string;
  email: string;
  isActive: boolean;
}

export interface GameSession {
  id: string;
  gameId: string;
  users: GameUser[];
  gameState: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameAction {
  type: string;
  payload: any;
  userId: string;
  gameSessionId: string;
}

export enum WebSocketEvents {
  JOIN_GAME = "join_game",
  LEAVE_GAME = "leave_game",
  GAME_ACTION = "game_action",
  GAME_STATE_UPDATE = "game_state_update",
  USER_JOINED = "user_joined",
  USER_LEFT = "user_left",
  ERROR = "error",
}

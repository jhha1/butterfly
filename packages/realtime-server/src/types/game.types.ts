export interface Position {
  x: number;
  y: number;
}

export interface PlayerAction {
  playerId: string;
  playerIndex: number; // 0-10 (11명 선수 중 하나)
  action: 'move' | 'kick' | 'tackle' | 'pass';
  position?: Position;
  targetPosition?: Position;
  timestamp: number;
}

export interface Player {
  id: string;
  clientId: string;
  team: 'player1' | 'player2';
  joinedAt: number;
}

export interface GameState {
  status: 'waiting' | 'playing' | 'paused' | 'ended';
  startTime: number;
  endTime: number;
  score: {
    player1: number;
    player2: number;
  };
  ball: Position;
  players: {
    player1: Position[];
    player2: Position[];
  };
  lastUpdate: number;
}

export interface GameRoom {
  id: string;
  players: Player[];
  gameState?: GameState;
  createdAt: number;
  maxPlayers: number;
}

export interface GameResult {
  roomId: string;
  players: string[];
  score: {
    player1: number;
    player2: number;
  };
  endReason: string;
  duration: number;
  timestamp: number;
}

export interface CreateRoomRequest {
  player1Id: string;
  player2Id: string;
  matchId: string;
  roomId: string;
}

export interface CreateRoomResponse {
  status: {
    code: number;
    message: string;
  };
  roomId: string;
  connectionUrl: string; // WebSocket 연결 URL
} 
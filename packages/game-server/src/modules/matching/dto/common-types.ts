// base.proto에서 정의된 공통 타입들
export interface ResponseStatus {
  code: number;
  message?: string;
  timestamp: number;
}

// matching.proto에서 정의된 타입
export interface Candidate {
  playerId: string;
  profile: string;
  extraInfo: string;
  latency: number;
}

// 룸 정보 타입 (matching.proto의 RoomInfo에 대응)
export interface RoomInfo {
  roomId: string;
  matchId: string;
  socketUrl: string;
  player1Id: string;
  player2Id: string;
  createdAt: number;
  maxPlayers: number;
  gameMode: string;
} 
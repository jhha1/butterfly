import { Injectable } from '@nestjs/common';
import { GameRoom, Player, GameResult } from '../../types/game.types';
import { ClientService } from '../client/client.service';
import { RedisCacheService } from '../../datasource';

@Injectable()
export class RoomService {
  private readonly instanceId = Math.random().toString(36).substr(2, 9);
  private rooms: Map<string, GameRoom> = new Map();
  private playerRoomMap: Map<string, string> = new Map(); // clientId -> roomId
  private playerIdMap: Map<string, string> = new Map(); // clientId -> playerId

  constructor(
    private readonly clientService: ClientService,
    private readonly redisCacheService: RedisCacheService,
  ) {
    console.log(`🏠 RoomService instance created: ${this.instanceId}`);
  }

  // outgame에서 gRPC로 호출하는 룸 생성 (IngameController에서 호출)
  async createRoomByGrpc(roomId: string, player1Id: string, player2Id: string): Promise<GameRoom> {
    const room: GameRoom = {
      id: roomId,
      players: [],
      createdAt: Date.now(),
      maxPlayers: 2,
    };

    const redisClient = this.redisCacheService.getClient();
    await redisClient.setEx(`realtime_room:${roomId}`, 3600, JSON.stringify(room)); // 1시간 TTL
    
    return room;
  }

  async joinRoom(roomId: string, playerId: string, clientId: string): Promise<GameRoom | null> {
    try {
      const redisClient = this.redisCacheService.getClient();
      const roomData = await redisClient.get(`realtime_room:${roomId}`);
      if (!roomData) {
        console.error(`[${this.instanceId}] Room not found in Redis: ${roomId}`);
        return null;
      }

      const room: GameRoom = JSON.parse(roomData);
      
      if (room.players.length >= room.maxPlayers) {
        console.error(`Room is full: ${roomId}`);
        return null;
      }

      const existingPlayer = room.players.find(p => p.id === playerId);
      if (!existingPlayer) {
         // 새 플레이어 추가
        const player: Player = {
          id: playerId,
          clientId,
          team: room.players.length === 0 ? 'player1' : 'player2',
          joinedAt: Date.now(),
        };

        room.players.push(player);
        this.playerRoomMap.set(clientId, roomId);
        this.playerIdMap.set(clientId, playerId);
      }

      this.rooms.set(roomId, room!); // 메모리에 저장

      console.log(`Player joined: ${playerId} in room: ${roomId}`);
      return room;
    } catch (error) {
      console.error(`[${this.instanceId}] Redis error:`, error);
      return null;
    }
  }

  async handlePlayerDisconnect(clientId: string): Promise<void> {
    const roomId = this.playerRoomMap.get(clientId);
    if (!roomId) {
      return;
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }

    const playerId = this.playerIdMap.get(clientId);
    if (!playerId) {
      return;
    }

    // 플레이어 정리
    this.playerRoomMap.delete(clientId);
    this.playerIdMap.delete(clientId);

    // 게임 중이었다면 게임 종료 처리
    if (room.gameState && room.gameState.status === 'playing') {
      const otherPlayer = room.players.find(p => p.id !== playerId);
      if (otherPlayer) {
        const gameResult: GameResult = {
          roomId: room.id,
          players: room.players.map(p => p.id),
          score: room.gameState.score,
          endReason: 'player_disconnected',
          duration: Date.now() - room.gameState.startTime,
          timestamp: Date.now(),
        };

        // outgame에 결과 전송
        await this.clientService.sendGameResult(gameResult);
      }
    }

    // 룸에 플레이어가 없으면 룸 삭제
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      console.log(`Room deleted: ${roomId}`);
    }

    console.log(`Player disconnected: ${playerId} from room: ${roomId}`);
  }

  async endGame(roomId: string, gameResult: GameResult): Promise<void> {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }

    if (room.gameState) {
      room.gameState.status = 'ended';
    }

    // 일정 시간 후 룸 삭제
    setTimeout(() => {
      this.rooms.delete(roomId);
      console.log(`Room deleted after game end: ${roomId}`);
    }, 60000); // 1분 후 삭제

    console.log(`Game ended in room: ${roomId}`);
  }

  getRoomByClientId(clientId: string): GameRoom | null {
    const roomId = this.playerRoomMap.get(clientId);
    if (!roomId) {
      return null;
    }

    return this.rooms.get(roomId) || null;
  }

  getRoomById(roomId: string): GameRoom | null {
    return this.rooms.get(roomId) || null;
  }

  getAllRooms(): GameRoom[] {
    return Array.from(this.rooms.values());
  }

  getActiveRoomsCount(): number {
    return this.rooms.size;
  }
}
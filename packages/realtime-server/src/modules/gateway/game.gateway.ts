import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { PlayService } from '../play/play.service';
import { RoomService } from '../room/room.service';

// WebSocket 메시지 인터페이스 (protobuf 기반)
interface PlayerPosition {
  playerIndex: number; // 0-10 (11명 플레이어)
  position: {
    x: number;
    y: number;
    z: number;
  };
  action: string; // "run", "kick", "pass", "idle"
  speed: number;
}

interface SendStatusRequest {
  roomId: string;
  playerId: string;
  players: PlayerPosition[];
  timestamp: number;
}

interface SendStatusResponse {
  roomId: string;
  players: PlayerPosition[];
  timestamp: number;
  status: string; // "success", "error"
  message?: string;
}

interface JoinRoomRequest {
  roomId: string;
  playerId: string;
  playerToken: string;
}

interface JoinRoomResponse {
  success: boolean;
  message: string;
  room?: {
    roomId: string;
    playerCount: number;
    playerIds: string[];
    status: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  // protobuf 지원을 위한 adapter 설정
  adapter: undefined, // 기본 adapter 사용
})
@Injectable()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;
  
  private readonly logger = new Logger(GameGateway.name);
  
  // 플레이어 상태를 캐시하여 0.3초 간격으로 브로드캐스트 (임시. TODO. 변화량만 서버 검증후 전송)
  private playerStatusCache: Map<string, SendStatusRequest> = new Map();
  private broadcastInterval?: NodeJS.Timeout;

  constructor(
    private readonly playService: PlayService,
    private readonly roomService: RoomService,
  ) {
    // 0.3초 간격으로 플레이어 상태 브로드캐스트
    this.startStatusBroadcast();
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    await this.roomService.handlePlayerDisconnect(client.id);
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomRequest,
  ) {
    try {
      const room = await this.roomService.joinRoom(data.roomId, data.playerId, client.id);
      
      if (room) {
        client.join(data.roomId);
        
        const response: JoinRoomResponse = {
          success: true,
          message: 'Successfully joined room',
          room: {
            roomId: room.id,
            playerCount: room.players.length,
            playerIds: room.players.map(p => p.id),
            status: room.gameState?.status || 'waiting',
          },
        };

        // 룸에 플레이어 참가 알림
        this.server.to(data.roomId).emit('player_joined', {
          playerId: data.playerId,
          playerCount: room.players.length,
        });

        // 게임 시작 가능한지 확인 (2명 모두 접속시)
        if (room.players.length === 2 && !room.gameState) {
          await this.playService.startGame(room);
          this.server.to(data.roomId).emit('game_start', {
            gameState: room.gameState,
            players: room.players,
          });
        }

        client.emit('join_room_response', response);
      } else {
        const response: JoinRoomResponse = {
          success: false,
          message: 'Room not found or full',
        };
        client.emit('join_room_response', response);
      }
    } catch (error) {
      const response: JoinRoomResponse = {
        success: false,
        message: (error as Error).message,
      };
      client.emit('join_room_response', response);
    }
  }

  @SubscribeMessage('send_status')
  async handleSendStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendStatusRequest,
  ) {
    try {
      const room = this.roomService.getRoomByClientId(client.id);
      if (!room) {
        const errorResponse: SendStatusResponse = {
          roomId: data.roomId,
          players: [],
          timestamp: Date.now(),
          status: 'error',
          message: 'Room not found',
        };
        client.emit('send_status_error', errorResponse);
        return;
      }

      // 기본 검증
      if (room.gameState?.status !== 'playing') {
        const errorResponse: SendStatusResponse = {
          roomId: data.roomId,
          players: [],
          timestamp: Date.now(),
          status: 'error',
          message: 'Game is not in playing state',
        };
        client.emit('send_status_error', errorResponse);
        return;
      }

      // 플레이어 위치 검증
      if (!this.validatePlayerPositions(data.players)) {
        const errorResponse: SendStatusResponse = {
          roomId: data.roomId,
          players: [],
          timestamp: Date.now(),
          status: 'error',
          message: 'Invalid player positions',
        };
        client.emit('send_status_error', errorResponse);
        return;
      }

      // 플레이어 상태를 캐시에 저장 (0.3초 간격으로 브로드캐스트됨)
      const cacheKey = `${data.roomId}_${data.playerId}`;
      this.playerStatusCache.set(cacheKey, {
        ...data,
        timestamp: Date.now(),
      });

      // 성공 응답
      const successResponse: SendStatusResponse = {
        roomId: data.roomId,
        players: data.players,
        timestamp: Date.now(),
        status: 'success',
      };
      client.emit('send_status_ack', successResponse);

    } catch (error) {
      this.logger.error('Error handling send_status:', error);
      const errorResponse: SendStatusResponse = {
        roomId: data.roomId,
        players: [],
        timestamp: Date.now(),
        status: 'error',
        message: 'Internal server error',
      };
      client.emit('send_status_error', errorResponse);
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: Date.now() });
  }

  private startStatusBroadcast() {
    this.broadcastInterval = setInterval(() => {
      this.broadcastPlayerStatus();
    }, 300); // 0.3초 간격
  }

  private broadcastPlayerStatus() {
    const roomPlayerMap: Map<string, SendStatusRequest[]> = new Map();

    // 룸별로 플레이어 상태 그룹화
    for (const [cacheKey, statusData] of this.playerStatusCache) {
      const roomId = statusData.roomId;
      if (!roomPlayerMap.has(roomId)) {
        roomPlayerMap.set(roomId, []);
      }
      roomPlayerMap.get(roomId)!.push(statusData);
    }

    // 각 룸에 플레이어 상태 브로드캐스트
    for (const [roomId, playerStatuses] of roomPlayerMap) {
      const combinedPlayers: PlayerPosition[] = [];
      
      // 모든 플레이어의 위치 정보 결합
      for (const status of playerStatuses) {
        combinedPlayers.push(...status.players);
      }

      const broadcastData: SendStatusResponse = {
        roomId,
        players: combinedPlayers,
        timestamp: Date.now(),
        status: 'broadcast',
      };

      this.server.to(roomId).emit('status_update', broadcastData);
    }

    // 캐시 클리어 (다음 0.3초를 위해)
    this.playerStatusCache.clear();
  }

  private validatePlayerPositions(players: PlayerPosition[]): boolean {
    const FIELD_WIDTH = 1000;
    const FIELD_HEIGHT = 600;
    const MAX_HEIGHT = 10;

    for (const player of players) {
      // 플레이어 인덱스 검증 (0-10)
      if (player.playerIndex < 0 || player.playerIndex > 10) {
        return false;
      }

      // 위치 범위 검증
      const { x, y, z } = player.position;
      if (x < 0 || x > FIELD_WIDTH || y < 0 || y > FIELD_HEIGHT || z < 0 || z > MAX_HEIGHT) {
        return false;
      }

      // 속도 검증
      if (player.speed < 0 || player.speed > 20) { // 최대 속도 제한
        return false;
      }
    }

    return true;
  }

  onModuleDestroy() {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
    }
  }
} 
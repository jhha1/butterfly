import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RoomService } from './room.service';
import { CreateRoomRequest, CreateRoomResponse } from '../../types/game.types';

@Controller()
export class RoomController {
  private readonly logger = new Logger(RoomController.name);
  
  constructor(private readonly roomService: RoomService) {}

  @GrpcMethod('IngameService', 'CreateRoom')
  async createRoom(request: CreateRoomRequest): Promise<CreateRoomResponse> {
    try {
      this.logger.log('Received create room request from outgame:', request);
      this.logger.log('Request fields:', {
        player1Id: request.player1Id,
        player2Id: request.player2Id,
        matchId: request.matchId,
        roomId: request.roomId,
        hasRoomId: !!request.roomId
      });
      
      // 룸 생성
      const room = await this.roomService.createRoomByGrpc(
        request.roomId,
        request.player1Id,
        request.player2Id
      );

      return {
        status: {
          code: 0,
          message: 'Room created successfully',
        },
        roomId: room.id,
        connectionUrl: `http://localhost:3001`, // WebSocket 연결 URL. TODO: 쿠버네티스 환경에서 동일 pod으로 연결되도록 수정 필요  
      };
    } catch (error) {
      this.logger.error('Error creating room:', error);
      return {
        status: {
          code: 1,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        roomId: '',
        connectionUrl: '',
      };
    }
  }

  @GrpcMethod('IngameService', 'GetRoomInfo')
  async getRoomInfo(request: { roomId: string }): Promise<{ status: { code: number; message: string }; roomId: string; playerCount: number; gameStatus: string }> {
    const room = this.roomService.getRoomById(request.roomId);
    if (!room) {
      return { 
        status: { code: 1, message: 'Room not found' },
        roomId: request.roomId, 
        playerCount: 0, 
        gameStatus: 'not_found' 
      };
    }

    return {
      status: { code: 0, message: 'Success' },
      roomId: room.id,
      playerCount: room.players.length,
      gameStatus: room.gameState ? room.gameState.status : 'waiting',
    };
  }
}
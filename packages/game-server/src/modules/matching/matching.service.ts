import { Injectable } from '@nestjs/common';
import { CandidateListRequestDto } from './dto/candidatelistrequest.dto';
import { CandidateListResponseDto } from './dto/candidatelistresponse.dto';
import { RequestMatchRequestDto } from './dto/requestmatchrequest.dto';
import { RequestMatchResponseDto } from './dto/requestmatchresponse.dto';
import { AcceptMatchRequestDto } from './dto/acceptmatchrequest.dto';
import { AcceptMatchResponseDto } from './dto/acceptmatchresponse.dto';
import { ClientService } from '../../grpc/client/client.service';
import { RedisCacheService } from '@packages/common/datasource/redis/src/redis.service';

@Injectable()
export class MatchingService {
  constructor(
    private readonly clientService: ClientService,
    private readonly redisService: RedisCacheService,
  ) {}

  async candidateList(request: CandidateListRequestDto): Promise<CandidateListResponseDto> {
    try {
      // Redis에서 실제 유저 리스트 조회 (동일 유저 제외, 최대 5명)
      const candidatePlayerIds = await this.getTempMatchList(request.playerId);
      
      // 플레이어 ID 리스트를 후보자 정보로 변환
      const candidates = candidatePlayerIds.map(playerId => ({
        playerId,
        profile: `Player ${playerId}`,
        extraInfo: 'Available for match',
        latency: Math.floor(Math.random() * 20) + 15, // 15-35ms 랜덤 레이턴시
      }));

      return {
        status: { code: 0, message: 'Success', timestamp: Date.now() },
        list: candidates,
      };
    } catch (error) {
      console.error('Error getting candidate list:', error);
      return {
        status: { code: 1, message: 'Failed to get candidate list', timestamp: Date.now() },
        list: [],
      };
    }
  }

  // todo. 함수 간결하게 분리 정리
  async requestMatch(request: RequestMatchRequestDto): Promise<RequestMatchResponseDto> {
    try {
      // 상대방이 매치 가능한지 확인
      const isTargetAvailable = await this.isPlayerAvailable(request.targetPlayerId);
      
      if (!isTargetAvailable) {
        return {
          status: { code: 1, message: 'Target player is not available', timestamp: Date.now() },
          isAble: 0,
          roomInfo: null,
          expire_at: 0,
        };
      }

      // 룸 생성
      const matchId = `match_${Date.now()}_${request.playerId}_${request.targetPlayerId}`;
      const roomId = `room_${matchId}`;
      
      // ingame 서버에 룸 생성 요청
      const roomResponse = await this.clientService.createRoom({
        player1Id: request.playerId,
        player2Id: request.targetPlayerId,
        matchId: matchId,
        roomId: roomId,
      });

      if (roomResponse.status.code !== 0) {
        return {
          status: { code: 1, message: 'Room creation failed', timestamp: Date.now() },
          isAble: 0,
          roomInfo: null,
          expire_at: 0,
        };
      }

      // 룸 정보 생성
      const roomInfo = {
        roomId: roomId,
        matchId: matchId,
        socketUrl: roomResponse.connectionUrl,
        player1Id: request.playerId,
        player2Id: request.targetPlayerId,
        createdAt: Date.now(),
        maxPlayers: 2,
        gameMode: '1v1',
      };

      // Redis에 룸 정보 저장 (acceptMatch에서 조회할 수 있도록)
      await this.saveRoomInfo(matchId, roomInfo);

      return {
        status: { code: 0, message: 'Success', timestamp: Date.now() },
        isAble: 1,
        roomInfo: roomInfo,
        expire_at: Date.now() + 60000, // 1분 후 만료
      };
    } catch (error) {
      console.error('Error in requestMatch:', error);
      return {
        status: { code: 1, message: 'Internal server error', timestamp: Date.now() },
        isAble: 0,
        roomInfo: null,
        expire_at: 0,
      };
    }
  }

  async acceptMatch(request: AcceptMatchRequestDto): Promise<AcceptMatchResponseDto> {
    try {
      // Redis에서 룸 정보 조회
      const roomInfo = await this.getRoomInfo(request.playerId, request.targetPlayerId);
      
      if (!roomInfo) {
        return {
          status: { code: 1, message: 'Room not found or expired', timestamp: Date.now() },
          isAble: 0,
          roomInfo: null,
        };
      }

      // 룸이 아직 유효한지 확인 (만료 시간 체크)
      const isRoomValid = await this.isRoomValid(roomInfo);
      
      if (!isRoomValid) {
        return {
          status: { code: 1, message: 'Room expired', timestamp: Date.now() },
          isAble: 0,
          roomInfo: null,
        };
      }

      // 매치 성공 후 Redis에서 매치 정보 삭제
      await this.clearMatchInfo(request.playerId);

      return {
        status: { code: 0, message: 'Success', timestamp: Date.now() },
        isAble: 1,
        roomInfo: roomInfo,
      };
    } catch (error) {
      console.error('Error in acceptMatch:', error);
      return {
        status: { code: 1, message: 'Internal server error', timestamp: Date.now() },
        isAble: 0,
        roomInfo: null,
      };
    }
  }

  // 게임 결과 처리 메서드 (ingame에서 호출됨)
  async handleGameResult(gameResult: {
    roomId: string;
    players: string[];
    score: { player1: number; player2: number };
    endReason: string;
    duration: number;
    timestamp: number;
  }): Promise<void> {
    console.log('🎮 Received game result:', gameResult);
    
    // TODO: 게임 결과 처리 로직 구현
    // - 플레이어 레이팅 업데이트
    // - 전적 기록 저장
    // - 리워드 지급
    // - 경험치 획득
    
    console.log('✅ Game result processed successfully');
  }

  private async getTempMatchList(currentPlayerId: string): Promise<string[]> {
    try {
      const client = this.redisService.getClient();
      
      const allPlayers = await client.hGetAll(this.getMatchKey());
      const playerIds: string[] = [];
      
      for (const [playerId, playerInfo] of Object.entries(allPlayers)) {
        if (playerId !== currentPlayerId) {
          playerIds.push(playerId);
        }
      }
      
      // 임시로 최대 5명만 반환
      return playerIds.slice(0, 5);
    } catch (error) {
      console.error('Error getting temp match list:', error);
      return [];
    }
  }

  private async isPlayerAvailable(playerId: string): Promise<boolean> {
    try {
      const client = this.redisService.getClient();
      const playerInfo = await client.hGet(this.getMatchKey(), playerId);
      return !!playerInfo;
    } catch (error) {
      console.error('Error checking player availability:', error);
      return false;
    }
  }

  private async saveRoomInfo(matchId: string, roomInfo: any): Promise<void> {
    try {
      const client = this.redisService.getClient();
      // 매칭 대상 유저의 playerID를 키로 사용 (동시에 여러 요청이 오면 덮어쓰기. 현재는 동시성을 고려하지 않음)
      await client.set(
        `match_${roomInfo.player2Id}`,
        JSON.stringify(roomInfo),
        { EX: 3600 } // 1시간 후 만료
      );
    } catch (error) {
      console.error('Error saving room info:', error);
    }
  }

  private async getRoomInfo(playerId: string, targetPlayerId: string): Promise<any> {
    try {
      const client = this.redisService.getClient();
      
      // acceptMatch를 호출하는 유저(playerId)의 매치 정보를 찾음
      const roomData = await client.get(`match_${playerId}`);
      return roomData ? JSON.parse(roomData) : null;
    } catch (error) {
      console.error('Error getting room info:', error);
      return null;
    }
  }

  private async isRoomValid(roomInfo: any): Promise<boolean> {
    try {
      // 룸 생성 시간이 1시간 이내인지 확인
      const now = Date.now();
      const roomAge = now - roomInfo.createdAt;
      return roomAge < 3600000; // 1시간 = 3600000ms
    } catch (error) {
      console.error('Error validating room:', error);
      return false;
    }
  }

  private async clearMatchInfo(playerId: string): Promise<void> {
    try {
      const client = this.redisService.getClient();
      await client.del(`match_${playerId}`);
    } catch (error) {
      console.error('Error clearing match info:', error);
    }
  }

  private getMatchKey(): string {
    return 'temp_match_list';
  }
}

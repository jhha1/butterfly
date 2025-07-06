import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '@packages/common/datasource/';
import { LobbyRefreshRequestDto } from './dto/lobby-refresh-request.dto';
import { LobbyRefreshResponseDto } from './dto/lobby-refresh-response.dto';

@Injectable()
export class LobbyService {
  constructor(
    private readonly redisService: RedisCacheService,
  ) {}

  async lobbyRefresh(request: LobbyRefreshRequestDto): Promise<LobbyRefreshResponseDto> {
    try {
      const { playerId } = request;

      const client = this.redisService.getClient();

      // 매치 정보 확인 (본인 playerID로 매치 요청이 있는지 확인)
      const matchInfo = await this.getMatchInfo(playerId);

      if (matchInfo) {
        // 매치 정보가 있는 경우 - 누군가가 이 플레이어에게 매치 요청을 보냈음. 
        // 지금은 동시성을 고려하지 않고 한명만 요청 보낸다 가정. 추후 요청리스트를 응답하고 유저가 그 중 한명만 수락하는 방식으로 변형가능
        return {
          status: {
            code: 0,
            message: 'Match request found',
            timestamp: Date.now(),
          },
          newInfo: ``,
          matchInfo: matchInfo,
        };
      } else {
        // 매치 정보가 없는 경우 - 일반적인 로비 갱신 처리
        const playerInfo = {
          playerId,
          timestamp: Date.now(),
        };
        
        // 임시로 조건없이 매칭리스트에 추가
        // 실서비스에서는 기획 조건 + 저지연 플레이를 위한 레이턴시 혹은 지역 기반 매칭 조건 추가 필요
        await client.hSet(this.getMatchKey(), playerId, JSON.stringify(playerInfo));
        
        return {
          status: {
            code: 0,
            message: 'Success',
            timestamp: Date.now(),
          },
          newInfo: ``,
        };
      }
    } catch (error) {
      return {
        status: {
          code: 1,
          message: 'Failed to refresh lobby',
          timestamp: Date.now(),
        },
        newInfo: '',
      };
    }
  }

  private async getMatchInfo(playerId: string): Promise<any> {
    try {
      const client = this.redisService.getClient();
      const matchData = await client.get(`match_${playerId}`);
      return matchData ? JSON.parse(matchData) : null;
    } catch (error) {
      console.error('Error getting match info:', error);
      return null;
    }
  }

  private getMatchKey(): string {
    return 'temp_match_list';
  }
}
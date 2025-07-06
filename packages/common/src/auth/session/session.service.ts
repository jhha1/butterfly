import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RedisCacheService } from '../../datasource';
import { RedisClientType } from 'redis';
import { ulid } from 'ulid';

export interface SessionData {
  accountId: string;
  playerId: string;
  [key: string]: any;
}

@Injectable()
export class SessionService {
  private client: RedisClientType;
  private readonly TTL_SECONDS = 3600; // 1시간

  constructor(
    private readonly redisCache: RedisCacheService,
  ) {
    this.client = this.redisCache.getClient();
  }

  /**
   * 세션 생성 (슬라이딩 TTL 포함)
   */
  async createSession(data: SessionData): Promise<string> {
    const sessionId = ulid();

    await this.client.set(
      `session:${sessionId}`,
      JSON.stringify(data),
      { EX: this.TTL_SECONDS },
    );

    return sessionId;
  }

  /**
   * 세션 조회
   */
  async get(sessionId: string): Promise<SessionData> {
    const raw = await this.client.get(`session:${sessionId}`);
    if (!raw) throw new UnauthorizedException('세션이 유효하지 않습니다.');
    return JSON.parse(raw) as SessionData;
  }

  /**
   * 세션 TTL 갱신
   */
  async touch(sessionId: string): Promise<void> {
    await this.client.expire(`session:${sessionId}`, this.TTL_SECONDS);
  }

  /**
   * 세션 데이터 저장/업데이트
   */
  async set(sessionId: string, data: SessionData): Promise<void> {
    await this.client.set(
      `session:${sessionId}`,
      JSON.stringify(data),
      { EX: this.TTL_SECONDS },
    );
  }
}

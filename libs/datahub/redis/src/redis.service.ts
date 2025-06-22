import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  /*
    단일 커넥션 논블로킹 I/O 사용
    일반적인 게임에서, 비지니스 로직에서의 redis 사용방법에 따라 몇백 ~ 1만 QPS 까지는, 단일커넥션으로 커버 가능  

    다만, 아래 케이스는 커넥션 풀을 사용한다
      1. Pub/Sub 전용 커넥션 추가되는 경우
      2. 레디스 클러스터 환경에서 샤드 별 커넥션 라우팅 시 
      3. 블로킹 명령어 쓰는 경우 (BLPOP, BRPOPLPUSH)
      4. QPS가 수만이 넘어가거나 응답성이 매우 중요한 경우
  */
  constructor() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: +(process.env.REDIS_PORT ?? 3306),
        // 재연결 전략: 실패 횟수에 비례해 지연을 늘리고 최대 2초
        reconnectStrategy: (retries: number) => Math.min(retries * 100, 2000),
      },
      database: +(process.env.REDIS_DB_INDEX ?? 0),
    });

    this.client.on('error', err => {
      console.error('[RedisCacheService] Redis Error', err);
    });
  }

  // NestJS 모듈 초기화 시점에 연결  
  async onModuleInit() {
    await this.client.connect();
  }

  // 앱 종료 시점에 연결 해제  
  async onModuleDestroy() {
    await this.client.disconnect();
  }

  getClient(): RedisClientType {
    return this.client;
  }
}

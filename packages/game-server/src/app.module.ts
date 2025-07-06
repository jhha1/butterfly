import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GameExceptionFilter } from './common/filters/game-exception.filter';
import { SessionGuard } from './common/guards/session.guard';
import { SessionModule } from '@packages/common/auth/session/session.module';
import { AuthModule } from './modules/auth/auth.module';
import { MatchingModule } from './modules/matching/matching.module';
import { LobbyModule } from './modules/lobby/lobby.module';
import { ClientModule } from './grpc/client/client.module';
import { RedisCacheModule } from '@packages/common/datasource/redis/src/redis.module';

@Module({
  imports: [
    RedisCacheModule,
    ClientModule.forRoot(),
    SessionModule,
    AuthModule,
    MatchingModule,
    LobbyModule,
  ],
  providers: [
    // 전역 예외 필터
    {
      provide: APP_FILTER,
      useClass: GameExceptionFilter,
    },
      // 전역 가드: 모든 RPC 요청에 SessionGuard가 자동 적용
      {
        provide: APP_GUARD,
        useClass: SessionGuard,
      },
  ],
})
export class AppModule {}

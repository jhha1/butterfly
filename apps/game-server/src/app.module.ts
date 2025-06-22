import { Module } from '@nestjs/common';
import { DbModule } from '@libs/datahub';
import { SessionModule } from '@libs/auth';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GameExceptionFilter } from './common/filters/game-exception.filter';
import { SessionGuard } from './common/guards/session.guard';


@Module({
  imports: [
    DbModule,
    SessionModule,
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

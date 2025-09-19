import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisCacheModule } from '@packages/game-server/datasource/redis/redis.module';
import { DbModule } from '../../datasource/db/db.module';
import { SessionGuard } from '../../common/guards/session.guard';
import { AuthEntities }   from './entities';
import { PlayerModule } from '../player/player.module';
import { AccountService } from './account.service';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    DbModule,
    RedisCacheModule,
    PlayerModule,
    TypeOrmModule.forFeature(AuthEntities),
    SessionModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AccountService, SessionGuard],
})
export class AuthModule {}

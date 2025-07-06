import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisCacheModule, DbModule } from '../../../../common/src/datasource';
import { SessionGuard } from '../../common/guards/session.guard';
import { AuthEntities }   from './entities';
import { PlayerModule } from '../player/player.module';
import { AccountService } from './account.service';
import { SessionModule } from '../../../../common/src/auth/session/session.module';

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

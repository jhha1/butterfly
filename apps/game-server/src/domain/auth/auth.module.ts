import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisCacheModule, DbModule } from '@libs/datahub';
import { SessionGuard } from '../../common/guards/session.guard';
import { AuthEntities }   from './entities';
import { PlayerModule } from '../player/player.module';
import { AccountService } from './account.service';

@Module({
  imports: [
    DbModule,
    RedisCacheModule,
    PlayerModule,
    TypeOrmModule.forFeature(AuthEntities),
  ],
  controllers: [AuthController],
  providers: [AuthService, AccountService, SessionGuard],
})
export class AuthModule {}

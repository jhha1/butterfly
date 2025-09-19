import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { RedisCacheModule, DbModule } from '../../datasource';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerEntities } from './entities';

@Module({
  imports: [
    DbModule,
    RedisCacheModule,
    TypeOrmModule.forFeature(PlayerEntities),
  ],
  controllers: [PlayerController],
  providers: [PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
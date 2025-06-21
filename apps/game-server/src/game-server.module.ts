import { Module } from '@nestjs/common';
import { GameServerController } from './game-server.controller';
import { GameServerService } from './game-server.service';

@Module({
  imports: [],
  controllers: [GameServerController],
  providers: [GameServerService],
})
export class GameServerModule {}

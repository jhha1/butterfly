import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { GatewayController } from './gateway.controller';
import { GameGateway } from './game.gateway';
import { PlayModule } from '../play/play.module';

@Module({
  imports: [PlayModule],
  controllers: [GatewayController],
  providers: [GatewayService, GameGateway],
  exports: [GatewayService, GameGateway],
})
export class GatewayModule {}
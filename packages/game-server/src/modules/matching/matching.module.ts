import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { GameResultController } from './game-result.controller';

@Module({
  imports: [],
  controllers: [MatchingController, GameResultController],
  providers: [
    MatchingService
  ],
})
export class MatchingModule {}
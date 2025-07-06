import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MatchingService } from './matching.service';

interface GameResultRequest {
  roomId: string;
  players: string[];
  score: {
    player1: number;
    player2: number;
  };
  endReason: string;
  duration: number;
  timestamp: number;
}

interface GameResultResponse {
  status: {
    code: number;
    message: string;
    timestamp: number;
  };
}

@Controller()
export class GameResultController {
  constructor(private readonly matchingService: MatchingService) {}

  @GrpcMethod('OutgameService', 'GameResult')
  async gameResult(request: GameResultRequest): Promise<GameResultResponse> {
    try {
      console.log('🎮 Received game result from ingame:', request);
      
      await this.matchingService.handleGameResult(request);
      
      return {
        status: {
          code: 0,
          message: 'Game result processed successfully',
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      console.error('❌ Error processing game result:', error);
      return {
        status: {
          code: 1,
          message: 'Failed to process game result',
          timestamp: Date.now(),
        },
      };
    }
  }
} 
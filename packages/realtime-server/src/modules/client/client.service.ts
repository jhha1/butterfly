import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { GameResult } from '../../types/game.types';

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

interface OutgameService {
  gameResult(request: GameResultRequest): Promise<GameResultResponse>;
}

@Injectable()
export class ClientService implements OnModuleInit {
  private readonly logger: Logger;
  private outgameService!: OutgameService;

  constructor(
    @Inject('OUTGAME_GRPC_CLIENT') private readonly client: ClientGrpc,
  ) {
    this.logger = new Logger(ClientService.name);
  }

  public onModuleInit() {
    this.outgameService = this.client.getService<OutgameService>('OutgameService');
  }

  async sendGameResult(gameResult: GameResult): Promise<void> {
    try {
      this.logger.log('Sending game result to outgame:', gameResult);
      
      const request: GameResultRequest = {
        roomId: gameResult.roomId,
        players: gameResult.players,
        score: gameResult.score,
        endReason: gameResult.endReason,
        duration: gameResult.duration,
        timestamp: gameResult.timestamp,
      };
      
      const response = await this.outgameService.gameResult(request);
      
      if (response.status.code === 0) {
        this.logger.log('Game result sent successfully');
      } else {
        this.logger.error('Game result processing failed:', response.status.message);
      }
    } catch (error) {
      this.logger.error('Error sending game result:', error);
    }
  }
}
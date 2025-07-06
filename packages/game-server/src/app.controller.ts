import { Controller, Get } from '@nestjs/common';
import { GameServerService } from './app.service';

@Controller()
export class GameServerController {
  constructor(private readonly gameServerService: GameServerService) {}

  @Get()
  getHello(): string {
    return this.gameServerService.getHello();
  }
}

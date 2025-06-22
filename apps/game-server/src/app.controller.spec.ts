import { Test, TestingModule } from '@nestjs/testing';
import { GameServerController } from './app.controller';
import { GameServerService } from './app.service';

describe('GameServerController', () => {
  let gameServerController: GameServerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GameServerController],
      providers: [GameServerService],
    }).compile();

    gameServerController = app.get<GameServerController>(GameServerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(gameServerController.getHello()).toBe('Hello World!');
    });
  });
});

import { Injectable } from '@nestjs/common';
import { GameRoom, GameState, PlayerAction, GameResult } from '../../types/game.types';
import { ClientService } from '../client/client.service';

@Injectable()
export class PlayService {
  private readonly FIELD_WIDTH = 1000;
  private readonly FIELD_HEIGHT = 600;
  private readonly MAX_PLAYER_SPEED = 10; // 한 틱당 최대 이동 거리
  private readonly GAME_DURATION = 180000; // 3분 (milliseconds)

  constructor(private readonly clientService: ClientService) {}

  async startGame(room: GameRoom): Promise<GameState> {
    const gameState: GameState = {
      status: 'playing',
      startTime: Date.now(),
      endTime: 0,
      score: {
        player1: 0,
        player2: 0,
      },
      ball: { x: 500, y: 300 }, // 필드 중앙
      players: {
        player1: this.generateInitialPositions('player1'),
        player2: this.generateInitialPositions('player2'),
      },
      lastUpdate: Date.now(),
    };

    room.gameState = gameState;

    console.log(`Game started in room ${room.id}`);
    
    return gameState;
  }

  async validateAction(room: GameRoom, action: PlayerAction): Promise<boolean> {
    if (!room.gameState || room.gameState.status !== 'playing') {
      return false;
    }

    // 기본 액션 검증
    if (action.playerIndex < 0 || action.playerIndex > 10) {
      return false;
    }

    // 위치 검증
    if (action.position) {
      const { x, y } = action.position;
      if (x < 0 || x > 1000 || y < 0 || y > 600) {
        return false;
      }
    }

    return true;
  }

  async processAction(room: GameRoom, action: PlayerAction): Promise<GameState> {
    if (!room.gameState) {
      throw new Error('Game state not found');
    }

    const gameState = room.gameState;
    
    // 플레이어 액션에 따른 게임 상태 업데이트
    if (action.position) {
      const player = room.players.find(p => p.id === action.playerId);
      if (player) {
        const team = player.team;
        if (gameState.players[team] && gameState.players[team][action.playerIndex]) {
          gameState.players[team][action.playerIndex] = action.position;
        }
      }
    }

    gameState.lastUpdate = Date.now();
    
    return gameState;
  }

  async checkGameEnd(room: GameRoom): Promise<GameResult | null> {
    if (!room.gameState) {
      return null;
    }

    const gameState = room.gameState;
    
    // 게임 종료 조건 확인
    const gameTime = Date.now() - gameState.startTime;
    const maxGameTime = 3 * 60 * 1000; // 3분
    
    if (gameTime >= maxGameTime) {
      // 시간 종료
      return {
        roomId: room.id,
        players: room.players.map(p => p.id),
        score: gameState.score,
        endReason: 'time_up',
        duration: gameTime,
        timestamp: Date.now(),
      };
    }

    // 점수 차이가 5점 이상인 경우 게임 종료
    const scoreDiff = Math.abs(gameState.score.player1 - gameState.score.player2);
    if (scoreDiff >= 5) {
      return {
        roomId: room.id,
        players: room.players.map(p => p.id),
        score: gameState.score,
        endReason: 'score_diff',
        duration: gameTime,
        timestamp: Date.now(),
      };
    }

    return null;
  }

  private generateInitialPositions(team: 'player1' | 'player2'): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = [];
    
    // 11명 선수 초기 위치 생성
    const startX = team === 'player1' ? 200 : 800;
    
    for (let i = 0; i < 11; i++) {
      positions.push({
        x: startX + (i % 3) * 50,
        y: 100 + Math.floor(i / 3) * 100,
      });
    }
    
    return positions;
  }
}
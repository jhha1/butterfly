import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { Account } from '../auth/entities/account.entity';
import { ulid } from 'ulid';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepo: Repository<Player>,
  ) {}

  /**
   * 주어진 Account에 속한 가장 최근 플레이어를 반환합니다.
   * 없으면 'NewPlayer' 닉네임으로 새로 생성합니다.
   */
  async getOrCreateLastPlayer(account: Account): Promise<Player> {
    let player = await this.playerRepo.findOne({
      where: { account: { accountId: account.accountId } },
      order: { lastloginAt: 'DESC' },
    });

    if (!player) {
        const newPlayerId = ulid();
      player = this.playerRepo.create({
        playerId: newPlayerId,
        account,
        accountId: account.accountId,
        nickname: 'NewPlayer', // 닉네임 중복허용 가정
        level: 1,
        lastloginAt: new Date(), 
      });
      await this.playerRepo.save(player);
    }

    return player;
  }
}

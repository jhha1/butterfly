import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { Platform } from './entities/platform.entity';
import { ulid } from 'ulid';
import { InjectRepository } from '@nestjs/typeorm';

export interface AccountResult {
    account: Account;
    isUnregistered: boolean;
}

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account) private accRepo: Repository<Account>,
    @InjectRepository(Platform) private platRepo: Repository<Platform>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 플랫폼 ID로 계정을 조회하거나, 없으면 새로 생성합니다.
   * 탈퇴 계정 여부도 함께 반환합니다.
   */
  async getOrCreateAccount(
    platformId: string,
    platformType: number,
  ): Promise<AccountResult> {
    // 플랫폼-계정 관계 조회
    let platform = await this.platRepo.findOne({ where: { platformId }, relations: ['account'] });
    let account: Account;

    if (!platform) {
      // 신규 계정/플랫폼 생성
      const newAccountId = ulid();
      account = this.accRepo.create({ accountId: newAccountId });
      platform = this.platRepo.create({ platformId, platformType, account });

        await this.dataSource.transaction(async manager => {
            await manager.save(account);
            await manager.save(platform);
        });
    } else {
        account = platform.account;
    }
  
    return { account, isUnregistered: account.deletionDate ? true : false };
  }
}
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { AccountService } from './account.service';
import { LoginRequestDto, isValidPlatformType } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { GameErrorCode, GameException } from '../../common/exceptions/game.exception';
import { PlayerService } from '../player/player.service';
import { SessionService } from '../../../../common/src/auth/session/session.service';
import { AuthPlatformMapStrToNum } from './constants/auth-platform.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account) private accRepo: Repository<Account>,
    private readonly playerService: PlayerService,
    private readonly accountService: AccountService,
    private readonly sessionService: SessionService,
  ) {}

  async login({ platformId, platformType }: LoginRequestDto): Promise<LoginResponseDto> {

    const platformCode = AuthPlatformMapStrToNum[platformType];
    if (!isValidPlatformType(platformCode)) {
      throw new GameException(GameErrorCode.INVALID_PLATFORM_TYPE, 'InvalidPlatformType');
    }

    let { account, isUnregistered } = await this.accountService.getOrCreateAccount(platformId, platformCode);
    if (isUnregistered) {
       throw new GameException(GameErrorCode.ACCOUNT_UNREGISTERED, 'UnregisterdUser');
    }
     
    const player = await this.playerService.getOrCreateLastPlayer(account);

    const sessionToken = await this.sessionService.createSession({ accountId: account.accountId, playerId: player.playerId });
    
    return {
      status: { code: 0, timestamp: Date.now() },
      accountId: account.accountId,
      playerId: player.playerId,
      sessionToken,
    };
  }

  async unregister(accountId: string): Promise<void> {
    const account = await this.accRepo.findOne({ where: { accountId } });
    if (!account) throw new GameException(GameErrorCode.ACCOUNT_NOEXISTED, 'NoExistedUser');
   
    account.deletionDate = new Date(); // 탈퇴 플래그 처리만 해두고, 유예기간 지난 후 실 삭제 진행. 
   
    await this.accRepo.save(account);
  }
}
import { RpcException } from '@nestjs/microservices';

export enum GameErrorCode {
  ACCOUNT_NOEXISTED = 1001, // 미존재 계정
  ACCOUNT_UNREGISTERED = 1002, // 탈퇴된 계정
  SESSION_INVALID = 2001,
}

export class GameException extends RpcException {
  constructor(
    public readonly errorCode: GameErrorCode,
    message: string,
  ) {
    super({
      code: errorCode,
      message,
    });
  }
}

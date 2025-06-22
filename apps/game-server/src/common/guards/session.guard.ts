import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionService } from '@libs/auth';
import { Metadata } from '@grpc/grpc-js';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // @Public() 플래그가 있으면 인증 스킵
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const args = context.getArgs(); // [data, metadata, call, callback]
    const metadata = args[1] as Metadata;
    const call = args[2]; // ServerUnaryCall<any, any>

    const sessionIds = metadata.get('session-id');
    const sessionId = Array.isArray(sessionIds) && sessionIds.length > 0
      ? sessionIds[0] as string
      : null;

    if (!sessionId) {
      throw new UnauthorizedException('세션 ID가 없습니다.');
    }

    // 세션 로드 및 TTL 갱신
    const session = await this.sessionService.get(sessionId);
    await this.sessionService.touch(sessionId);

    // 비즈니스 로직에서 접근되도록 session을 붙임.
    (call as any).session = session;
    
    return true;
  }
}

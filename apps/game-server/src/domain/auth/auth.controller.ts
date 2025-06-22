import { Controller, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UnregisterRequestDto } from './dto/unregister-request.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @GrpcMethod('AuthService', 'Login')
  async login(request: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(request);
  }

  @GrpcMethod('AuthService', 'Unregister')
  async unregister(request: UnregisterRequestDto): Promise<{}> {
    await this.authService.unregister(request.accountId);
    return {};
  }

 // Hot path: skipping DTO, use raw proto object directly (no DTO mapping)
//  @GrpcMethod('AuthService', 'heartBeat')
//  async validate(request: { sessionToken: string }): Promise<{ status: { code: number; message?: string; timestamp: number }; valid: boolean; accountId?: string; playerId?: number }> {
//    const session = await this.authService.validateSession(request.sessionToken);
//    if (!session) {
//      return { status: { code: 1, message: 'Invalid', timestamp: Date.now() }, valid: false };
//    }
//    return { status: { code: 0, timestamp: Date.now() }, valid: true, accountId: session.uid, playerId: session.playerId };
//  }
}
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
}
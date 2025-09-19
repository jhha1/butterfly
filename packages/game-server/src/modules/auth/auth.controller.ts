import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UnregisterRequestDto } from './dto/unregister-request.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthPlatformCode, AuthPlatformStr } from './constants/auth-platform.enum';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiBody({ 
    type: LoginRequestDto,
    schema: {
      type: 'object',
      properties: {
        platformType: {
          oneOf: [
            { type: 'string', enum: Object.values(AuthPlatformStr) },
            { type: 'integer', enum: Object.values(AuthPlatformCode) }
          ],
          description: '문자열(권장) 또는 숫자 코드(하위호환)',
        },
        credential: { type: 'string' },
      },
      required: ['platformType', 'credential'],
    },
    examples: {
      'google': {
        value: {
          platformId: '1234567890',
          platformType: 'google'
        }
      }
    }
  })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async login(@Body() request: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(request);
  }

  @Post('unregister')
  @ApiOperation({ summary: '회원탈퇴' })
  @ApiBody({ type: UnregisterRequestDto })
  @ApiResponse({ status: 204, description: '성공' }) // 204: 성공 시 응답 본문 없음
  async unregister(@Body() request: UnregisterRequestDto): Promise<{}> {
    await this.authService.unregister(request.accountId);
    return {};
  }
}
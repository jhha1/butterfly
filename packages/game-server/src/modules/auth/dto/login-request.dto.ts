import { ApiProperty } from '@nestjs/swagger';
import { AUTH_PLATFORM_MAP, AuthPlatformCode, AuthPlatformStr, AuthPlatformMapNumToStr, AuthPlatformMapStrToNum } from '../constants/auth-platform.enum';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEnum } from 'class-validator';

type PlatformUnion = AuthPlatformStr | keyof typeof AuthPlatformCode | number; 
// (문자열, 문자열 키, 숫자까지 받아서 -> 내부 문자열 enum으로 통일)

// 입력값을 내부 문자열 enum으로 변환
function toPlatformStr(value: unknown): AuthPlatformStr {
  if (typeof value === 'number') {
    if (value in AuthPlatformMapNumToStr) return AuthPlatformMapNumToStr[value as AuthPlatformCode];
  }
  if (typeof value === 'string') {
    const v = value.toLowerCase();
    if (v in AuthPlatformMapStrToNum) return v as AuthPlatformStr;
    // 숫자 문자열 '1' 같은 것도 허용
    const n = Number(v);
    if (!Number.isNaN(n) && n in AuthPlatformMapNumToStr) {
      return AuthPlatformMapNumToStr[n as AuthPlatformCode];
    }
  }
  throw new Error('Invalid platformType');
}
export class LoginRequestDto {
  @ApiProperty({ description: '플랫폼 ID', example: '1234567890' })
  platformId!: string;

  @ApiProperty({ 
    description: '플랫폼 종류', 
    enum: AuthPlatformStr,
    enumName: 'AuthPlatformType',
    examples: ['google', 'apple', 'guest', 'none'],
  })
  @Transform((p: { value: string | number }) => toPlatformStr(p.value))
  @IsEnum(AuthPlatformStr)
  platformType!: AuthPlatformStr;
}
export const isValidPlatformType = (platformType: number): boolean => AUTH_PLATFORM_MAP.has(platformType);

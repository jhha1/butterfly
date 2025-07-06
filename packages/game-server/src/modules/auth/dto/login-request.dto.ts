import { AUTH_PLATFORM_MAP, AuthPlatform } from '../constants/auth-platform.enum';

export class LoginRequestDto {
  platformId!: string;
  platformType!: AuthPlatform;
}
export const isValidPlatformType = (platformType: number): boolean => AUTH_PLATFORM_MAP.has(platformType);

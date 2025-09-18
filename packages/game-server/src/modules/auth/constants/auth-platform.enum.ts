/**
 * AuthPlatform Enum 상수
 */
export enum AuthPlatformCode {
  AUTH_PLATFORM_UNSPECIFIED = 0,
  AUTH_PLATFORM_GUEST = 1,
  AUTH_PLATFORM_APPLE = 2,
  AUTH_PLATFORM_GOOGLE = 3,
}

export enum AuthPlatformStr {
  AUTH_PLATFORM_UNSPECIFIED = 'none',
  AUTH_PLATFORM_GUEST = 'guest',
  AUTH_PLATFORM_APPLE = 'apple',
  AUTH_PLATFORM_GOOGLE = 'google',
}

export const AuthPlatformMapNumToStr: Record<AuthPlatformCode, AuthPlatformStr> = {
  [AuthPlatformCode.AUTH_PLATFORM_UNSPECIFIED]: AuthPlatformStr.AUTH_PLATFORM_UNSPECIFIED,
  [AuthPlatformCode.AUTH_PLATFORM_GUEST]: AuthPlatformStr.AUTH_PLATFORM_GUEST,
  [AuthPlatformCode.AUTH_PLATFORM_APPLE]: AuthPlatformStr.AUTH_PLATFORM_APPLE,
  [AuthPlatformCode.AUTH_PLATFORM_GOOGLE]: AuthPlatformStr.AUTH_PLATFORM_GOOGLE,
};

export const AuthPlatformMapStrToNum: Record<AuthPlatformStr, AuthPlatformCode> = {
  [AuthPlatformStr.AUTH_PLATFORM_UNSPECIFIED]: AuthPlatformCode.AUTH_PLATFORM_UNSPECIFIED,
  [AuthPlatformStr.AUTH_PLATFORM_GUEST]: AuthPlatformCode.AUTH_PLATFORM_GUEST,
  [AuthPlatformStr.AUTH_PLATFORM_APPLE]: AuthPlatformCode.AUTH_PLATFORM_APPLE,
  [AuthPlatformStr.AUTH_PLATFORM_GOOGLE]: AuthPlatformCode.AUTH_PLATFORM_GOOGLE,
};

export const AUTH_PLATFORM_MAP = new Map<number, boolean>(
  Object.values(AuthPlatformCode)
    .filter((v): v is AuthPlatformCode => typeof v === 'number')
    .map((num) => [num, true])
);
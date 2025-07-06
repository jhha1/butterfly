/**
 * AuthPlatform Enum 상수
 * gRPC proto에서 정의된 값과 일치해야 함
 */
export enum AuthPlatform {
  AUTH_PLATFORM_UNSPECIFIED = 0,
  AUTH_PLATFORM_GUEST = 1,
  AUTH_PLATFORM_APPLE = 2,
  AUTH_PLATFORM_GOOGLE = 3,
}

export const AUTH_PLATFORM_MAP = new Map<number, boolean>(
  Object.values(AuthPlatform)
    .filter((v): v is AuthPlatform => typeof v === 'number')
    .map((num) => [num, true])
);
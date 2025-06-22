export class LoginResponseDto {
    status!: { code: number; message?: string; timestamp: number };
    accountId!: string;
    playerId?: string;
    sessionToken?: string;
  }
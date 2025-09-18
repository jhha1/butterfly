import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginResponseDto {
    @ApiProperty({ description: '상태', example: { code: 200, message: 'success', timestamp: 1726704000 } })
    status!: { code: number; message?: string; timestamp: number };

    @ApiProperty({ description: '게임 계정 ID', example: '1234567890' })
    accountId!: string;

    @ApiProperty({ description: '게임 플레이어 ID', example: '1234567890' })
    @ApiPropertyOptional({ nullable: true })
    playerId?: string;

    @ApiProperty({ description: '세션 토큰', example: '1234567890' })
    @ApiPropertyOptional({ nullable: true })
    sessionToken?: string;
  }
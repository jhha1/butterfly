import { ApiProperty } from '@nestjs/swagger';

export class UnregisterRequestDto {
    @ApiProperty({ description: '게임 계정 ID', example: '1234567890' })
    accountId!: string;
  }
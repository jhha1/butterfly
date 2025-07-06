import { RoomInfo } from '../../matching/dto/common-types';

export interface ResponseStatus {
  code: number;
  message: string;
  timestamp: number;
}

export class LobbyRefreshResponseDto {
  status!: ResponseStatus;
  newInfo!: string;
  matchInfo?: RoomInfo; // 매치 정보가 있는 경우 포함
} 
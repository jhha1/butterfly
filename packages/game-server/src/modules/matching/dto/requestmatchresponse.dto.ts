import { ResponseStatus, RoomInfo } from './common-types';

export class RequestMatchResponseDto {
  status!: ResponseStatus;
  isAble!: number;
  roomInfo!: RoomInfo | null;
  expire_at!: number;
}
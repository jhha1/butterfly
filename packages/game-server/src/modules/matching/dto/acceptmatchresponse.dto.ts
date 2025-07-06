import { ResponseStatus, RoomInfo } from './common-types';

export class AcceptMatchResponseDto {
  status!: ResponseStatus;
  isAble!: number;
  roomInfo!: RoomInfo | null;
}
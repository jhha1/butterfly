import { Injectable } from '@nestjs/common';

@Injectable()
export class GameServerService {
  getHello(): string {
    return 'Hello World!';
  }
}

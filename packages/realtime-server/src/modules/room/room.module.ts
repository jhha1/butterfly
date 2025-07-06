import { Module, Global } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { ClientModule } from '../client/client.module';

@Global()
@Module({
  imports: [ClientModule],
  providers: [RoomService],
  controllers: [RoomController],
  exports: [RoomService],
})
export class RoomModule {}
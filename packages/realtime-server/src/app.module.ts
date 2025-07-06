import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientModule } from './modules/client/client.module';
import { PlayModule } from './modules/play/play.module';
import { RoomModule } from './modules/room/room.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { RedisCacheModule } from '@packages/common/datasource/redis/src/redis.module';

@Module({
  imports: [
    RedisCacheModule,
    ClientModule,
    PlayModule,
    RoomModule,
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 
import { NestFactory } from '@nestjs/core';
import { GameServerModule } from './game-server.module';

async function bootstrap() {
  const app = await NestFactory.create(GameServerModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();

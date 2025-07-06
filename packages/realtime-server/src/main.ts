import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const httpPort = process.env.HTTP_PORT || 3001;
  const grpcPort = process.env.GRPC_PORT || 50052;

  // gRPC 마이크로서비스 생성
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'jhha.butterfly.v1',
        protoPath: [
          join(__dirname, 'grpc/proto/base.proto'),
          join(__dirname, 'grpc/proto/game/game.proto'),
        ],
        loader: {
          includeDirs: [join(__dirname, 'grpc/proto')],
        },
        url: `0.0.0.0:${grpcPort}`,
      },
    },
  );

  // gRPC 서버 시작
  await grpcApp.listen();

  // HTTP 앱 생성 (WebSocket 지원)
  const httpApp = await NestFactory.create(AppModule);
  
  // CORS 설정
  httpApp.enableCors({
    origin: '*',
    credentials: true,
  });

  // HTTP 서버 시작
  await httpApp.listen(httpPort);

  Logger.log(`Ingame Server is running on HTTP port ${httpPort}`);
  Logger.log(`gRPC Server is running on port ${grpcPort}`);
}

bootstrap().catch((error) => {
  Logger.error('Application failed to start:', error);
  process.exit(1);
}); 
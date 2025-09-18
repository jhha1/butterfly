import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientService } from './client.service';
import { join } from 'path';

@Global()
@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'INGAME_GRPC_CLIENT',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'jhha.butterfly.v1',
            protoPath: [
              join(process.cwd(), 'packages/realtime-server/dist/grpc/proto/base.proto'),
              join(process.cwd(), 'packages/realtime-server/dist/grpc/proto/game/game.proto'),
            ],
            loader: {
              keepCase: false,
              longs: String,
              enums: Number,
              defaults: true,
              oneofs: true,
              includeDirs: [join(process.cwd(), 'packages/realtime-server/dist/grpc/proto')],
            },
            url: configService.get<string>('INGAME_GRPC_URL', '0.0.0.0:50052'),
            // HTTP/2 keepalive 설정
            keepalive: {
              keepaliveTimeMs: 5 * 60 * 1000,
              keepaliveTimeoutMs: 20 * 1000,
              keepalivePermitWithoutCalls: 1,
              http2MinPingIntervalWithoutDataMs: 30 * 1000,
              http2MaxPingStrikes: 2,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [ClientService],
  exports: [ClientService, ClientsModule],
})
export class ClientModule {
  static forRoot() {
    const repoPath = `${process.cwd()}/packages/game-server/src/grpc/client`;
    return {
      module: ClientModule,
      imports: [ClientsModule],
    };
  }
}
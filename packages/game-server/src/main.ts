import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { readdirSync, Dirent } from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // const protoBasePath = getProtoBasePath();
  // console.log('getProtoList', protoBasePath);
  // const protoList = getProtoList(protoBasePath);

  // const defaultOptions: GrpcOptions = {
  //   transport: Transport.GRPC,
  //   options: {
  //     package: 'jhha.butterfly.v1',
  //     protoPath: protoList,
  //     // HTTP/2 keepalive 설정 (grpc-web는 HTTP/1.1 이므로 하위 옵션 무의미)
  //     keepalive: {
  //       keepaliveTimeMs: 5 * 60 * 1000, // ping 주기
  //       keepaliveTimeoutMs: 20 * 1000, // ping 응답 대기 타임아웃
  //       keepalivePermitWithoutCalls: 1, // 호출 없을 때도 ping을 보내도록 혀용 여부 (0/1)
  //       http2MinPingIntervalWithoutDataMs: 30 * 1000, // 데이터 없이도 최소 ping 간격
  //       http2MaxPingStrikes: 2, // 최대 ping 실패 허용 횟수
  //     },
  //     // proto-loader 옵션
  //     loader: {
  //       keepCase: false, // 필드명이 JS camelCase로 변환되는 것을 제어
  //       longs: String, // int64 -> string
  //       enums: Number, // Protobuf의 JSON 매핑 규약(https://developers.google.com/protocol-buffers/docs/proto3#json)에는 string이 권장이라고 함. int로 쓰기위해 number로 처리
  //       defaults: true, // 필드가 optional일 때 기본값 채움
  //       oneofs: true, // oneof 구문 지원
  //       includeDirs: [protoBasePath], // import 시 참조할 경로
  //     },
  //   },
  // };

  // defaultOptions.options.url = '0.0.0.0:50051';

  // const app = await NestFactory.createMicroservice<GrpcOptions>(AppModule, {
  //     ...defaultOptions,
  //   });

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Butterfly API')
    .setDescription('Butterfly API description')
    .setVersion('1.0')
    .addTag('butterfly')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);

  Logger.log(
    `🚀 Simple Game Server is running on HTTP - Auto-restart working perfectly!`
  );
}

/**
 * proto 파일이 들어있는 최상위 폴더 경로를 반환
 */
function getProtoBasePath(): string {
  console.log('getProtoBasePath-----', __dirname);
  return join(__dirname, 'grpc', 'proto');
}

/**
 * 주어진 폴더를 재귀 순회하며 .proto 파일 전체 경로 리스트를 반환
 * 재귀 함수: 애플리케이션 기동 시 한 번만 실행된다는 점, proto 파일 수, 디렉터리 깊이 고려.
 */
function getProtoList(basePath: string): string[] {
  
  const result: string[] = [];
  const walk = (dir: string) => {
    for (const d of readdirSync(dir, { withFileTypes: true }) as Dirent[]) {
      const full = join(dir, d.name);
      if (d.isDirectory()) {
        walk(full);
      } else if (d.isFile() && full.endsWith('.proto')) {
        result.push(full);
      }
    }
  };
  walk(basePath);
  return result;
}

bootstrap();


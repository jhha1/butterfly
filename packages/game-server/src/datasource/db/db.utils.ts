import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function buildTypeOrmConfig(env: NodeJS.ProcessEnv): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT ?? '3306'),
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    autoLoadEntities: true, // TypeOrmModule.forFeature() 등으로 등록된 모든 Entity 클래스를 자동으로 찾아서 DataSource에 등록
    synchronize: false, // 서버 뜰 때 Entity 변경을 디비에 자동 동기화 할지 여부. 예기치 않은 변경을 방지위해 false로 설정. Migration으로 관리.
    retryAttempts: 5, // 커넥션 장애시 재시도 옵션. 최대 5번 
    retryDelay: 3000, // 3초 간격 시도.
    // driver-specific options go under `extra`
    extra: {
        connectionLimit: 20,    // 최대 커넥션 수
        queueLimit: 300,        // 커넥션 모두 사용중일때 대기 큐에 쌓이는 요청개수제한. 응답성보다 요청처리에 우선순위를 둔다면 0을 두어, 모두 처리하게끔 한다.  
        connectTimeout: 3000,  // 연결 타임아웃(ms). 동일리전 1~3sec, 크로스리전 or 퍼블릭인터넷 경유 5~10sec, 초 저지연 실시간 0.5~1sec 
    },
    logging: env.DB_LOGGING === 'true',
  };
}

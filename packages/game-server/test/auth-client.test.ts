import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import { readdirSync, Dirent } from 'fs';

describe('AuthService Client Tests (Simple)', () => {
  let client: any;

  beforeAll(async () => {
    // gRPC 클라이언트 설정
    const protoBasePath = getProtoBasePath();
    const protoList = getProtoList(protoBasePath);
    
    const packageDefinition = protoLoader.loadSync(protoList, {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs: [protoBasePath],
    });

    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
    
    let authService;
    if (protoDescriptor.jhha?.butterfly?.v1?.AuthService) {
      authService = protoDescriptor.jhha.butterfly.v1.AuthService;
    } else if (protoDescriptor['jhha.butterfly.v1']?.AuthService) {
      authService = protoDescriptor['jhha.butterfly.v1'].AuthService;
    } else if (protoDescriptor.AuthService) {
      authService = protoDescriptor.AuthService;
    } else {
      throw new Error('AuthService not found in proto definition');
    }
    
    client = new authService(
      'localhost:50051',
      grpc.credentials.createInsecure()
    );

    // 서버 연결 대기
    await waitForServer(client);
  });

  afterAll(async () => {
    if (client) {
      client.close();
    }
  });

  describe('Login API', () => {
    it('should login with guest platform successfully', (done) => {
      const loginRequest = {
        platformId: 'test-guest-123',
        platformType: 1, // AUTH_PLATFORM_GUEST
      };

      client.Login(loginRequest, (error: any, response: any) => {
        expect(error).toBeNull();
        expect(response).toBeDefined();
        expect(response.status).toBeDefined();
        expect(response.status.code).toBe(0); // 성공 코드
        expect(response.accountId).toBeDefined();
        expect(typeof response.accountId).toBe('string');
        expect(response.accountId.length).toBeGreaterThan(0);
        expect(response.status.timestamp).toBeDefined();
        expect(typeof response.status.timestamp).toBe('number');
        done();
      });
    });

    it('should login with apple platform successfully', (done) => {
      const loginRequest = {
        platformId: 'test-apple-456',
        platformType: 2, // AUTH_PLATFORM_APPLE
      };

      client.Login(loginRequest, (error: any, response: any) => {
        expect(error).toBeNull();
        expect(response).toBeDefined();
        expect(response.status).toBeDefined();
        expect(response.status.code).toBe(0); // 성공 코드
        expect(response.accountId).toBeDefined();
        expect(typeof response.accountId).toBe('string');
        expect(response.accountId.length).toBeGreaterThan(0);
        expect(response.status.timestamp).toBeDefined();
        expect(typeof response.status.timestamp).toBe('number');
        done();
      });
    });

    it('should login with google platform successfully', (done) => {
      const loginRequest = {
        platformId: 'test-google-789',
        platformType: 3, // AUTH_PLATFORM_GOOGLE
      };

      client.Login(loginRequest, (error: any, response: any) => {
        expect(error).toBeNull();
        expect(response).toBeDefined();
        expect(response.status).toBeDefined();
        expect(response.status.code).toBe(0); // 성공 코드
        expect(response.accountId).toBeDefined();
        expect(typeof response.accountId).toBe('string');
        expect(response.accountId.length).toBeGreaterThan(0);
        expect(response.status.timestamp).toBeDefined();
        expect(typeof response.status.timestamp).toBe('number');
        done();
      });
    });

    it('should return same accountId for same platformId and platformType', (done) => {
      const loginRequest = {
        platformId: 'same-user-test',
        platformType: 1, // AUTH_PLATFORM_GUEST
      };

      let firstAccountId: string;

      // 첫 번째 로그인
      client.Login(loginRequest, (error1: any, response1: any) => {
        expect(error1).toBeNull();
        expect(response1.status.code).toBe(0);
        firstAccountId = response1.accountId;

        // 두 번째 로그인 (같은 사용자)
        client.Login(loginRequest, (error2: any, response2: any) => {
          expect(error2).toBeNull();
          expect(response2.status.code).toBe(0);
          expect(response2.accountId).toBe(firstAccountId);
          done();
        });
      });
    });

    it('should handle empty platformId', (done) => {
      const loginRequest = {
        platformId: '',
        platformType: 1,
      };

      client.Login(loginRequest, (error: any, response: any) => {
        // 에러가 발생하거나 에러 상태 코드가 반환되어야 함
        if (error) {
          expect(error).toBeDefined();
        } else {
          expect(response.status.code).not.toBe(0);
        }
        done();
      });
    });

    it('should handle invalid platformType', (done) => {
      const loginRequest = {
        platformId: 'test-invalid-platform',
        platformType: 999, // 잘못된 플랫폼 타입
      };

      client.Login(loginRequest, (error: any, response: any) => {
        // 에러가 발생하거나 에러 상태 코드가 반환되어야 함
        if (error) {
          expect(error).toBeDefined();
        } else {
          expect(response.status.code).not.toBe(0);
        }
        done();
      });
    });
  });
});

/**
 * 서버 연결 대기
 */
async function waitForServer(client: any): Promise<void> {
  return new Promise((resolve) => {
    if (client) {
      client.waitForReady(Date.now() + 10000, (error: any) => {
        if (error) {
          console.error('Failed to connect to server:', error);
          console.log('Please make sure the server is running on localhost:50051');
        } else {
          console.log('Successfully connected to server');
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
}

/**
 * proto 파일이 들어있는 최상위 폴더 경로를 반환
 */
function getProtoBasePath(): string {
  return join(__dirname, '..', 'src', 'grpc', 'proto');
}

/**
 * 주어진 폴더를 재귀 순회하며 .proto 파일 전체 경로 리스트를 반환
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
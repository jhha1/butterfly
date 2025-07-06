// 클라이언트 테스트용 Jest 설정
import { config } from 'dotenv';
import { resolve } from 'path';

// 환경 변수 로드
config({ path: resolve(process.cwd(), '.env') });

// 테스트 환경 변수 설정
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '3306';
process.env.DB_USERNAME = process.env.DB_USERNAME || 'butterfly';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'butterflypass';
process.env.DB_NAME = process.env.DB_NAME || 'game';
process.env.DB_LOGGING = 'false';
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-client-tests';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-session-secret-for-client-tests';

// 글로벌 테스트 타임아웃 설정
jest.setTimeout(60000); 
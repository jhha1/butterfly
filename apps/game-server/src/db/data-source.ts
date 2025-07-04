import { DataSource } from 'typeorm';
import { resolve } from 'path';
import { config as loadEnv } from 'dotenv';

// 로컬 환경에서 마이그레이션 파일 생성시 참조용
loadEnv({ path: resolve(process.cwd(), '.env') });

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['../domain/**/entities/*.ts'],
  migrations: ['./migrations/*.ts'],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});

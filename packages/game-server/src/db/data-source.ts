import { DataSource } from 'typeorm';
import { resolve } from 'path';
import { config as loadEnv } from 'dotenv';
import { Account } from '../modules/auth/entities/account.entity';
import { Platform } from '../modules/auth/entities/platform.entity';
import { Player } from '../modules/player/entities/player.entity';

// 로컬 환경에서 마이그레이션 파일 생성시 참조용
loadEnv({ path: resolve(process.cwd(), '.env') });

// todo. entities 하나씩 넣지 않도록 
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Account, Platform, Player],
  migrations: [resolve(__dirname, 'migrations/*.ts')],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});

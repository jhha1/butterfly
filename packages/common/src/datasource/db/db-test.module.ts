import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { buildTestTypeOrmConfig } from '../../../../game-server/src/db/db.utils';
import { resolve } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolve(
        process.cwd(),
        `.env.test`,
      ),
    }),
    TypeOrmModule.forRoot(buildTestTypeOrmConfig(process.env)),
  ],
})
export class DbTestModule {} 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { buildTypeOrmConfig } from '../../../../game-server/src/db/db.utils';
import { resolve } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolve(
        process.cwd(),
        `.env`,
      ),
    }),
    TypeOrmModule.forRoot(buildTypeOrmConfig(process.env)),
  ],
})
export class DbModule {}

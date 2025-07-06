import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { RedisCacheModule } from '../../datasource';

@Module({
  imports: [RedisCacheModule],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}

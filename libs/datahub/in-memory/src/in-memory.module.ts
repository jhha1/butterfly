import { Module, Global } from '@nestjs/common';
import { InMemoryCacheService } from './in-memory.service';

@Global()
@Module({
  providers: [InMemoryCacheService],
  exports: [InMemoryCacheService],
})
export class InMemoryCacheModule {}

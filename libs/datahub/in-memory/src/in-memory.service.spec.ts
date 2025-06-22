import { Test, TestingModule } from '@nestjs/testing';
import { InMemoryService } from './in-memory.service';

describe('InMemoryService', () => {
  let service: InMemoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InMemoryService],
    }).compile();

    service = module.get<InMemoryService>(InMemoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

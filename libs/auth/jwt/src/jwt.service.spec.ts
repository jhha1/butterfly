import { Test, TestingModule } from '@nestjs/testing';
import { Auth/jwtService } from './auth/jwt.service';

describe('Auth/jwtService', () => {
  let service: Auth/jwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Auth/jwtService],
    }).compile();

    service = module.get<Auth/jwtService>(Auth/jwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { PatentService } from './patent.service';

describe('PatentService', () => {
  let service: PatentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatentService],
    }).compile();

    service = module.get<PatentService>(PatentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

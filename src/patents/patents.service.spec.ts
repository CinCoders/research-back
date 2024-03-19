import { Test, TestingModule } from '@nestjs/testing';
import { PatentsService } from './patents.service';

describe('PatentsService', () => {
  let service: PatentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatentsService],
    }).compile();

    service = module.get<PatentsService>(PatentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AdviseeService } from './advisee.service';

describe('AdviseeService', () => {
  let service: AdviseeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdviseeService],
    }).compile();

    service = module.get<AdviseeService>(AdviseeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

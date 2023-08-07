import { Test, TestingModule } from '@nestjs/testing';
import { FinancierService } from './financier.service';

describe('FinancierService', () => {
  let service: FinancierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinancierService],
    }).compile();

    service = module.get<FinancierService>(FinancierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

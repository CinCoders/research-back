import { Test, TestingModule } from '@nestjs/testing';
import { ArtisticProductionService } from './artistic-production.service';

describe('ArtisticProductionService', () => {
  let service: ArtisticProductionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArtisticProductionService],
    }).compile();

    service = module.get<ArtisticProductionService>(ArtisticProductionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

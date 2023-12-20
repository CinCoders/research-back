import { Test, TestingModule } from '@nestjs/testing';
import { ScholarshipService } from './scholarship.service';

describe('ScholarshipService', () => {
  let service: ScholarshipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScholarshipService],
    }).compile();

    service = module.get<ScholarshipService>(ScholarshipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ImportJsonService } from './import-json.service';

describe('ImportJsonService', () => {
  let service: ImportJsonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImportJsonService],
    }).compile();

    service = module.get<ImportJsonService>(ImportJsonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

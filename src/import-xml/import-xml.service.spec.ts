import { Test, TestingModule } from '@nestjs/testing';
import { ImportXmlService } from './import-xml.service';

describe('ImportXmlService', () => {
  let service: ImportXmlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImportXmlService],
    }).compile();

    service = module.get<ImportXmlService>(ImportXmlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

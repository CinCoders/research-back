import { Test, TestingModule } from '@nestjs/testing';
import { JournalPublicationService } from './journal-publication.service';

describe('JournalPublicationService', () => {
  let service: JournalPublicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JournalPublicationService],
    }).compile();

    service = module.get<JournalPublicationService>(JournalPublicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

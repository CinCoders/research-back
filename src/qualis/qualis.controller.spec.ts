import { Test, TestingModule } from '@nestjs/testing';
import { QualisController } from './qualis.controller';
import { JournalService } from './qualis.service';

describe('QualisController', () => {
  let controller: QualisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QualisController],
      providers: [JournalService],
    }).compile();

    controller = module.get<QualisController>(QualisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

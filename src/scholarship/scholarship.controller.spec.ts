import { Test, TestingModule } from '@nestjs/testing';
import { ScholarshipController } from './scholarship.controller';
import { ScholarshipService } from './scholarship.service';

describe('ScholarshipController', () => {
  let controller: ScholarshipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScholarshipController],
      providers: [ScholarshipService],
    }).compile();

    controller = module.get<ScholarshipController>(ScholarshipController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

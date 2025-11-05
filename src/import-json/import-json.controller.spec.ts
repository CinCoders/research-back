import { Test, TestingModule } from '@nestjs/testing';
import { ImportJsonController } from './import-json.controller';

describe('ImportJsonController', () => {
  let controller: ImportJsonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportJsonController],
    }).compile();

    controller = module.get<ImportJsonController>(ImportJsonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ImportXmlController } from './import-xml.controller';
import { ImportXmlService } from './import-xml.service';

describe('ImportXmlController', () => {
  let controller: ImportXmlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportXmlController],
      providers: [ImportXmlService],
    }).compile();

    controller = module.get<ImportXmlController>(ImportXmlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { PatentsController } from './patents.controller';

describe('PatentsController', () => {
  let controller: PatentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatentsController],
    }).compile();

    controller = module.get<PatentsController>(PatentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

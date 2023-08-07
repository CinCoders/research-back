import { Test, TestingModule } from '@nestjs/testing';
import { PostGraduationController } from './post-graduation.controller';
import { PostGraduationService } from './post-graduation.service';

describe('PostGraduationController', () => {
  let controller: PostGraduationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostGraduationController],
      providers: [PostGraduationService],
    }).compile();

    controller = module.get<PostGraduationController>(PostGraduationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

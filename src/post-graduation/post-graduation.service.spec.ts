import { Test, TestingModule } from '@nestjs/testing';
import { PostGraduationService } from './post-graduation.service';

describe('PostGraduationService', () => {
  let service: PostGraduationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostGraduationService],
    }).compile();

    service = module.get<PostGraduationService>(PostGraduationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

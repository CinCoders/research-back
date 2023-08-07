import { Module } from '@nestjs/common';
import { PostGraduationService } from './post-graduation.service';
import { PostGraduationController } from './post-graduation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [PostGraduationController],
  providers: [PostGraduationService],
  exports: [PostGraduationService],
})
export class PostGraduationModule {}

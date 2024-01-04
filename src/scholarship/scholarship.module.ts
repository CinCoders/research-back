import { Module } from '@nestjs/common';
import { ScholarshipService } from './scholarship.service';
import { ScholarshipController } from './scholarship.controller';

@Module({
  controllers: [ScholarshipController],
  providers: [ScholarshipService]
})
export class ScholarshipModule {}

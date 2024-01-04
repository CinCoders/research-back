import { PartialType } from '@nestjs/mapped-types';
import { CreateScholarshipDto } from './create-scholarship.dto';

export class UpdateScholarshipDto extends PartialType(CreateScholarshipDto) {}

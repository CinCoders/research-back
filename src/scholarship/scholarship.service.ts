import { Injectable } from '@nestjs/common';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';

@Injectable()
export class ScholarshipService {
  create(createScholarshipDto: CreateScholarshipDto) {
    return 'This action adds a new scholarship';
  }

  findAll() {
    return `This action returns all scholarship`;
  }

  findOne(id: number) {
    return `This action returns a #${id} scholarship`;
  }

  update(id: number, updateScholarshipDto: UpdateScholarshipDto) {
    return `This action updates a #${id} scholarship`;
  }

  remove(id: number) {
    return `This action removes a #${id} scholarship`;
  }
}

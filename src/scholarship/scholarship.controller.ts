import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ScholarshipService } from './scholarship.service';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';

@Controller('scholarship')
export class ScholarshipController {
  constructor(private readonly scholarshipService: ScholarshipService) {}

  @Post()
  create(@Body() createScholarshipDto: CreateScholarshipDto) {
    return this.scholarshipService.create(createScholarshipDto);
  }

  @Get()
  findAll() {
    return this.scholarshipService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scholarshipService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScholarshipDto: UpdateScholarshipDto) {
    return this.scholarshipService.update(+id, updateScholarshipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scholarshipService.remove(+id);
  }
}

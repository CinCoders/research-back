import { ApiTags, ApiProperty } from '@nestjs/swagger';
import { Professor } from '../entities/professor.entity';

@ApiTags('AdviseeDto')
export class AdviseeDto {
  @ApiProperty({ name: 'professor', type: Professor })
  professor!: Professor;

  @ApiProperty({ name: 'yearStart', type: String })
  yearStart?: string;

  @ApiProperty({ name: 'yearEnd', type: String })
  yearEnd?: string;

  @ApiProperty({ name: 'name', type: String })
  name!: string;

  @ApiProperty({ name: 'type', type: String })
  type!: string;

  @ApiProperty({ name: 'scholarship', type: Boolean })
  scholarship?: boolean;

  @ApiProperty({ name: 'financierCode', type: String })
  financierCode?: string;

  @ApiProperty({ name: 'title', type: String })
  title?: string;

  @ApiProperty({ name: 'institution', type: String })
  institution?: string;

  @ApiProperty({ name: 'course', type: String })
  course?: string;
}

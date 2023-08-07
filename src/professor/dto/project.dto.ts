import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Professor } from '../entities/professor.entity';

@ApiTags('ProjectDto')
export class ProjectDto {
  @ApiProperty({ name: 'professor', type: Professor })
  professor!: Professor;

  @ApiProperty({ name: 'name', type: String })
  name!: string;

  @ApiProperty({ name: 'year', type: String })
  year!: string;

  @ApiProperty({ name: 'periodFlag', type: String })
  periodFlag!: string;
}

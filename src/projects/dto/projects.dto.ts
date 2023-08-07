import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('ProjectsDto')
export class ProjectsDto {
  @ApiProperty({ name: 'professorId', required: false, type: Number })
  professorId?: number;

  @ApiProperty({ name: 'professorName', required: false, type: String })
  professorName?: string;

  @ApiProperty({ name: 'year', required: false, type: Number })
  year?: number;

  @ApiProperty({ name: 'total', type: Number })
  total!: number;

  @ApiProperty({ name: 'cnpqProjects', type: Number })
  cnpqProjects!: number;

  @ApiProperty({ name: 'facepeProjects', type: Number })
  facepeProjects!: number;

  @ApiProperty({ name: 'capesProjects', type: Number })
  capesProjects!: number;

  @ApiProperty({ name: 'concludedProjects', type: Number })
  concludedProjects?: number;

  @ApiProperty({ name: 'projectsInProgress', type: Number })
  projectsInProgress?: number;

  @ApiProperty({ name: 'noFinancier', type: Number })
  noFinancier!: number;

  @ApiProperty({ name: 'anotherFinancier', type: Number })
  anotherFinancier!: number;
}

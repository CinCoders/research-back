import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('ProfessorResearchProjectDto')
export class ProfessorResearchProjectDto {
  @ApiProperty({ name: 'professorId', type: Number })
  professorId!: number;

  @ApiProperty({ name: 'professorName', type: String })
  professorName!: string;

  @ApiProperty({ name: 'total', type: Number })
  total!: number;

  @ApiProperty({ name: 'cnpqProjects', type: Number })
  cnpqProjects!: number;

  @ApiProperty({ name: 'facepeProjects', type: Number })
  facepeProjects!: number;

  @ApiProperty({ name: 'capesProjects', type: Number })
  capesProjects!: number;

  @ApiProperty({ name: 'concludedProjects', type: Number })
  concludedProjects!: number;

  @ApiProperty({ name: 'projectsInProgress', type: Number })
  projectsInProgress!: number;

  @ApiProperty({ name: 'noFinancier', type: Number })
  noFinancier!: number;

  @ApiProperty({ name: 'anotherFinancier', type: Number })
  anotherFinancier!: number;
}

import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('StudentsDto')
export class StudentsDto {
  @ApiProperty({ name: 'professorId', required: false, type: Number })
  professorId?: number;

  @ApiProperty({ name: 'professorName', required: false, type: String })
  professorName?: string;

  @ApiProperty({ name: 'year', required: false, type: Number })
  year?: number;

  @ApiProperty({ name: 'total', type: Number })
  total!: number;

  @ApiProperty({ name: 'undergradResearchAdvisor', type: Number })
  undergradResearchAdvisor!: number;

  @ApiProperty({ name: 'mastersMainAdvisor', type: Number })
  mastersMainAdvisor!: number;

  @ApiProperty({ name: 'phdMainAdvisor', type: Number })
  phdMainAdvisor!: number;

  @ApiProperty({ name: 'mastersCoAdvisor', type: Number })
  mastersCoAdvisor!: number;

  @ApiProperty({ name: 'phdCoAdvisor', type: Number })
  phdCoAdvisor!: number;

  @ApiProperty({ name: 'postdocAdvisor', type: Number })
  postdocAdvisor!: number;
}

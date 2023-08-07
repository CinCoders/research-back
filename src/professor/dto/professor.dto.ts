import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('ProfessorDto')
export class ProfessorDto {
  @ApiProperty({ name: 'professorId', type: Number })
  professorId!: number;

  @ApiProperty({ name: 'professorName', type: String })
  professorName!: string;

  @ApiProperty({ name: 'identifier', type: String })
  identifier?: string;
}

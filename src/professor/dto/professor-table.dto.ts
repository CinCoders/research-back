import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('ProfessorTableDto')
export class ProfessorTableDto {
  @ApiProperty({ name: 'id', type: Number })
  professorId!: number;

  @ApiProperty({ name: 'name', type: String })
  professorName!: string;

  @ApiProperty({ name: 'identifier', type: String })
  identifier?: string;

  @ApiProperty({ name: 'computerArticles', type: Number })
  computerArticles!: number;

  @ApiProperty({ name: 'computerPublications', type: Number })
  computerPublications!: number;

  @ApiProperty({ name: 'books', type: Number })
  books!: number;

  @ApiProperty({ name: 'patents', type: Number })
  patents!: number;

  @ApiProperty({ name: 'artisticProductions', type: Number })
  artisticProductions!: number;
}

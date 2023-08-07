import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Professor } from '../entities/professor.entity';

@ApiTags('JournalPublicationDto')
export class JournalPublicationDto {
  @ApiProperty({ name: 'professor', type: Professor })
  professor!: Professor;

  @ApiProperty({ name: 'title', type: String })
  title!: string;

  @ApiProperty({ name: 'year', type: String })
  year!: string;

  @ApiProperty({ name: 'doi', type: String })
  doi!: string;

  @ApiProperty({ name: 'issn', type: String })
  issn!: string;

  @ApiProperty({ name: 'journalTitle', type: String, nullable: true })
  journalTitle?: string;

  @ApiProperty({ name: 'authors', type: String, nullable: true })
  authors?: string;
}

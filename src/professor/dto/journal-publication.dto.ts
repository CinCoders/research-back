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

  @ApiProperty({ name: 'bigArea', type: String, nullable: true })
  bigArea?: string;

  @ApiProperty({ name: 'area', type: String, nullable: true })
  area?: string;

  @ApiProperty({ name: 'subArea', type: String, nullable: true })
  subArea?: string;

  @ApiProperty({ name: 'speciality', type: String, nullable: true })
  speciality?: string;

  @ApiProperty({ name: 'bigArea2', type: String, nullable: true })
  bigArea2?: string;

  @ApiProperty({ name: 'area2', type: String, nullable: true })
  area2?: string;

  @ApiProperty({ name: 'subArea2', type: String, nullable: true })
  subArea2?: string;

  @ApiProperty({ name: 'speciality2', type: String, nullable: true })
  speciality2?: string;

  @ApiProperty({ name: 'authors', type: String, nullable: true })
  authors?: string;
}

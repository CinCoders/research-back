import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Professor } from '../entities/professor.entity';

@ApiTags('TranslationDto')
export class TranslationDto {
  @ApiProperty({ name: 'professor', type: Professor })
  professor!: Professor;

  @ApiProperty({ name: 'title', type: String, nullable: true })
  title?: string;

  @ApiProperty({ name: 'language', type: String, nullable: true })
  language?: string;

  @ApiProperty({ name: 'year', type: Number, nullable: true })
  year?: number;

  @ApiProperty({ name: 'publicationCountry', type: String, nullable: true })
  publicationCountry?: string;

  @ApiProperty({ name: 'publicationCountry', type: String, nullable: true })
  issn?: string;

  @ApiProperty({ name: 'originalTitle', type: String, nullable: true })
  originalTitle?: string;

  @ApiProperty({ name: 'originalLanguage', type: String, nullable: true })
  originalLanguage?: string;

  @ApiProperty({ name: 'originalAuthor', type: String, nullable: true })
  originalAuthor?: string;

  @ApiProperty({
    name: 'originalPublicationCity',
    type: String,
    nullable: true,
  })
  originalPublicationCity?: string;

  @ApiProperty({ name: 'bigArea', type: String, nullable: true })
  bigArea?: string;

  @ApiProperty({ name: 'area', type: String, nullable: true })
  area?: string;

  @ApiProperty({ name: 'subArea', type: String, nullable: true })
  subArea?: string;

  @ApiProperty({ name: 'speciality', type: String, nullable: true })
  speciality?: string;

  @ApiProperty({ name: 'authors', type: String })
  authors?: string;
}

import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Professor } from '../entities/professor.entity';

@ApiTags('ConferenceDto')
export class ConferenceDto {
  @ApiProperty({ name: 'professor', type: Professor })
  professor!: Professor;

  @ApiProperty({ name: 'title', type: String })
  title!: string;

  @ApiProperty({ name: 'year', type: String })
  year!: string;

  @ApiProperty({ name: 'event', type: String })
  event!: string;

  @ApiProperty({ name: 'doi', type: String })
  doi?: string;

  @ApiProperty({ name: 'proceedings', type: String })
  proceedings!: string;

  @ApiProperty({ name: 'bigArea', type: String, nullable: true })
  bigArea?: string;

  @ApiProperty({ name: 'journaarealTitle', type: String, nullable: true })
  area?: string;

  @ApiProperty({ name: 'subArea', type: String, nullable: true })
  subArea?: string;

  @ApiProperty({ name: 'speciality', type: String, nullable: true })
  speciality?: string;

  @ApiProperty({ name: 'authors', type: String })
  authors!: string;
}

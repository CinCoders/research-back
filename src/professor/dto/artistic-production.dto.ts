import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Professor } from '../entities/professor.entity';

@ApiTags('ArtisticProductionDto')
export class ArtisticProductionDto {
  @ApiProperty({ name: 'professor', type: Professor })
  professor!: Professor;

  @ApiProperty({ name: 'title', type: String })
  title!: string;

  @ApiProperty({ name: 'language', type: String })
  language!: string;

  @ApiProperty({ name: 'year', type: Number })
  year!: number;

  @ApiProperty({ name: 'country', type: String })
  country!: string;

  @ApiProperty({ name: 'authorActivity', type: String })
  authorActivity!: string;

  @ApiProperty({ name: 'promotingInstitution', type: String })
  promotingInstitution!: string;

  @ApiProperty({ name: 'bigArea', type: String, nullable: true })
  bigArea?: string;

  @ApiProperty({ name: 'area', type: String, nullable: true })
  area?: string;

  @ApiProperty({ name: 'subArea', type: String, nullable: true })
  subArea?: string;

  @ApiProperty({ name: 'speciality', type: String, nullable: true })
  speciality?: string;

  @ApiProperty({ name: 'authors', type: String, nullable: true })
  authors?: string;
}

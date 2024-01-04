import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Professor } from '../entities/professor.entity';

@ApiTags('PatentDto')
export class PatentDto {
  @ApiProperty({ name: 'professor', type: Professor })
  professor!: Professor;

  @ApiProperty({ name: 'title', type: String })
  title!: string;

  @ApiProperty({ name: 'developmentYear', type: Number })
  developmentYear!: string;

  @ApiProperty({ name: 'country', type: Number })
  country!: string;

  @ApiProperty({ name: 'situationStatus', type: String })
  situationStatus!: string;

  @ApiProperty({ name: 'category', type: String })
  category!: string;

  @ApiProperty({ name: 'patentType', type: String, nullable: true })
  patentType?: string;

  @ApiProperty({ name: 'registryCode', type: String, nullable: true })
  registryCode?: string;

  @ApiProperty({
    name: 'depositRegistrationInstitution',
    type: String,
    nullable: true,
  })
  depositRegistrationInstitution?: string;

  @ApiProperty({ name: 'depositantName', type: String, nullable: true })
  depositantName?: string;

  @ApiProperty({ name: 'authors', type: String, nullable: true })
  authors?: string;
}

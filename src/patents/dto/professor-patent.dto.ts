import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('ProfessorPatentDto')
export class ProfessorPatentDto {
  @ApiProperty({ name: 'id', type: Number })
  id!: number;

  @ApiProperty({ name: 'title', type: String })
  title!: string;

  @ApiProperty({ name: 'authors', type: String })
  authors!: string;

  @ApiProperty({ name: 'developmentYear', type: String })
  developmentYear!: string;

  @ApiProperty({ name: 'country', type: String })
  country!: string;

  @ApiProperty({ name: 'category', type: String })
  category!: string;

  @ApiProperty({ name: 'patentType', type: String })
  patentType!: string;

  @ApiProperty({ name: 'registryCode', type: String })
  registryCode!: string;
}

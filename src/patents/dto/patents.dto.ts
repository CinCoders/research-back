import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('PatentsDto')
export class PatentsDto {
  @ApiProperty({ name: 'id', type: Number })
  id!: number;

  @ApiProperty({ name: 'professorId', required: false, type: Number })
  professorId?: number;

  @ApiProperty({ name: 'professorName', required: false, type: String })
  professorName?: string;

  @ApiProperty({ name: 'title', type: String })
  title!: string;

  @ApiProperty({ name: 'country', type: String })
  country!: string;

  @ApiProperty({ name: 'year', required: false, type: Number })
  year?: number;

  @ApiProperty({ name: 'category', type: String })
  category!: string;

  @ApiProperty({ name: 'patentType', type: String })
  patentType!: string;

  @ApiProperty({ name: 'registryCode', type: String })
  registryCode!: string;

  @ApiProperty({ name: 'authors', type: String })
  authors!: string;

  @ApiProperty({ name: 'total', type: Number })
  total!: number;
}

import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('ProfessorProjectFinancier')
export class ProfessorProjectFinancierDto {
  @ApiProperty({ name: 'id', type: Number })
  id!: number;

  @ApiProperty({ name: 'year', type: Number })
  year!: number;

  @ApiProperty({ name: 'name', type: String })
  name!: string;

  @ApiProperty({ name: 'inProgress', type: Boolean })
  inProgress!: boolean;

  @ApiProperty({ name: 'cnpqProject', type: Boolean })
  cnpqProject!: boolean;

  @ApiProperty({ name: 'facepeProject', type: Boolean })
  facepeProject!: boolean;

  @ApiProperty({ name: 'capesProject', type: Boolean })
  capesProject!: boolean;

  @ApiProperty({ name: 'anotherFinanciers', type: Boolean })
  anotherFinanciers!: boolean;
}

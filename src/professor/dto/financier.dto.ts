import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('FinancierDto')
export class FinancierDto {
  @ApiProperty({ name: 'name', type: String })
  name!: string;

  @ApiProperty({ name: 'code', type: String })
  code!: string;

  @ApiProperty({ name: 'nature', type: String })
  nature!: string;
}

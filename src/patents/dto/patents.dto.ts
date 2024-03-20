import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('PatentsDto')
export class PatentsDto {
  @ApiProperty({ name: 'professorId', required: false, type: Number })
  professorId?: number;

  @ApiProperty({ name: 'professorName', required: false, type: String })
  professorName?: string;

  @ApiProperty({ name: 'year', required: false, type: Number })
  year?: number;

  @ApiProperty({ name: 'totalInventionPatents', type: Number })
  totalInventionPatents!: number;

  @ApiProperty({ name: 'totalUtilityModelPatents', type: Number })
  totalUtilityModelPatents!: number;

  @ApiProperty({ name: 'totalDepositPatents', type: Number })
  totalDepositPatents!: number;

  @ApiProperty({ name: 'totalGrantPatents', type: Number })
  totalGrantPatents!: number;

  @ApiProperty({ name: 'totalLicensePatents', type: Number })
  totalLicensePatents!: number;

  @ApiProperty({ name: 'brazilianPatents', type: Number })
  brazilianPatents!: number;

  @ApiProperty({ name: 'internationalPatents', type: Number })
  internationalPatents!: number;

  @ApiProperty({ name: 'total', type: Number })
  total!: number;
}

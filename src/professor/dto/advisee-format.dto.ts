import { ApiTags, ApiProperty } from '@nestjs/swagger';

@ApiTags('AdviseeFormatDto')
export class AdviseeFormatDto {
  @ApiProperty({ name: 'name', type: String })
  name!: string;

  @ApiProperty({ name: 'type', type: String })
  type!: string;

  @ApiProperty({ name: 'degree', type: String })
  degree!: string;

  @ApiProperty({ name: 'yearStart', type: Number })
  yearStart?: number;

  @ApiProperty({ name: 'yearEnd', type: Number })
  yearEnd?: number;
}

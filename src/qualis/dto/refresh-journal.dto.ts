import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

@ApiTags('RefreshJournalDto')
export class RefreshJournalDto {
  @ApiProperty({ name: 'name', type: String })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ name: 'issn', type: String })
  @IsString()
  @IsNotEmpty()
  issn!: string;

  @ApiProperty({ name: 'qualis', type: String })
  @IsString()
  @IsNotEmpty()
  qualis!: string;
}

import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@ApiTags('CreateJournalDto')
export class CreateJournalDto {
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

  @ApiProperty({ name: 'isTop', type: Boolean })
  @IsNotEmpty()
  @IsBoolean()
  isTop!: boolean;

  @ApiProperty({ name: 'isOficial', type: Boolean })
  @IsNotEmpty()
  @IsBoolean()
  official!: boolean;

  @ApiProperty({ name: 'derivedFromId', type: Number })
  @IsOptional()
  @IsNumber()
  derivedFromId?: number;
}

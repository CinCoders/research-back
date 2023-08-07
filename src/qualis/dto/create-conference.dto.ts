import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ApiTags('CreateConferenceDto')
export class CreateConferenceDto {
  @ApiProperty({ name: 'acronym', type: String })
  @IsString()
  @IsNotEmpty()
  acronym!: string;

  @ApiProperty({ name: 'name', type: String })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ name: 'qualis', type: String })
  @IsString()
  @IsNotEmpty()
  qualis!: string;

  @ApiProperty({ name: 'isTop', type: Boolean })
  @IsBoolean()
  @IsNotEmpty()
  isTop!: boolean;

  @ApiProperty({ name: 'official', type: Boolean })
  @IsNotEmpty()
  @IsBoolean()
  official!: boolean;

  @ApiProperty({ name: 'derivedFromId', type: Number })
  @IsOptional()
  derivedFromId?: number;
}

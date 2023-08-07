import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';

@ApiTags('UpdateConferenceDto')
export class UpdateConferenceDto {
  @ApiProperty({ name: 'id', type: Number })
  @IsNumber()
  id!: number;

  @ApiProperty({ name: 'acronym', type: String })
  @IsString({ message: 'acronym must be a string' })
  @IsOptional()
  acronym?: string;

  @ApiProperty({ name: 'name', type: String })
  @IsString({ message: 'name must be a string' })
  @IsOptional()
  name?: string;

  @ApiProperty({ name: 'qualis', type: String })
  @IsString({ message: 'qualis must be a string' })
  @IsOptional()
  qualis?: string;

  @ApiProperty({ name: 'isTop', type: Boolean })
  @IsBoolean({ message: 'isTop must be a boolean' })
  @IsOptional()
  isTop?: boolean;
}

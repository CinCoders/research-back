import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';

@ApiTags('RefreshConferenceDto')
export class RefreshConferenceDto {
  @ApiProperty({ name: 'acronym', type: String })
  @IsString({ message: 'acronym must be a string' })
  acronym!: string;

  @ApiProperty({ name: 'name', type: String })
  @IsString({ message: 'name must be a string' })
  name!: string;

  @ApiProperty({ name: 'qualis', type: String })
  @IsString({ message: 'qualis must be a string' })
  qualis!: string;
}

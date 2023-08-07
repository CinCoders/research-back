import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Professor } from '../entities/professor.entity';

@ApiTags('ConferenceDto')
export class ConferenceDto {
  @ApiProperty({ name: 'professor', type: Professor })
  professor!: Professor;

  @ApiProperty({ name: 'title', type: String })
  title!: string;

  @ApiProperty({ name: 'year', type: String })
  year!: string;

  @ApiProperty({ name: 'event', type: String })
  event!: string;

  @ApiProperty({ name: 'doi', type: String })
  doi?: string;

  @ApiProperty({ name: 'proceedings', type: String })
  proceedings!: string;

  @ApiProperty({ name: 'authors', type: String })
  authors!: string;
}

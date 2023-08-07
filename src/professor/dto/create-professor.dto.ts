import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('CreateProfessorDto')
export class CreateProfessorDto {
  @ApiProperty({ name: 'name', type: String })
  name!: string;

  @ApiProperty({ name: 'identifier', type: String })
  identifier!: string;
}

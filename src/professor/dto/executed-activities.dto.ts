import { ApiTags, ApiProperty } from '@nestjs/swagger';

@ApiTags('ExecutedActivitiesDto')
export class ExecutedActivitiesDto {
  @ApiProperty({ name: 'projects', type: Boolean })
  projects!: boolean;

  @ApiProperty({ name: 'publications', type: Boolean })
  publications!: boolean;

  @ApiProperty({ name: 'supervisions', type: Boolean })
  supervisions!: boolean;

  @ApiProperty({ name: 'patents', type: Boolean })
  patents!: boolean;
}

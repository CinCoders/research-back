import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({ name: 'page' })
  page!: number;

  @ApiProperty({ name: 'limit' })
  limit!: number;

  @ApiProperty({ name: 'offset' })
  offset?: number;
}

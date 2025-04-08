import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('Page')
export class Page<T> {
  @ApiProperty({ description: 'The data returned', type: [] })
  data!: T[];

  @ApiProperty({ description: 'The current page in the table', type: Number })
  currentPage!: number;

  @ApiProperty({
    description: 'The total number of pages for a given page size',
    type: Number,
  })
  totalPages!: number;

  @ApiProperty({
    description: 'The total number of elements in a page',
    type: Number,
  })
  totalElements!: number;

  @ApiProperty({
    description: 'The size of the page of a table (number of elements to display)',
    type: Number,
  })
  pageSize!: number;

  @ApiProperty({
    description: 'The name of the elements skipped in the query',
    type: Number,
  })
  offset!: number;
}

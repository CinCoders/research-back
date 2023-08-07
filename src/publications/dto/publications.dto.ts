import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('PublicationsDto')
export class PublicationsDto {
  @ApiProperty({ name: 'year', type: Number, required: false })
  year?: number;

  @ApiProperty({
    name: 'professorId',
    type: Number,
    example: 33,
    required: false,
  })
  professorId?: number;

  @ApiProperty({
    name: 'professorName',
    type: String,
    example: 'Djamel Fawzi Hadj Sadok',
    required: false,
  })
  professorName?: string;

  @ApiProperty({ name: 'total', type: Number })
  total!: number;

  @ApiProperty({ name: 'top', type: Number })
  top!: number;

  @ApiProperty({ name: 'top5Years', type: Number, required: false })
  top5Years?: number;

  @ApiProperty({ name: 'a1', type: Number })
  a1!: number;

  @ApiProperty({ name: 'a2', type: Number })
  a2!: number;

  @ApiProperty({ name: 'a3', type: Number })
  a3!: number;

  @ApiProperty({ name: 'a4', type: Number })
  a4!: number;

  @ApiProperty({ name: 'b1', type: Number })
  b1!: number;

  @ApiProperty({ name: 'b2', type: Number })
  b2!: number;

  @ApiProperty({ name: 'b3', type: Number })
  b3!: number;

  @ApiProperty({ name: 'b4', type: Number })
  b4!: number;

  @ApiProperty({ name: 'b5', type: Number })
  b5!: number;

  @ApiProperty({ name: 'c', type: Number })
  c!: number;

  @ApiProperty({ name: 'noQualis', type: Number })
  noQualis!: number;
}

import { ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ApiTags('Journal')
@Entity({ name: 'journal' })
export class Journal {
  @ApiProperty({ name: 'id', type: Number })
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    generatedIdentity: 'BY DEFAULT',
  })
  id!: number;

  @ApiProperty({ name: 'name', type: String })
  @Column({ name: 'name', length: 255 })
  name!: string;

  @ApiProperty({ name: 'issn', type: String })
  @Column({ name: 'issn', length: 18 })
  issn!: string;

  @ApiProperty({ name: 'qualis', type: String })
  @Column({ name: 'qualis', length: 4, nullable: true })
  qualis!: string;

  @ApiProperty({ name: 'isTop', type: Boolean })
  @Column({ name: 'is_top', default: false })
  isTop!: boolean;

  @ApiProperty({ name: 'official', type: Boolean })
  @Column({ name: 'official', default: false })
  official!: boolean;

  @ApiProperty({ name: 'derivedFrom', type: Number })
  @ManyToOne(() => Journal)
  @JoinColumn({ name: 'derived_from_id' })
  derivedFrom!: Journal;
}

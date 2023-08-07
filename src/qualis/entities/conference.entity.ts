import { ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ApiTags('Conference')
@Entity({ name: 'conference' })
export class Conference {
  @ApiProperty({ name: 'id', type: Number })
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    generatedIdentity: 'BY DEFAULT',
  })
  id!: number;

  @ApiProperty({ name: 'acronym', type: String })
  @Column({ name: 'acronym', length: 255 })
  acronym!: string;

  @ApiProperty({ name: 'name', type: String })
  @Column({ name: 'name', length: 255 })
  name!: string;

  @ApiProperty({ name: 'qualis', type: String })
  @Column({ name: 'qualis', length: 4, nullable: true })
  qualis?: string;

  @ApiProperty({ name: 'isTop', type: Boolean })
  @Column({ name: 'is_top', default: false })
  isTop!: boolean;

  @ApiProperty({ name: 'official', type: Boolean })
  @Column({ name: 'official', default: false })
  official!: boolean;

  @ApiProperty({ name: 'derivedFrom', type: Number })
  @ManyToOne(() => Conference)
  @JoinColumn({ name: 'derived_from_id' })
  derivedFrom!: Conference;
}

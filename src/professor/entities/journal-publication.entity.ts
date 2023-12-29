import { ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Journal } from '../../qualis/entities/journal.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Professor } from './professor.entity';

@ApiTags('JournalPublication')
@Entity({ name: 'journal_publication' })
export class JournalPublication {
  @ApiProperty({ name: 'id', type: Number })
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    generatedIdentity: 'BY DEFAULT',
  })
  id!: number;

  @ApiProperty({ name: 'professor', type: Number })
  @ManyToOne(() => Professor, (professor) => professor.journalPublication)
  @JoinColumn({ name: 'professor_id' })
  professor!: Professor;

  @ApiPropertyOptional({ name: 'journal', type: Number })
  @ManyToOne(() => Journal, { nullable: true })
  @JoinColumn({ name: 'journal_id' })
  journal?: Journal;

  @ApiProperty({ name: 'title', type: String })
  @Column({ name: 'title', length: 500 })
  title!: string;

  @ApiProperty({ name: 'year', type: Number })
  @Column({ name: 'year' })
  year!: number;

  @ApiProperty({ name: 'doi', type: String })
  @Column({ name: 'doi', length: 100 })
  doi!: string;

  @ApiProperty({ name: 'isTop', type: Boolean })
  @Column({ name: 'is_top', default: false })
  isTop!: boolean;

  @ApiProperty({ name: 'issn', type: String })
  @Column({ name: 'issn', length: 16 })
  issn!: string;

  @ApiProperty({ name: 'journalTitle', type: String, nullable: true })
  @Column({ name: 'journal_title', length: 100, nullable: true })
  journalTitle?: string;

  @ApiProperty({ name: 'qualis', type: String, nullable: true })
  @Column({ name: 'qualis', length: 4, nullable: true })
  qualis?: string;

  @ApiProperty({ name: 'bigArea', type: String })
  @Column({ name: 'bigArea', nullable: true })
  bigArea?: string;

  @ApiProperty({ name: 'area', type: String })
  @Column({ name: 'area', nullable: true })
  area?: string;

  @ApiProperty({ name: 'subArea', type: String })
  @Column({ name: 'subArea', nullable: true })
  subArea?: string;

  @ApiProperty({ name: 'speciality', type: String })
  @Column({ name: 'speciality', nullable: true })
  speciality?: string;

  @ApiProperty({ name: 'authors', type: String, nullable: true })
  @Column({ name: 'authors', length: 1500, nullable: true })
  authors?: string;
}

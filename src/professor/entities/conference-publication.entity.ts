import { ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Conference } from '../../qualis/entities/conference.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Professor } from './professor.entity';

@ApiTags('ConferencePublication')
@Entity({ name: 'conference_publication' })
export class ConferencePublication {
  @ApiProperty({ name: 'id', type: Number })
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    generatedIdentity: 'BY DEFAULT',
  })
  id!: number;

  @ApiProperty({ name: 'professor', type: Number })
  @ManyToOne(() => Professor, (professor) => professor.conferencePublications)
  @JoinColumn({ name: 'professor_id' })
  professor!: Professor;

  @ApiPropertyOptional({ name: 'conference', type: Number })
  @ManyToOne(() => Conference)
  @JoinColumn({ name: 'conference_id' })
  conference?: Conference;

  @ApiProperty({ name: 'title', type: String })
  @Column({ name: 'title', length: 255 })
  title!: string;

  @ApiProperty({ name: 'event', type: String })
  @Column({ name: 'event', length: 255 })
  event!: string;

  @ApiProperty({ name: 'doi', type: String, nullable: true })
  @Column({ name: 'doi', length: 50, nullable: true })
  doi?: string;

  @ApiProperty({ name: 'proceedings', type: String })
  @Column({ name: 'proceedings', length: 255 })
  proceedings!: string;

  @ApiProperty({ name: 'year', type: Number })
  @Column({ name: 'year' })
  year!: number;

  @ApiProperty({ name: 'isTop', type: Boolean })
  @Column({ name: 'is_top', default: false })
  isTop!: boolean;

  @ApiProperty({ name: 'qualis', type: String })
  @Column({ name: 'qualis', length: 4 })
  qualis!: string;

  @ApiProperty({ name: 'authors', type: String })
  @Column({ name: 'authors', length: 1500, nullable: true })
  authors?: string;
}

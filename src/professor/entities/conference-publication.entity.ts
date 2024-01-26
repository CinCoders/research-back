import { ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Conference } from '../../qualis/entities/conference.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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
  @ManyToOne(() => Professor, professor => professor.conferencePublications)
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

  @ApiProperty({ name: 'nature', type: String, nullable: true })
  @Column({ name: 'nature', length: 50, nullable: true })
  nature?: string;

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

  @ApiProperty({ name: 'bigArea2', type: String })
  @Column({ name: 'bigArea2', nullable: true })
  bigArea2?: string;

  @ApiProperty({ name: 'area2', type: String })
  @Column({ name: 'area2', nullable: true })
  area2?: string;

  @ApiProperty({ name: 'subArea2', type: String })
  @Column({ name: 'subArea2', nullable: true })
  subArea2?: string;

  @ApiProperty({ name: 'speciality2', type: String })
  @Column({ name: 'speciality2', nullable: true })
  speciality2?: string;

  @ApiProperty({ name: 'authors', type: String })
  @Column({ name: 'authors', length: 1500, nullable: true })
  authors?: string;
}

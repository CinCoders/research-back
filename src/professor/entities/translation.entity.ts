import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Professor } from './professor.entity';

@ApiTags('Translation')
@Entity({ name: 'translation' })
export class Translation {
  @ApiProperty({ name: 'id', type: Number })
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    generatedIdentity: 'BY DEFAULT',
  })
  id!: number;

  @ApiProperty({ name: 'professor', type: Number })
  @ManyToOne(() => Professor, professor => professor.book)
  @JoinColumn({ name: 'professor_id' })
  professor!: Professor;

  @ApiProperty({ name: 'title', type: String, nullable: true })
  @Column({ name: 'title', nullable: true })
  title?: string;

  @ApiProperty({ name: 'language', type: String, nullable: true })
  @Column({ name: 'language', nullable: true })
  language?: string;

  @ApiProperty({ name: 'year', type: Number, nullable: true })
  @Column({ name: 'year', nullable: true })
  year?: number;

  @ApiProperty({ name: 'publicationCountry', type: String, nullable: true })
  @Column({ name: 'publicationCountry', nullable: true })
  publicationCountry?: string;

  @ApiProperty({ name: 'issn', type: String, nullable: true })
  @Column({ name: 'issn', nullable: true })
  issn?: string;

  @ApiProperty({ name: 'originalTitle', type: String, nullable: true })
  @Column({ name: 'originalTitle', nullable: true })
  originalTitle?: string;

  @ApiProperty({ name: 'originalLanguage', type: String, nullable: true })
  @Column({ name: 'originalLanguage', nullable: true })
  originalLanguage?: string;

  @ApiProperty({ name: 'originalAuthor', type: String, nullable: true })
  @Column({ name: 'originalAuthor', nullable: true })
  originalAuthor?: string;

  @ApiProperty({
    name: 'originalPublicationCity',
    type: String,
    nullable: true,
  })
  @Column({ name: 'originalPublicationCity', nullable: true })
  originalPublicationCity?: string;

  @ApiProperty({ name: 'bigArea', type: String, nullable: true })
  @Column({ name: 'bigArea', nullable: true })
  bigArea?: string;

  @ApiProperty({ name: 'area', type: String, nullable: true })
  @Column({ name: 'area', nullable: true })
  area?: string;

  @ApiProperty({ name: 'subArea', type: String, nullable: true })
  @Column({ name: 'subArea', nullable: true })
  subArea?: string;

  @ApiProperty({ name: 'speciality', type: String, nullable: true })
  @Column({ name: 'speciality', nullable: true })
  speciality?: string;

  @ApiProperty({ name: 'authors', type: String })
  @Column({ name: 'authors', length: 1500, nullable: true })
  authors?: string;
}

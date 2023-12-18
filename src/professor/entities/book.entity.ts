import { ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Professor } from './professor.entity';

@ApiTags('Book')
@Entity({ name: 'book' })
export class Book {
  @ApiProperty({ name: 'id', type: Number })
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    generatedIdentity: 'BY DEFAULT',
  })
  id!: number;

  @ApiProperty({ name: 'professor', type: Number })
  @ManyToOne(() => Professor, (professor) => professor.book)
  @JoinColumn({ name: 'professor_id' })
  professor!: Professor;

  @ApiProperty({ name: 'title', type: String })
  @Column({ name: 'title' })
  title!: string;

  @ApiProperty({ name: 'language', type: String })
  @Column({ name: 'language' })
  language!: string;

  @ApiProperty({ name: 'year', type: Number })
  @Column({ name: 'year' })
  year!: number;

  @ApiProperty({ name: 'publicationCountry', type: String })
  @Column({ name: 'publicationCountry' })
  publicationCountry!: string;

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

  @ApiProperty({ name: 'authors', type: String })
  @Column({ name: 'authors', length: 1500, nullable: true })
  authors?: string;
}

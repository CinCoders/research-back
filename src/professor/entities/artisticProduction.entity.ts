import { ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Professor } from './professor.entity';

@ApiTags('ArtisticProduction')
@Entity({ name: 'artistic_production' })
export class ArtisticProduction {
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

  @ApiProperty({ name: 'country', type: String })
  @Column({ name: 'country' })
  country!: string;

  @ApiProperty({ name: 'authorActivity', type: String, nullable: true })
  @Column({ name: 'authorActivity', nullable: true })
  authorActivity?: string;

  @ApiProperty({ name: 'promotingInstitution', type: String, nullable: true })
  @Column({ name: 'promotingInstitution', nullable: true })
  promotingInstitution?: string;

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

  @ApiProperty({ name: 'authors', type: String, nullable: true })
  @Column({ name: 'authors', length: 1500, nullable: true })
  authors?: string;
}

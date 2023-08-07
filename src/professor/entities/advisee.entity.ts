import { ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Financier } from './financier.entity';
import { Professor } from './professor.entity';

@ApiTags('Advisee')
@Entity({ name: 'advisee' })
export class Advisee {
  @ApiProperty({ name: 'id', type: Number })
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    generatedIdentity: 'BY DEFAULT',
  })
  id!: number;

  @ApiProperty({ name: 'professor', type: Number })
  @ManyToOne(() => Professor, (professor) => professor.advisees)
  @JoinColumn({ name: 'professor_id' })
  professor!: Professor;

  @ApiProperty({ name: 'type', type: String })
  @Column({
    name: 'type',
    length: 255,
    enum: ['ORIENTADOR_PRINCIPAL', 'CO_ORIENTADOR'],
  })
  type!: string;

  @ApiProperty({ name: 'degree', type: String })
  @Column({
    name: 'degree',
    length: 255,
    enum: ['DOUTORADO', 'MESTRADO', 'POS-DOUTORADO', 'INICIACAO-CIENTIFICA'],
  })
  degree!: string;

  @ApiProperty({ name: 'yearStart', type: Number })
  @Column({ name: 'year_start', nullable: true })
  yearStart?: number;

  @ApiProperty({ name: 'yearEnd', type: Number })
  @Column({ name: 'year_end', nullable: true })
  yearEnd?: number;

  @ApiProperty({ name: 'name', type: String })
  @Column({ name: 'name', length: 200 })
  name!: string;

  @ApiProperty({ name: 'institution', type: String, nullable: true })
  @Column({ name: 'institution', length: 100 })
  institution?: string;

  @ApiProperty({ name: 'title', type: String, nullable: true })
  @Column({ name: 'title', length: 100 })
  title?: string;

  @ApiProperty({ name: 'course', type: String, nullable: true })
  @Column({ name: 'course', length: 100 })
  course?: string;

  @ApiProperty({ name: 'schoolarship', type: Boolean, nullable: true })
  @Column({ name: 'schoolarship' })
  schoolarship?: boolean;

  @ApiProperty({ name: 'financier', type: Financier, nullable: true })
  @ManyToOne(() => Financier, (financier) => financier.advisee, {
    nullable: true,
  })
  financier?: Financier;
}

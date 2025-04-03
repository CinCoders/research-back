import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Professor } from './professor.entity';
import { ProjectFinancier } from './projectFinancier.entity';

@ApiTags('project')
@Entity({ name: 'project' })
export class Project {
  @ApiProperty({ name: 'id', type: Number })
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    generatedIdentity: 'BY DEFAULT',
  })
  id!: number;

  @ApiProperty({ name: 'professor', type: Number })
  @ManyToOne(() => Professor, (professor) => professor.projects)
  @JoinColumn({ name: 'professor_id' })
  professor!: Professor;

  @ApiProperty({ name: 'year', type: Number })
  @Column({ name: 'year' })
  yearStart!: number;

  @ApiProperty({ name: 'name', type: String })
  @Column({ name: 'name', length: 300 })
  name!: string;

  @ApiProperty({ name: 'periodFlag', type: String })
  @Column({ name: 'period_flag', length: 15, nullable: false })
  periodFlag!: string;

  @OneToMany(() => ProjectFinancier, (projectFinancier) => projectFinancier.project)
  projectFinancier!: ProjectFinancier[];
}

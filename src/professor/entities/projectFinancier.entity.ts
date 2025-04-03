import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Financier } from './financier.entity';
import { Project } from './projects.entity';

@ApiTags('projectFinancier')
@Entity({ name: 'project_financier' })
export class ProjectFinancier {
  @ApiProperty({ name: 'id', type: Number })
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    generatedIdentity: 'BY DEFAULT',
  })
  id!: number;

  @ManyToOne(() => Project, (project) => project.projectFinancier)
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @ManyToOne(() => Financier, (financier) => financier.projectFinancier)
  @JoinColumn({ name: 'financier_id' })
  financier!: Financier;

  @ApiProperty({ name: 'nature', type: String })
  @Column({ name: 'nature', length: 50 })
  nature!: string;
}

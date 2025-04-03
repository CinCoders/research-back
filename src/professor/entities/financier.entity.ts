import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Advisee } from './advisee.entity';
import { ProjectFinancier } from './projectFinancier.entity';

@ApiTags('financier')
@Entity({ name: 'financier' })
export class Financier {
  @ApiProperty({ name: 'id', type: Number })
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    generatedIdentity: 'BY DEFAULT',
  })
  id!: number;

  @ApiProperty({ name: 'acronym', type: String })
  @Column({ name: 'acronym', length: 10, nullable: true })
  acronym!: string;

  @ApiProperty({ name: 'name', type: String })
  @Column({ name: 'name', length: 100, nullable: true })
  name!: string;

  @ApiProperty({ name: 'code', type: String })
  @Column({ name: 'code', length: 100, nullable: true })
  code!: string;

  @OneToMany(() => ProjectFinancier, (projectFinancier) => projectFinancier.financier)
  projectFinancier!: ProjectFinancier[];

  @OneToMany(() => Advisee, (advisee) => advisee.financier)
  advisee?: Advisee[];
}

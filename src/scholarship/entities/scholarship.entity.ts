import { ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Professor } from '../../professor/entities/professor.entity';

@ApiTags('Scholarship')
@Entity({ name: 'scholarship' })
export class Scholarship {
  @ApiProperty({ name: 'id', type: Number })
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id!: number;

  @ApiProperty({ name: 'name', type: String, nullable: true })
  @Column({ name: 'name', nullable: true })
  name?: string;

  @ApiProperty({ name: 'description', type: String, nullable: true })
  @Column({ name: 'description', nullable: true })
  description?: string;

  @ApiProperty({ name: 'createdAt', type: Date })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ name: 'updatedAt', type: Date })
  @UpdateDateColumn()
  updatedAt!: Date;

  @ApiProperty({
    name: 'professot',
    type: Professor,
    nullable: true,
  })
  @OneToMany(() => Professor, (professor) => professor.scholarship, {
    nullable: true,
  })
  professor?: Professor[];
}

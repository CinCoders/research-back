import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@ApiTags('XML Imports')
@Entity({ name: 'xml_imports' })
export class ImportXml {
  @ApiProperty()
  @PrimaryColumn({ name: 'id' })
  id!: string;

  @ApiProperty()
  @Column({ name: 'name', length: 50 })
  name!: string;

  @ApiProperty()
  @Column({ name: 'professor_name', length: 100, nullable: true })
  professorName?: string;

  @ApiProperty()
  @Column({ name: 'user', length: 80 })
  user!: string;

  @ApiProperty()
  @Column({ name: 'status' })
  status!: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'included_at', type: 'timestamptz' })
  includedAt!: Date;

  @ApiProperty()
  @Column({ name: 'started_at', nullable: true, type: 'timestamptz' })
  startedAt?: Date;

  @ApiProperty()
  @Column({ name: 'finished_at', nullable: true, type: 'timestamptz' })
  finishedAt?: Date;
}

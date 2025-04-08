import { PrimaryGeneratedColumn, Column, Entity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'logs' })
export class Log {
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    generatedIdentity: 'BY DEFAULT',
  })
  id!: number;

  @Column({ name: 'entity_type', nullable: true })
  entityType?: string;

  @Column({ name: 'entity_id', nullable: true })
  entityId?: string;

  @Column({ name: 'message', type: 'text' })
  message!: string;

  @Column({ name: 'execution_context_host', type: 'text', nullable: true })
  executionContextHost?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

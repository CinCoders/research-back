import { ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Professor } from './professor.entity';

@ApiTags('Patent')
@Entity({ name: 'patent' })
export class Patent {
  @ApiProperty({ name: 'id', type: Number })
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    generatedIdentity: 'BY DEFAULT',
  })
  id!: number;

  @ApiProperty({ name: 'professor', type: Number })
  @ManyToOne(() => Professor, (professor) => professor.patent)
  @JoinColumn({ name: 'professor_id' })
  professor!: Professor;

  @ApiProperty({ name: 'title', type: String })
  @Column({ name: 'title' })
  title!: string; //DADOS-BASICOS-DA-PATENTE TITULO

  @ApiProperty({ name: 'developmentYear', type: Number })
  @Column({ name: 'developmentYear' })
  developmentYear!: string; //DADOS-BASICOS-DA-PATENTE ANO-DESENVOLVIMENTO

  @ApiProperty({ name: 'country', type: Number })
  @Column({ name: 'country' })
  country!: string; //DADOS-BASICOS-DA-PATENTE PAIS

  @ApiProperty({ name: 'situationStatus', type: String })
  @Column({ name: 'situationStatus' })
  situationStatus!: string; //DETALHAMENTO-DA-PATENTE  HISTORICO-SITUACOES-PATENTE  DESCRICAO-SITUACAO-PATENTE

  @ApiProperty({ name: 'category', type: String })
  @Column({ name: 'category' })
  category!: string; //DETALHAMENTO-DA-PATENTE  CATEGORIA

  @ApiProperty({ name: 'patentType', type: String })
  @Column({ name: 'patentType', nullable: true })
  patentType?: string; //DETALHAMENTO-DA-PATENTE  REGISTRO-OU-PATENTE  TIPO-PATENTE

  @ApiProperty({ name: 'registryCode', type: String })
  @Column({ name: 'registryCode', nullable: true })
  registryCode?: string; //DETALHAMENTO-DA-PATENTE  REGISTRO-OU-PATENTE  CODIGO-DO-REGISTRO-OU-PATENTE

  @ApiProperty({ name: 'depositRegistrationInstitution', type: String })
  @Column({ name: 'depositRegistrationInstitution', nullable: true })
  depositRegistrationInstitution?: string; //DETALHAMENTO-DA-PATENTE  REGISTRO-OU-PATENTE  INSTITUICAO-DEPOSITO-REGISTRO

  @ApiProperty({ name: 'depositantName', type: String })
  @Column({ name: 'depositantName', nullable: true })
  depositantName?: string; //DETALHAMENTO-DA-PATENTE  REGISTRO-OU-PATENTE  NOME-DO-DEPOSITANTE

  @ApiProperty({ name: 'authors', type: String })
  @Column({ name: 'authors', length: 1500, nullable: true })
  authors?: string;
}

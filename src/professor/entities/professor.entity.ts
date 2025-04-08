import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Advisee } from './advisee.entity';
import { JournalPublication } from './journal-publication.entity';
import { ConferencePublication } from './conference-publication.entity';
import { Project } from './projects.entity';
import { Book } from './book.entity';
import { Patent } from './patent.entity';
import { ArtisticProduction } from './artisticProduction.entity';
import { Scholarship } from '../../scholarship/entities/scholarship.entity';

@ApiTags('Professor')
@Entity({ name: 'professor' })
export class Professor {
  @ApiProperty({ name: 'id', type: Number })
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    generatedIdentity: 'BY DEFAULT',
  })
  id!: number;

  @ApiProperty({ name: 'identifier', type: String })
  @Column({ name: 'identifier', length: 32, unique: true, nullable: true })
  identifier?: string;

  @ApiProperty({ name: 'name', type: String })
  @Column({ name: 'name', length: 100 })
  name!: string;

  @OneToMany(() => JournalPublication, (journalPublication) => journalPublication.professor, { cascade: true })
  journalPublication!: JournalPublication[];

  @OneToMany(() => ConferencePublication, (conference) => conference.professor, {
    cascade: true,
  })
  conferencePublications!: ConferencePublication[];

  @OneToMany(() => Advisee, (advisee) => advisee.professor, { cascade: true })
  advisees!: Advisee[];

  @OneToMany(() => Project, (project) => project.professor, {
    cascade: true,
  })
  projects!: Project[];

  @OneToMany(() => Book, (book) => book.professor, { cascade: true })
  book!: Book[];

  @OneToMany(() => Patent, (patent) => patent.professor, { cascade: true })
  patent!: Patent[];

  @OneToMany(() => ArtisticProduction, (artisticProduction) => artisticProduction.professor, { cascade: true })
  artisticProduction!: ArtisticProduction[];

  @ApiProperty({ name: 'scholarship', type: Scholarship, nullable: true })
  @ManyToOne(() => Scholarship, (scholarship) => scholarship.professor, {
    nullable: true,
  })
  @JoinColumn({ name: 'scholarship_id' })
  scholarship?: Scholarship;
}

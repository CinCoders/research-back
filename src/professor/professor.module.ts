import { Module } from '@nestjs/common';
import { ProfessorService } from './professor.service';
import { ProfessorController } from './professor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professor } from './entities/professor.entity';
import { JournalPublication } from './entities/journal-publication.entity';
import { ConferencePublication } from './entities/conference-publication.entity';
import { Advisee } from './entities/advisee.entity';
import { Financier } from './entities/financier.entity';
import { Project } from './entities/projects.entity';
import { JournalPublicationService } from './services/article/journal-publication.service';
import { ConferencePublicationService } from './services/conference/conference.service';
import { AdviseeService } from './services/advisee/advisee.service';
import { FinancierService } from './services/financier/financier.service';
import { ProjectService } from './services/project/project.service';
import { StringSimilarityService } from 'src/utils/string-similarity.service';
import { PublicationsModule } from 'src/publications/publications.module';
import { BookService } from './services/book/book.service';
import { PatentService } from './services/patent/patent.service';
import { ArtisticProductionService } from './services/artistic-production/artistic-production.service';
import { TranslationService } from './services/translation/translation/translation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Professor, JournalPublication, ConferencePublication, Advisee, Financier, Project]),
    PublicationsModule,
  ],
  controllers: [ProfessorController],
  providers: [
    ProfessorService,
    JournalPublicationService,
    ConferencePublicationService,
    AdviseeService,
    FinancierService,
    ProjectService,
    StringSimilarityService,
    BookService,
    TranslationService,
    PatentService,
    ArtisticProductionService,
  ],
  exports: [
    ProfessorService,
    JournalPublicationService,
    ConferencePublicationService,
    AdviseeService,
    FinancierService,
    ProjectService,
    BookService,
    TranslationService,
    PatentService,
    ArtisticProductionService,
  ],
})
export class ProfessorModule {}

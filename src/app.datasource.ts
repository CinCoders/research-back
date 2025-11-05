import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { ImportXml } from './import-xml/entities/import-xml.entity';
import { ImportJson } from './import-json/entities/import-json.entity';
import { Advisee } from './professor/entities/advisee.entity';
import { ConferencePublication } from './professor/entities/conference-publication.entity';
import { Financier } from './professor/entities/financier.entity';
import { JournalPublication } from './professor/entities/journal-publication.entity';
import { Professor } from './professor/entities/professor.entity';
import { ProjectFinancier } from './professor/entities/projectFinancier.entity';
import { Project } from './professor/entities/projects.entity';
import { Conference } from './qualis/entities/conference.entity';
import { Journal } from './qualis/entities/journal.entity';
import { Log } from './utils/exception-filters/log.entity';
import { CreateDatabase1641912530758 } from './database/migrations/1641912530758-CreateDatabase';
import { journals1641912603129 } from './database/migrations/1641912603129-SeedJournals';
import { conference_qualis1642432361349 } from './database/migrations/1642432361349-SeedConferenceQualis';
import { SeedFinanciers1645191297914 } from './database/migrations/1645191297914-SeedFinanciers';
import { AlterTableJournalConference1661801391940 } from './database/migrations/1661801391940-AlterTableJournalConference';
import { adviseeUpdate11662986604383 } from './database/migrations/1662986604383-adviseeUpdate1';
import { AlterJournalPublication1663700407696 } from './database/migrations/1663700407696-AlterJournalPublication';
import { importXmlRefactoring1683838256398 } from './database/migrations/1683838256398-importXmlRefactoring';
import { Book } from './professor/entities/book.entity';
import { Patent } from './professor/entities/patent.entity';
import { ArtisticProduction } from './professor/entities/artisticProduction.entity';
import { CreateBookAndPatentAndArtisticProduction1702905182255 } from './database/migrations/1702905182255-createBookAndPatentAndArtisticProduction';
import { Scholarship } from './scholarship/entities/scholarship.entity';
import { CreateScholarship1703094449669 } from './database/migrations/1703094449669-createScholarship';
import { alterTableImportXml1705606892154 } from './database/migrations/1705606892154-alterTableImportXml';
import { Translation } from './professor/entities/translation.entity';
import { CreateTranslationAlterConferencePublication1706292498583 } from './database/migrations/1706292498583-createTranslationAlterConferencePublication';
import { AlterConferencePubAndJournalPubAndBook1706298287607 } from './database/migrations/1706298287607-alterConferencePubAndJournalPubAndBook';
import { ImportJson1752008569765 } from './database/migrations/1752008569765-ImportJson';


config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('TYPEORM_HOST'),
  port: configService.get('TYPEORM_PORT'),
  username: configService.get('TYPEORM_USERNAME'),
  password: configService.get('TYPEORM_PASSWORD'),
  database: configService.get('TYPEORM_DATABASE'),
  synchronize: false,
  logging: false,
  entities: [
    ImportXml,
    ImportJson,
    Advisee,
    ConferencePublication,
    Financier,
    JournalPublication,
    Professor,
    ProjectFinancier,
    Project,
    Conference,
    Journal,
    Log,
    Book,
    Translation,
    Patent,
    ArtisticProduction,
    Scholarship,
  ],
  migrations: [
    CreateDatabase1641912530758,
    journals1641912603129,
    conference_qualis1642432361349,
    SeedFinanciers1645191297914,
    AlterTableJournalConference1661801391940,
    adviseeUpdate11662986604383,
    AlterJournalPublication1663700407696,
    importXmlRefactoring1683838256398,
    CreateBookAndPatentAndArtisticProduction1702905182255,
    CreateScholarship1703094449669,
    alterTableImportXml1705606892154,
    CreateTranslationAlterConferencePublication1706292498583,
    AlterConferencePubAndJournalPubAndBook1706298287607,
    ImportJson1752008569765,
  ],
});

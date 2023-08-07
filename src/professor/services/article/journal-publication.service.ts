import { Injectable } from '@nestjs/common';
import { Journal } from 'src/qualis/entities/journal.entity';
import { EntityType } from 'src/utils/exception-filters/entity-type-enum';
import logErrorToDatabase from 'src/utils/exception-filters/log-error';
import { QueryRunner } from 'typeorm';
import { JournalPublicationDto } from '../../dto/journal-publication.dto';
import { JournalPublication } from '../../entities/journal-publication.entity';
import { JournalPublicationEnum } from './journal-publication.enum';
import { AppDataSource } from 'src/app.datasource';

@Injectable()
export class JournalPublicationService {
  async findOne(
    journalPublicationDto: JournalPublicationDto,
    queryRunner: QueryRunner | undefined,
  ) {
    try {
      return await AppDataSource.createQueryBuilder(queryRunner)
        .select('a')
        .from(JournalPublication, 'a')
        .where('a.title=:title', { title: journalPublicationDto.title })
        .andWhere('a.professor_id=:professorId', {
          professorId: journalPublicationDto.professor.id,
        })
        .getOne();
    } catch (error) {
      throw error;
    }
  }

  async getQualisAndJournal(
    journalPublication: JournalPublication,
    journals: Journal[],
    queryRunner: QueryRunner,
  ) {
    try {
      for (let i = 0; i < journals.length; i++) {
        const journal = journals[i];
        if (journal.issn === journalPublication.issn) {
          journalPublication.journal = journal;
          journalPublication.qualis = journal.qualis;
          if (journal.isTop) {
            journalPublication.isTop = true;
          }
          await AppDataSource.createQueryBuilder(queryRunner)
            .insert()
            .into(JournalPublication)
            .values(journalPublication)
            .orUpdate(['qualis', 'journal_id'], ['id'])
            .execute();
          return;
        }
      }
    } catch (error) {
      await logErrorToDatabase(
        error,
        EntityType.JOURNAL_PUBLICATION,
        undefined,
      );
      throw error;
    }
  }

  async createJournalPublication(
    journalPublicationDto: JournalPublicationDto,
    queryRunner: QueryRunner,
  ) {
    if (
      !journalPublicationDto.year ||
      !+journalPublicationDto.year ||
      journalPublicationDto.year === JournalPublicationEnum.RINT
    )
      throw new Error(
        JournalPublicationEnum.JOURNAL_PUBLICATION_NAN_YEAR_ERROR,
      );

    try {
      const journalPublication = new JournalPublication();
      journalPublication.professor = journalPublicationDto.professor;
      journalPublication.title = journalPublicationDto.title;
      journalPublication.doi = journalPublicationDto.doi;
      journalPublication.year = +journalPublicationDto.year;
      journalPublication.issn = journalPublicationDto.issn;
      journalPublication.journalTitle = journalPublicationDto.journalTitle;
      journalPublication.authors = journalPublicationDto.authors;

      await AppDataSource.createQueryBuilder(queryRunner)
        .insert()
        .into(JournalPublication)
        .values(journalPublication)
        .execute();

      return journalPublication;
    } catch (error) {
      await logErrorToDatabase(
        error,
        EntityType.JOURNAL_PUBLICATION,
        undefined,
      );
      throw error;
    }
  }
}

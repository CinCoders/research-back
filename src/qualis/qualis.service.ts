import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { Journal } from './entities/journal.entity';
import { Log } from 'src/utils/exception-filters/log.entity';
import { EntityType } from 'src/utils/exception-filters/entity-type-enum';
import { AppDataSource } from 'src/app.datasource';
import createLog from 'src/utils/exception-filters/log-utils';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class JournalService {
  async create(createJournalDto: CreateJournalDto, email: string) {
    const journal = new Journal();
    journal.name = createJournalDto.name;
    journal.issn = createJournalDto.issn;
    journal.qualis = createJournalDto.qualis;
    journal.isTop = createJournalDto.isTop;
    journal.official = createJournalDto.official;

    const journalLog = new Log();

    journalLog.executionContextHost = '';
    journalLog.entityType = EntityType.JOURNAL_PUBLICATION;
    journalLog.message = `
      Type: Creation
      Email: ${email}
      Name: ${journal.name}
      Issn: ${journal.issn}
    `;

    if (createJournalDto.derivedFromId) {
      const derivedFrom = await this.findOne(createJournalDto.derivedFromId);
      if (derivedFrom) {
        journal.derivedFrom = derivedFrom;
        journalLog.message += `derivedFromId: ${derivedFrom.id}`;
      }
    }

    await AppDataSource.manager.save(journalLog);

    return await AppDataSource.createQueryBuilder()
      .insert()
      .into(Journal)
      .values(journal)
      .execute();
  }

  async findAll(queryRunner: QueryRunner | undefined) {
    return await AppDataSource.createQueryBuilder(queryRunner)
      .select('j')
      .from(Journal, 'j')
      .leftJoinAndSelect('j.derivedFrom', 'df')
      .orderBy('j."is_top"', 'DESC')
      .addOrderBy('j.qualis', 'ASC')
      .addOrderBy('j.name', 'ASC')
      .getMany();
  }

  async findOne(id: number) {
    const journal = await AppDataSource.createQueryBuilder()
      .select('j')
      .from(Journal, 'j')
      .where('j.id=:journalId', { journalId: id })
      .getOne();

    return journal;
  }

  async update(id: number, updateJournalDto: UpdateJournalDto, email: string) {
    const journal = await AppDataSource.manager.findOne(Journal, {
      where: { id: id },
    });

    if (journal) {
      Object.assign(journal, updateJournalDto);
      await AppDataSource.manager.save(journal);
      createLog(
        EntityType.JOURNAL_PUBLICATION,
        `Type: Update
      Email: ${email}
      Update: ${journal} -> ${updateJournalDto}`,
        `${id}`,
      );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} journal`;
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    name: 'refresh_journals',
    timeZone: 'America/Recife',
  })
  async refresh() {
    console.log('Refreshing journals');
  }
}

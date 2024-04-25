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
import Papa from 'papaparse';
import axios from 'axios';
import { RefreshJournalDto } from './dto/refresh-journal.dto';

@Injectable()
export class JournalService {
  async create(
    queryRunner: QueryRunner | undefined,
    createJournalDto: CreateJournalDto,
    email: string,
  ) {
    const manager = !queryRunner ? AppDataSource.manager : queryRunner.manager;
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
      const derivedFrom = await manager.findOne(Journal, {
        where: { id: createJournalDto.derivedFromId },
      });
      if (derivedFrom) {
        journal.derivedFrom = derivedFrom;
        journalLog.message += `derivedFromId: ${derivedFrom.id}`;
      }
    }

    await manager.save(journalLog);

    return await AppDataSource.createQueryBuilder(queryRunner)
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

  async update(
    queryRunner: QueryRunner | undefined,
    id: number,
    updateJournalDto: UpdateJournalDto,
    email: string,
  ) {
    const manager = !queryRunner ? AppDataSource.manager : queryRunner.manager;
    const journal = await manager.findOne(Journal, {
      where: { id: id },
    });

    if (journal) {
      Object.assign(journal, updateJournalDto);
      await manager.save(journal);
      createLog(
        queryRunner,
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

  // 1st day of the month if there is no env variable:
  @Cron(
    process.env.CRON_PATTERN ||
      CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT,
    {
      name: 'refresh_journals',
      timeZone: 'America/Recife',
    },
  )
  async refresh(email: string) {
    if (!email) {
      email = 'cron_job@cin.ufpe.br';
    }
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const refreshJournalDtos = await this.getSheetData();
      console.log(refreshJournalDtos);

      for (const refreshJournalDto of refreshJournalDtos) {
        const journal = await queryRunner.manager.findOne(Journal, {
          where: { issn: refreshJournalDto.issn },
        });

        if (!journal) {
          const createJournalDto: CreateJournalDto = {
            ...refreshJournalDto,
            isTop: false,
            official: true,
          };
          const derivedFrom = await queryRunner.manager.findOne(Journal, {
            where: { name: refreshJournalDto.name },
          });
          if (derivedFrom) {
            createJournalDto.derivedFromId = derivedFrom.id;
          }
          await this.create(queryRunner, createJournalDto, email);
        } else if (
          refreshJournalDto.name !== journal.name ||
          refreshJournalDto.qualis !== journal.qualis
        ) {
          const updateJournalDto: UpdateJournalDto = {
            ...refreshJournalDto,
            id: journal.id,
          };
          await this.update(queryRunner, journal.id, updateJournalDto, email);
        }
      }
      await queryRunner.commitTransaction();
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.log(error.message);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getSheetData(): Promise<RefreshJournalDto[]> {
    const csvUrl =
      'https://docs.google.com/spreadsheets/d/' +
      process.env.JOURNALS_SHEET_ID +
      '/gviz/tq?tqx=out:csv&sheet=Qualis';

    const response = await axios.get(csvUrl);
    const data = Papa.parse(response.data, {
      header: true,
    }).data;
    return data.map((journal: any) => ({
      issn: journal['issn'].replace('-', ''),
      name: journal['periodico'],
      qualis: journal['Qualis_Final'],
    }));
  }
}

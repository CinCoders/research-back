import { Injectable } from '@nestjs/common';
import { EntityManager, QueryRunner } from 'typeorm';
import { CreateConferenceDto } from '../dto/create-conference.dto';
import { UpdateConferenceDto } from '../dto/update-conference.dto';
import { Conference } from '../entities/conference.entity';
import { Log } from 'src/utils/exception-filters/log.entity';
import { EntityType } from 'src/utils/exception-filters/entity-type-enum';
import { AppDataSource } from 'src/app.datasource';
import createLog from 'src/utils/exception-filters/log-utils';
import { RefreshConferenceDto } from '../dto/refresh-conference.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import Papa from 'papaparse';
import axios from 'axios';

@Injectable()
export class ConferenceService {
  async findOne(id: number) {
    const conference = await AppDataSource.createQueryBuilder()
      .select('c')
      .from(Conference, 'c')
      .where('c.id=:conferenceId', { conferenceId: id })
      .getOne();

    return conference;
  }

  async create(
    queryRunner: QueryRunner | undefined,
    createConferenceDto: CreateConferenceDto,
    email: string,
  ) {
    let manager: EntityManager;
    if (!queryRunner) {
      manager = AppDataSource.manager;
    } else {
      manager = queryRunner.manager;
    }

    const conference = new Conference();
    conference.acronym = createConferenceDto.acronym;
    conference.name = createConferenceDto.name;
    conference.qualis = createConferenceDto.qualis;
    conference.isTop = createConferenceDto.isTop;
    conference.official = createConferenceDto.official;

    const conferenceLog = new Log();

    if (createConferenceDto.derivedFromId) {
      const derivedFrom = await manager.findOne(Conference, {
        where: { id: createConferenceDto.derivedFromId },
      });
      if (derivedFrom) conference.derivedFrom = derivedFrom;
    }

    conferenceLog.entityType = EntityType.CONFERENCE;
    conferenceLog.executionContextHost = '';
    conferenceLog.message = `
    Type: Creation
    Email: ${email}
    Name: ${conference.name}
    Acronym: ${conference.acronym}
    DerivedFrom: ${conference.derivedFrom?.id}
    `;

    await manager.save(conferenceLog);

    return await AppDataSource.createQueryBuilder(queryRunner)
      .insert()
      .into(Conference)
      .values(conference)
      .execute();
  }

  async findAll(queryRunner: QueryRunner | undefined) {
    return await AppDataSource.createQueryBuilder(queryRunner)
      .select('top')
      .from(Conference, 'top')
      .leftJoinAndSelect('top.derivedFrom', 'df')
      .orderBy('top."is_top"', 'DESC')
      .addOrderBy('top.qualis', 'ASC')
      .addOrderBy('top.name', 'ASC')
      .getMany();
  }

  async update(
    queryRunner: QueryRunner | undefined,
    id: number,
    updateConferenceDto: UpdateConferenceDto,
    email: string,
  ) {
    let manager: EntityManager;
    if (!queryRunner) {
      manager = AppDataSource.manager;
    } else {
      manager = queryRunner.manager;
    }
    const conference = await manager.findOne(Conference, {
      where: { id: id },
    });

    if (conference) {
      Object.assign(conference, updateConferenceDto);
      await manager.save(conference);
      createLog(
        queryRunner,
        EntityType.CONFERENCE,
        `
      Type: Update
      Email: ${email}
      Update: ${conference} -> ${updateConferenceDto}
    `,
        `${id}`,
      );
    }
  }

  // @Cron(new Date(Date.now() + 1000 * 3), {
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    name: 'refresh_conferences',
    timeZone: 'America/Recife',
  })
  async refresh(email: string) {
    if (!email) {
      email = 'cron_job@cin.ufpe.br';
    }
    const csvUrl =
      'https://docs.google.com/spreadsheets/d/' +
      process.env.CONFERENCES_SHEET_ID +
      '/gviz/tq?tqx=out:csv&sheet=Qualis';

    const headers = new Map<string, string>([
      ['sigla', 'acronym'],
      ['Qualis_Final', 'qualis'],
      ['evento', 'name'],
    ]);
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const response = await axios.get(csvUrl);
      const refreshConferenceDtos: RefreshConferenceDto[] = Papa.parse(
        response.data,
        {
          header: true,
          transformHeader: (header) => headers.get(header) || header,
        },
      ).data as RefreshConferenceDto[];
      console.log(refreshConferenceDtos);

      for (const refreshConferenceDto of refreshConferenceDtos) {
        const conference = await queryRunner.manager.findOne(Conference, {
          where: {
            acronym: refreshConferenceDto.acronym,
          },
        });
        if (!conference) {
          console.log(
            `Creating conference ${refreshConferenceDto.acronym}-${refreshConferenceDto.name}`,
          );
          await this.create(
            queryRunner,
            {
              ...refreshConferenceDto,
              isTop: false,
              official: true,
            },
            email,
          );
        } else if (
          refreshConferenceDto.name !== conference.name ||
          refreshConferenceDto.qualis !== conference.qualis
        ) {
          console.log(
            `Updating conference ${conference.acronym}-${conference.name}-${conference.qualis} to ${refreshConferenceDto.acronym}-${refreshConferenceDto.name}-${refreshConferenceDto.qualis}`,
          );
          await this.update(
            queryRunner,
            conference.id,
            { ...refreshConferenceDto, id: conference.id },
            email,
          );
        }
      }
      await queryRunner.commitTransaction();
      return { msg: 'Conferences refreshed successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

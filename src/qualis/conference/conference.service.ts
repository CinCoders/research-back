import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { CreateConferenceDto } from '../dto/create-conference.dto';
import { UpdateConferenceDto } from '../dto/update-conference.dto';
import { Conference } from '../entities/conference.entity';
import { Log } from 'src/utils/exception-filters/log.entity';
import { EntityType } from 'src/utils/exception-filters/entity-type-enum';
import { AppDataSource } from 'src/app.datasource';
import createLog from 'src/utils/exception-filters/log-utils';

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

  async create(createConferenceDto: CreateConferenceDto, email: string) {
    const conference = new Conference();
    conference.acronym = createConferenceDto.acronym;
    conference.name = createConferenceDto.name;
    conference.qualis = createConferenceDto.qualis;
    conference.isTop = createConferenceDto.isTop;
    conference.official = createConferenceDto.official;

    const conferenceLog = new Log();

    if (createConferenceDto.derivedFromId) {
      const derivedFrom = await this.findOne(createConferenceDto.derivedFromId);
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

    await AppDataSource.manager.save(conferenceLog);

    return await AppDataSource.createQueryBuilder().insert().into(Conference).values(conference).execute();
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

  async update(id: number, updateConferenceDto: UpdateConferenceDto, email: string) {
    const conference = await AppDataSource.manager.findOne(Conference, {
      where: { id: id },
    });

    if (conference) {
      Object.assign(conference, updateConferenceDto);
      await AppDataSource.manager.save(conference);
      createLog(
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
}

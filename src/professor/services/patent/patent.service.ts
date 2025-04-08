import { Injectable } from '@nestjs/common';
import { AppDataSource } from 'src/app.datasource';
import { PatentDto } from 'src/professor/dto/patent.dto';
import { Patent } from 'src/professor/entities/patent.entity';
import { EntityType } from 'src/utils/exception-filters/entity-type-enum';
import logErrorToDatabase from 'src/utils/exception-filters/log-error';
import { QueryRunner } from 'typeorm';

@Injectable()
export class PatentService {
  async findOne(patentDto: PatentDto, queryRunner: QueryRunner | undefined) {
    try {
      return await AppDataSource.createQueryBuilder(queryRunner)
        .select('p')
        .from(Patent, 'p')
        .where('p.title=:title', { title: patentDto.title })
        .andWhere('p.professor_id=:professorId', {
          professorId: patentDto.professor.id,
        })
        .getOne();
    } catch (error) {
      throw error;
    }
  }

  async createPatent(patentDto: PatentDto, queryRunner: QueryRunner) {
    try {
      const patent = new Patent();
      patent.title = patentDto.title;
      patent.developmentYear = patentDto.developmentYear;
      patent.category = patentDto.category;
      patent.country = patentDto.country;
      patent.depositRegistrationInstitution = patentDto.depositRegistrationInstitution;
      patent.depositantName = patentDto.depositantName;
      patent.patentType = patentDto.patentType;
      patent.registryCode = patentDto.registryCode;
      patent.situationStatus = patentDto.situationStatus;
      patent.professor = patentDto.professor;
      patent.authors = patentDto.authors;

      await AppDataSource.createQueryBuilder(queryRunner).insert().into(Patent).values(patent).execute();

      return patent;
    } catch (error) {
      await logErrorToDatabase(error, EntityType.PATENT, undefined);
      throw error;
    }
  }
}

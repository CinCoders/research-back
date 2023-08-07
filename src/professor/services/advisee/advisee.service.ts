import { Injectable } from '@nestjs/common';
import { Financier } from 'src/professor/entities/financier.entity';
import { QueryRunner } from 'typeorm';
import { AdviseeDto } from '../../dto/advisee.dto';
import { Advisee } from '../../entities/advisee.entity';
import { AppDataSource } from 'src/app.datasource';

@Injectable()
export class AdviseeService {
  async getAdvisee(adviseeDto: AdviseeDto, queryRunner: QueryRunner) {
    return await AppDataSource.createQueryBuilder(queryRunner)
      .select('a')
      .from(Advisee, 'a')
      .where('a.name=:name', { name: adviseeDto.name })
      .andWhere('a.yearStart=:year', { year: adviseeDto.yearStart })
      .andWhere('a.type=:type', { type: adviseeDto.type })
      .andWhere('a.professor_id=:professorId', {
        professorId: adviseeDto.professor.id,
      })
      .getOne();
  }

  async createAdvisee(
    adviseeDto: AdviseeDto,
    degree: string,
    queryRunner: QueryRunner,
  ) {
    const advisee = new Advisee();
    let financier;
    advisee.professor = adviseeDto.professor;
    if (adviseeDto.yearStart) advisee.yearStart = +adviseeDto.yearStart;
    if (adviseeDto.yearEnd) advisee.yearEnd = +adviseeDto.yearEnd;
    if (adviseeDto.financierCode) {
      financier = await AppDataSource.createQueryBuilder(queryRunner)
        .select('f')
        .from(Financier, 'f')
        .where('f.code=:financierCode', {
          financierCode: adviseeDto.financierCode,
        })
        .getOne();
    }
    advisee.name = adviseeDto.name;
    advisee.type = adviseeDto.type;
    advisee.degree = degree;
    advisee.course = adviseeDto.course;
    advisee.financier = financier ?? undefined;
    advisee.institution = adviseeDto.institution;
    advisee.schoolarship = adviseeDto.scholarship;
    advisee.title = adviseeDto.title;

    await AppDataSource.createQueryBuilder(queryRunner)
      .insert()
      .into(Advisee)
      .values(advisee)
      .execute();

    return advisee;
  }
}

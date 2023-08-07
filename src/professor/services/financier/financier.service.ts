import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { FinancierDto } from '../../dto/financier.dto';
import { Financier } from '../../entities/financier.entity';
import { AppDataSource } from 'src/app.datasource';

@Injectable()
export class FinancierService {
  async getFinancier(financierDto: FinancierDto, queryRunner: QueryRunner) {
    return await AppDataSource.createQueryBuilder(queryRunner)
      .select('f')
      .from(Financier, 'f')
      .leftJoinAndSelect('f.projectFinancier', 'pf')
      .where('f.code=:code', { code: financierDto.code })
      .andWhere('f.name=:name', { name: financierDto.name })
      .getOne();
  }

  async createFinancier(financierDto: FinancierDto, queryRunner: QueryRunner) {
    const financier = new Financier();
    financier.name = financierDto.name;
    financier.code = financierDto.code;
    financier.projectFinancier = [];

    await AppDataSource.createQueryBuilder(queryRunner)
      .insert()
      .into(Financier)
      .values(financier)
      .execute();
    return financier;
  }
}

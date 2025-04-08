import { Injectable } from '@nestjs/common';
import { PatentsDto } from './dto/patents.dto';
import { AppDataSource } from 'src/app.datasource';

@Injectable()
export class PatentsService {
  async get(groupByProfessor: boolean, groupByYear: boolean): Promise<PatentsDto[]> {
    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();

    const result: PatentsDto[] = await queryRunner.query(`
    SELECT 
      ${groupByProfessor ? 'p.id as "professorId",' : ''}
      ${groupByProfessor ? 'p.name as "professorName",' : ''}
      ${groupByYear ? 'pat."developmentYear" as year,' : ''}
      COUNT(p.id) as total,
      SUM(CASE WHEN pat."patentType" = 'PRIVILEGIO_DE_INOVACAO_PI' THEN 1 ELSE 0 END) as "totalInventionPatents",
    SUM(CASE WHEN pat."patentType" = 'MODELO_DE_UTILIDADE_MU' THEN 1 ELSE 0 END) as "totalUtilityModelPatents",
    SUM(CASE WHEN pat."situationStatus" = 'Depósito' THEN 1 ELSE 0 END) as "totalDepositPatents",
    SUM(CASE WHEN pat."situationStatus" = 'Concessão' THEN 1 ELSE 0 END) as "totalGrantPatents",
    SUM(CASE WHEN pat."situationStatus" = 'Licenciamento' THEN 1 ELSE 0 END) as "totalLicensePatents",
    SUM(CASE WHEN pat."country" = 'Brasil' THEN 1 ELSE 0 END) as "brazilianPatents",
    SUM(CASE WHEN pat."country" != 'Brasil' THEN 1 ELSE 0 END) as "internationalPatents"
   FROM professor p
    LEFT JOIN patent pat ON p.id = pat.professor_id
    WHERE pat."developmentYear" IS NOT NULL
    ${
      groupByProfessor && groupByYear
        ? 'GROUP BY p.id, p.name, pat."developmentYear" ORDER BY p.name ASC, pat."developmentYear" DESC;'
        : ''
    }
    ${groupByProfessor && !groupByYear ? 'GROUP BY p.id, p.name ORDER BY p.name ASC;' : ''}
    ${!groupByProfessor && groupByYear ? 'GROUP BY pat."developmentYear" ORDER BY pat."developmentYear" DESC;' : ''}
  `);

    await queryRunner.release();

    return result;
  }
}

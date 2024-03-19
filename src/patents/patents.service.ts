import { Injectable } from '@nestjs/common';
import { PatentsDto } from './dto/patents.dto';
import { AppDataSource } from 'src/app.datasource';

@Injectable()
export class PatentsService {
  async get(
    groupByProfessor: boolean,
    groupByYear: boolean,
  ): Promise<PatentsDto[]> {
    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();

    const result: PatentsDto[] = await queryRunner.query(`
    SELECT 
      ${groupByProfessor ? 'p.id as "professorId",' : ''}
      ${groupByProfessor ? 'p.name as "professorName",' : ''}
      ${groupByYear ? 'pat."developmentYear" as year,' : ''}
      COUNT(p.id) as total,
      pat.id as "id",
      pat.title as "title",
      pat.country as "country",
      pat.category as "category",
      pat."patentType" as "patentType",
      pat."registryCode" as "registryCode",
      pat.authors as "authors"
    FROM professor p
    LEFT JOIN patent pat ON p.id = pat.professor_id
    WHERE pat."developmentYear" IS NOT NULL
    ${
      groupByProfessor && groupByYear
        ? 'GROUP BY p.id, p.name, pat."developmentYear", pat.id ORDER BY p.name ASC, pat."developmentYear" DESC;'
        : ''
    }
    ${
      groupByProfessor && !groupByYear
        ? 'GROUP BY p.id, p.name, pat.id ORDER BY p.name ASC;'
        : ''
    }
    ${
      !groupByProfessor && groupByYear
        ? 'GROUP BY pat."developmentYear", pat.id ORDER BY pat."developmentYear" DESC;'
        : ''
    }
  `);

    console.log(result);
    await queryRunner.release();

    return result;
  }
}

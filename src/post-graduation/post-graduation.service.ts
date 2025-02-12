import { Injectable } from '@nestjs/common';
import { AppDataSource } from 'src/app.datasource';

@Injectable()
export class PostGraduationService {
  async get(
    groupByProfessor: boolean,
    groupByYear: boolean,
    filter: 'current' | 'concluded',
    startYear: number,
    endYear: number,
  ) {
    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();

    const result = await queryRunner.query(`
    SELECT
      ${groupByProfessor ? 'p.id as "professorId",' : ''}
      ${groupByProfessor ? 'p.name as "professorName",' : ''}
      ${groupByYear && filter === 'concluded' ? 'a.year_end as year,' : ''}
      ${groupByYear && filter === 'current' ? 'a.year_start as year,' : ''}
      COUNT(*) as total,
      SUM(CASE WHEN a.degree='POS_DOUTORADO' THEN 1 ELSE 0 END) as "postdocAdvisor",
      SUM(CASE WHEN a.type='ORIENTADOR_PRINCIPAL' AND a.degree='DOUTORADO' THEN 1 ELSE 0 END) as "phdMainAdvisor",
      SUM(CASE WHEN a.type='CO_ORIENTADOR' AND a.degree='DOUTORADO' THEN 1 ELSE 0 END) as "phdCoAdvisor",
      SUM(CASE WHEN a.type='ORIENTADOR_PRINCIPAL' AND a.degree='MESTRADO' THEN 1 ELSE 0 END) as "mastersMainAdvisor",
      SUM(CASE WHEN a.type='CO_ORIENTADOR' AND a.degree='MESTRADO' THEN 1 ELSE 0 END) as "mastersCoAdvisor",
      SUM(CASE WHEN a.degree='INICIACAO_CIENTIFICA' THEN 1 ELSE 0 END) as "undergradResearchAdvisor"
    FROM professor p
    LEFT JOIN advisee a ON a.professor_id=p.id
    ${
      filter === 'concluded'
        ? ` WHERE a.year_start IS NULL AND a.year_end IS NOT NULL AND a.year_end >= ${startYear} AND a.year_end <= ${endYear}`
        : ''
    }
    ${
      filter === 'current'
        ? ` WHERE a.year_end IS NULL AND a.year_start IS NOT NULL AND a.year_start >= ${startYear} AND a.year_start <= ${endYear}`
        : ''
    }
    
    ${
      groupByProfessor && groupByYear
        ? 'GROUP BY p.id, year ORDER BY p.name ASC, year DESC;'
        : ''
    }
    ${
      groupByProfessor && !groupByYear
        ? 'GROUP BY p.id ORDER BY p.name ASC;'
        : ''
    }
    ${
      !groupByProfessor && groupByYear
        ? 'GROUP BY year ORDER BY year DESC;'
        : ''
    }`);

    await queryRunner.release();

    return result;
  }
}

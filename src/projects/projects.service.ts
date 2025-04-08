import { Injectable } from '@nestjs/common';
import { ProjectsDto } from './dto/projects.dto';
import { AppDataSource } from 'src/app.datasource';

@Injectable()
export class ProjectsService {
  async get(
    groupByProfessor: boolean,
    groupByYear: boolean,
    startYear: number,
    endYear: number,
  ): Promise<ProjectsDto[]> {
    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();

    const result: ProjectsDto[] = await queryRunner.query(`
    SELECT 
      ${groupByProfessor ? 'p.id as "professorId",' : ''}
      ${groupByProfessor ? 'p.name as "professorName",' : ''}
      ${groupByYear ? 'pr.year as year,' : ''}
      COUNT(p.id) as total,
      COUNT(p.id) - SUM(CASE WHEN pr.period_flag='ANTERIOR' THEN 1 ELSE 0 END) as "projectsInProgress",
      SUM(CASE WHEN pr.period_flag='ANTERIOR' THEN 1 ELSE 0 END) AS "concludedProjects",
      SUM(CASE WHEN f.code='002200000000' THEN 1 ELSE 0 END) AS "cnpqProjects",
      SUM(CASE WHEN f.code='876400000009' THEN 1 ELSE 0 END) AS "facepeProjects",
      SUM(CASE WHEN f.code='045000000000' THEN 1 ELSE 0 END) AS "capesProjects",
      SUM(CASE WHEN f.code NOT IN ('002200000000', '876400000009', '045000000000') THEN 1 ELSE 0 END) AS "anotherFinancier",
      SUM(CASE WHEN f.code='' OR f.code IS NULL THEN 1 ELSE 0 END) AS "noFinancier"
    FROM professor p
    LEFT JOIN project pr ON p.id=pr.professor_id
    LEFT JOIN project_financier pf ON pf.project_id=pr.id
    LEFT JOIN financier f ON pf.financier_id=f.id
    WHERE pr.year IS NOT NULL
    AND pr.year >= ${startYear}
    AND pr.year <= ${endYear}
    ${groupByProfessor && groupByYear ? 'GROUP BY p.id, pr.year ORDER BY p.name ASC, pr.year DESC;' : ''}
    ${groupByProfessor && !groupByYear ? 'GROUP BY p.id ORDER BY p.name ASC;' : ''}
    ${!groupByProfessor && groupByYear ? 'GROUP BY pr.year ORDER BY pr.year DESC;' : ''}
  `);

    await queryRunner.release();

    return result;
  }
}

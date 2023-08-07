import { Injectable } from '@nestjs/common';
import { PublicationsDto } from './dto/publications.dto';
import { AppDataSource } from 'src/app.datasource';

@Injectable()
export class PublicationsService {
  createQuery(
    journalPublications: boolean,
    conferencePublications: boolean,
    groupByProfessor: boolean,
    groupByYear: boolean,
  ) {
    const selectPublications = `
    SELECT
      ${groupByProfessor ? '"professorId", ' : ''}
      ${groupByProfessor ? '"professorName", ' : ''}
      ${groupByYear ? 'year, ' : ''}
	    sum(total) total, 
      sum(top) top, 
      ${
        groupByProfessor && !groupByYear
          ? 'sum("top5Years") AS "top5Years", '
          : ''
      }
      sum(a1) a1, 
      sum(a2) a2, 
      sum(a3) a3, 
      sum(a4) a4,
      sum(b1) b1, 
      sum(b2) b2, 
      sum(b3) b3, 
      sum(b4) b4, 
      sum(b5) b5, 
      sum(c) c, 
      sum("noQualis") "noQualis"
    `;

    const subQuery = `SELECT 
      ${groupByProfessor ? 'p.id as "professorId", ' : ''}
      ${groupByProfessor ? 'p.name AS "professorName", ' : ''}
      ${groupByYear ? 'year, ' : ''}
      count(*) as total,
      sum(case pp."is_top" when true then 1 else 0 end) top,
      ${
        groupByProfessor && !groupByYear
          ? `SUM(CASE WHEN pp.is_top AND pp.year > (DATE_PART('year', CURRENT_DATE) - 5) THEN 1 ELSE 0 END) AS "top5Years",`
          : ''
      }
      sum(case when pp.qualis='A1' then 1 else 0 end) a1,
      sum(case when pp.qualis='A2' then 1 else 0 end) a2,
      sum(case when pp.qualis='A3' then 1 else 0 end) a3,
      sum(case when pp.qualis='A4' then 1 else 0 end) a4,
      sum(case when pp.qualis='B1' then 1 else 0 end) b1,
      sum(case when pp.qualis='B2' then 1 else 0 end) b2,
      sum(case when pp.qualis='B3' then 1 else 0 end) b3,
      sum(case when pp.qualis='B4' then 1 else 0 end) b4,
      sum(case when pp.qualis='B5' then 1 else 0 end) b5,
      sum(case when pp.qualis='C' then 1 else 0 end) c,
      sum(case when pp.qualis is null then 1 else 0 end) "noQualis"
      FROM "professor" "p"
    `;

    const groupBy =
      (groupByProfessor && groupByYear ? ` GROUP BY p.name, p.id, year` : '') +
      (groupByProfessor && !groupByYear ? ` GROUP BY p.name, p.id` : '') +
      (!groupByProfessor && groupByYear ? ` GROUP BY year` : '');

    const joinJournalPublications =
      `JOIN "journal_publication" "pp" on "pp"."professor_id"=p.id` + groupBy;

    const joinConferencePublications =
      `JOIN "conference_publication" "pp" on "pp"."professor_id"=p.id` +
      groupBy;

    return (
      selectPublications +
      `FROM (
      ${journalPublications ? subQuery + joinJournalPublications : ''}
      ${journalPublications && conferencePublications ? ' UNION ' : ''}
      ${conferencePublications ? subQuery + joinConferencePublications : ''}
      ) qualis 
      ${
        groupByProfessor && groupByYear
          ? 'GROUP BY "professorName", "professorId", year ORDER BY "professorName" ASC, year DESC'
          : ''
      }
      ${
        groupByProfessor && !groupByYear
          ? 'GROUP BY "professorName", "professorId" ORDER BY "professorName" ASC'
          : ''
      }
      ${
        !groupByProfessor && groupByYear
          ? 'GROUP BY year ORDER BY year DESC'
          : ''
      }`
    );
  }

  async get(
    journalPublications: boolean,
    conferencePublications: boolean,
    groupByProfessor: boolean,
    groupByYear: boolean,
  ) {
    if (!journalPublications && !conferencePublications) return [];

    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();

    const result: PublicationsDto[] = await queryRunner.query(
      this.createQuery(
        journalPublications,
        conferencePublications,
        groupByProfessor,
        groupByYear,
      ),
    );

    await queryRunner.release();

    return result;
  }
}

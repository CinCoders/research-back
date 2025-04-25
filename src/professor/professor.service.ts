import { Injectable } from '@nestjs/common';
import { AppDataSource } from 'src/app.datasource';
import { Curriculum } from 'src/import-xml/curriculum.enum';
import { ProfessorPatentDto } from 'src/patents/dto/professor-patent.dto';
import { EntityType } from 'src/utils/exception-filters/entity-type-enum';
import logErrorToDatabase from 'src/utils/exception-filters/log-error';
import createLog from 'src/utils/exception-filters/log-utils';
import { QueryRunner } from 'typeorm';
import { AdviseeFormatDto } from './dto/advisee-format.dto';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { ProfessorProjectFinancierDto } from './dto/professor-project-financier.dto';
import { ProfessorPublicationsDto } from './dto/professor-publications.dto';
import { ProfessorTableDto } from './dto/professor-table.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';
import { Advisee } from './entities/advisee.entity';
import { ArtisticProduction } from './entities/artisticProduction.entity';
import { Book } from './entities/book.entity';
import { ConferencePublication } from './entities/conference-publication.entity';
import { JournalPublication } from './entities/journal-publication.entity';
import { Patent } from './entities/patent.entity';
import { Professor } from './entities/professor.entity';
import { Project } from './entities/projects.entity';
import { Translation } from './entities/translation.entity';

@Injectable()
export class ProfessorService {
  async create(createProfessorDto: CreateProfessorDto, queryRunner: QueryRunner) {
    const professor = new Professor();
    professor.name = createProfessorDto.name;
    professor.identifier = createProfessorDto.identifier;

    await AppDataSource.createQueryBuilder(queryRunner).insert().into(Professor).values(professor).execute();
    return professor;
  }

  async findAll(): Promise<ProfessorTableDto[]> {
    const professors = await AppDataSource.createQueryBuilder()
      .select(['p.id as id', 'p.identifier as identifier', 'p.name as name'])
      .addSelect(subQuery => {
        return subQuery
          .select(`COUNT(*)`, 'computerArticles')
          .from(JournalPublication, 'jp')
          .where('jp.professor_id = p.id');
      }, 'computerArticles')
      .addSelect(subQuery => {
        return subQuery
          .select(`COUNT(*)`, 'computerPublications')
          .from(ConferencePublication, 'cp')
          .where('cp.professor_id = p.id');
      }, 'computerPublications')
      .addSelect(subQuery => {
        return subQuery.select(`COUNT(*)`, 'books').from(Book, 'b').where('b.professor_id = p.id');
      }, 'books')
      .addSelect(subQuery => {
        return subQuery.select(`COUNT(*)`, 'patents').from(Patent, 'pt').where('pt.professor_id = p.id');
      }, 'patents')
      .addSelect(subQuery => {
        return subQuery
          .select(`COUNT(*)`, 'artisticProductions')
          .from(ArtisticProduction, 'ap')
          .where('ap.professor_id = p.id');
      }, 'artisticProductions')
      .from(Professor, 'p')
      .orderBy('p.name')
      .getRawMany();

    const result: ProfessorTableDto[] = [];
    professors.forEach(professor => {
      result.push({
        professorId: professor.id,
        professorName: professor.name,
        identifier: professor.identifier,
        computerArticles: +professor.computerArticles,
        computerPublications: +professor.computerPublications,
        books: +professor.books,
        patents: +professor.patents,
        artisticProductions: +professor.artisticProductions,
      });
    });

    return result;
  }

  async findOne(id?: number, lattes?: string, queryRunner?: QueryRunner) {
    const query = AppDataSource.createQueryBuilder(queryRunner).select('p').from(Professor, 'p');

    if (id) {
      query.where('p.id=:professorId', { professorId: id });
    }

    if (lattes) {
      query.where('p.identifier=:lattes', { lattes });
    }

    const result = await query.getOne();

    return result;
  }

  update(id: number, updateProfessorDto: UpdateProfessorDto) {
    return `This action updates a #${id} professor`;
  }

  async getPublications(
    id: string | undefined,
    lattes: string | undefined,
    journalPublications: boolean,
    conferencePublications: boolean,
  ): Promise<ProfessorPublicationsDto[]> {
    if (!journalPublications && !conferencePublications) return [];

    const queryRunner = AppDataSource.createQueryRunner();

    const whereClause = id ? 'WHERE p.id = $1' : 'WHERE p.identifier = $1';
    const param = id || lattes;

    const query = `
    ${
      journalPublications
        ? `
      SELECT
        jp.title,
        jp.journal_title as "eventJournal",
        jp.issn as "acronymIssn",
        'journal' as type,
        false as "isEvent",
        jp.year as year,
        jp.qualis,
        jp.is_top as "isTop",
        jp.doi as doi,
        jp.authors as authors
      FROM journal_publication jp
      INNER JOIN professor p ON jp.professor_id = p.id
      ${whereClause}
    `
        : ''
    }
    ${journalPublications && conferencePublications ? 'UNION' : ''}
    ${
      conferencePublications
        ? `
      SELECT
        c.title,
        c.event as "eventJournal",
        cq.acronym as "acronymIssn",
        'conference' as type,
        true as "isEvent",
        c.year as year,
        c.qualis,
        c.is_top as "isTop",
        c.doi as doi,
        c.authors as authors
      FROM conference_publication c
      LEFT JOIN conference cq ON c.conference_id = cq.id
      INNER JOIN professor p ON c.professor_id = p.id
      ${whereClause}
    `
        : ''
    }
    ORDER BY year DESC;
  `;

    const result = await queryRunner.query(query, [param]);
    await queryRunner.release();
    return result;
  }

  changeString(type: string) {
    if (type === Curriculum.ORIENTADOR_PRINCIPAL) return Curriculum.ORIENTADOR_PRINCIPAL_FORMAT;
    if (type === Curriculum.CO_ORIENTADOR) return Curriculum.CO_ORIENTADOR_FORMAT;
  }

  async getStudents(filter: string, id?: string, lattes?: string) {
    const whereClause = id ? 'a.professor = :param' : 'p.identifier = :param';
    const param = id || lattes;

    const studentsQuery = AppDataSource.createQueryBuilder()
      .select('a')
      .from(Advisee, 'a')
      .leftJoin('a.professor', 'p')
      .where(whereClause, { param });

    let students: Advisee[] = [];
    if (filter === 'current') {
      students = await studentsQuery.andWhere('a.yearEnd IS NULL').orderBy('a.yearStart', 'DESC').getMany();
    } else if (filter === 'concluded') {
      students = await studentsQuery.andWhere('a.yearStart IS NULL').orderBy('a.yearEnd', 'DESC').getMany();
    }

    const studentsDto: AdviseeFormatDto[] = [];
    students.forEach(advisee => {
      studentsDto.push({
        name: advisee.name,
        degree: advisee.degree,
        type: this.changeString(advisee.type) ?? '',
        yearStart: advisee.yearStart,
        yearEnd: advisee.yearEnd,
      });
    });

    return studentsDto;
  }

  async getProjects(id?: string, lattes?: string) {
    const whereClause = id ? 'p.professor_id = :param' : 'pr.identifier = :param';
    const param = id || lattes;

    const projects = await AppDataSource.createQueryBuilder()
      .select('p')
      .from(Project, 'p')
      .leftJoinAndSelect('p.projectFinancier', 'pf')
      .leftJoinAndSelect('pf.financier', 'f')
      .leftJoin('p.professor', 'pr')
      .where(whereClause, { param })
      .orderBy('p.yearStart', 'DESC')
      .getMany();

    const professorProjects: ProfessorProjectFinancierDto[] = [];
    projects.forEach(project => {
      let capes = false;
      let cnpq = false;
      let facepe = false;
      let anotherFinanciers = false;

      project.projectFinancier.forEach(projectFinancier => {
        // checar o código capes, cnpq, facepe
        if (projectFinancier.nature === Curriculum.AUXILIO_FINANCEIRO) {
          if (projectFinancier.financier.code == '876400000009') capes = true;
          if (projectFinancier.financier.code == '002200000000') cnpq = true;
          if (projectFinancier.financier.code == '045000000000') facepe = true;
          if (capes || cnpq || facepe) anotherFinanciers = true;
        }
      });

      professorProjects.push({
        id: project.id,
        name: project.name,
        year: project.yearStart,
        inProgress: project.periodFlag === Curriculum.ATUAL,
        capesProject: capes,
        cnpqProject: cnpq,
        facepeProject: facepe,
        anotherFinanciers: anotherFinanciers,
      });
    });

    return professorProjects;
  }

  async getPatents(id?: string, lattes?: string) {
    const whereClause = id ? 'p.id = :param' : 'p.identifier = :param';
    const param = id || lattes;

    const patents = await AppDataSource.createQueryBuilder()
      .select('pt')
      .from(Patent, 'pt')
      .leftJoin('pt.professor', 'p')
      .where(whereClause, { param })
      .orderBy('pt.developmentYear', 'DESC')
      .getMany();

    const professorPatentsDto: ProfessorPatentDto[] = patents.map(patent => {
      const professorPatentDto: ProfessorPatentDto = new ProfessorPatentDto();
      professorPatentDto.id = patent.id;
      professorPatentDto.title = patent.title;
      professorPatentDto.authors = patent.authors || '';
      professorPatentDto.developmentYear = patent.developmentYear || '';
      professorPatentDto.country = patent.country;
      professorPatentDto.category = patent.category;
      professorPatentDto.patentType = patent.patentType || '';
      professorPatentDto.registryCode = patent.registryCode || '';
      return professorPatentDto;
    });
    return professorPatentsDto;
  }

  async clearProfessorData(professor: Professor, queryRunner: QueryRunner) {
    try {
      await AppDataSource.createQueryBuilder(queryRunner)
        .delete()
        .from(JournalPublication)
        .where('professor_id=:id', { id: professor.id })
        .execute();

      await AppDataSource.createQueryBuilder(queryRunner)
        .delete()
        .from(ConferencePublication)
        .where('professor_id=:id', { id: professor.id })
        .execute();

      await AppDataSource.createQueryBuilder(queryRunner)
        .delete()
        .from(Advisee)
        .where('professor_id=:id', { id: professor.id })
        .execute();

      await AppDataSource.createQueryBuilder(queryRunner)
        .delete()
        .from(Book)
        .where('professor_id=:id', { id: professor.id })
        .execute();

      await AppDataSource.createQueryBuilder(queryRunner)
        .delete()
        .from(Patent)
        .where('professor_id=:id', { id: professor.id })
        .execute();

      await AppDataSource.createQueryBuilder(queryRunner)
        .delete()
        .from(Translation)
        .where('professor_id=:id', { id: professor.id })
        .execute();

      await AppDataSource.createQueryBuilder(queryRunner)
        .delete()
        .from(ArtisticProduction)
        .where('professor_id=:id', { id: professor.id })
        .execute();

      await queryRunner.query(
        `DELETE FROM project_financier WHERE project_id IN (
          SELECT id FROM project WHERE professor_id = $1);`,
        [professor.id],
      );

      await AppDataSource.createQueryBuilder(queryRunner)
        .delete()
        .from(Project)
        .where('professor_id=:id', { id: professor.id })
        .execute();
    } catch (err) {
      await logErrorToDatabase(err, EntityType.PROFESSOR, professor.name);
      throw err;
    }
  }

  async remove(id: number, email: string): Promise<void> {
    const connection = AppDataSource;
    const queryRunner = connection.createQueryRunner();

    await queryRunner.startTransaction();
    try {
      const professor: Professor | null = await this.findOne(id, undefined, queryRunner);

      if (!professor) {
        throw new Error(`No teacher was found with this id ${id}`);
      }

      await this.clearProfessorData(professor, queryRunner);

      await AppDataSource.createQueryBuilder(queryRunner)
        .delete()
        .from(Professor)
        .where('id=:professorId', { professorId: professor.id })
        .execute();

      await queryRunner.commitTransaction();
      createLog(
        EntityType.PROFESSOR,
        `Type: Delete
      Email: ${email}
      Delete: Professor -> ${professor.name}`,
      );
    } catch (err) {
      await queryRunner.rollbackTransaction();
      logErrorToDatabase(err, EntityType.PROFESSOR, Professor.name);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}

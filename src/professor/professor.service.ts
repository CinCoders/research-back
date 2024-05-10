import { Injectable } from '@nestjs/common';
import { Curriculum } from 'src/import-xml/curriculum.enum';
import { EntityType } from 'src/utils/exception-filters/entity-type-enum';
import logErrorToDatabase from 'src/utils/exception-filters/log-error';
import { QueryRunner } from 'typeorm';
import { AdviseeFormatDto } from './dto/advisee-format.dto';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { ProfessorProjectFinancierDto } from './dto/professor-project-financier.dto';
import { ProfessorPublicationsDto } from './dto/professor-publications.dto';
import { ProfessorDto } from './dto/professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';
import { Advisee } from './entities/advisee.entity';
import { JournalPublication } from './entities/journal-publication.entity';
import { ConferencePublication } from './entities/conference-publication.entity';
import { Professor } from './entities/professor.entity';
import { Project } from './entities/projects.entity';
import { ProjectFinancier } from './entities/projectFinancier.entity';
import { AppDataSource } from 'src/app.datasource';
import createLog from 'src/utils/exception-filters/log-utils';
import { Book } from './entities/book.entity';
import { Patent } from './entities/patent.entity';
import { ArtisticProduction } from './entities/artisticProduction.entity';
import { ProfessorTableDto } from './dto/professor-table.dto';
import { Translation } from './entities/translation.entity';

@Injectable()
export class ProfessorService {
  async create(
    createProfessorDto: CreateProfessorDto,
    queryRunner: QueryRunner,
  ) {
    const professor = new Professor();
    professor.name = createProfessorDto.name;
    professor.identifier = createProfessorDto.identifier;

    await AppDataSource.createQueryBuilder(queryRunner)
      .insert()
      .into(Professor)
      .values(professor)
      .execute();
    return professor;
  }

  async findAll(): Promise<ProfessorTableDto[]> {
    const professors = await AppDataSource.createQueryBuilder()
      .select(['p.id as id', 'p.identifier as identifier', 'p.name as name'])
      .addSelect((subQuery) => {
        return subQuery
          .select(`COUNT(*)`, 'computerArticles')
          .from(JournalPublication, 'jp')
          .where('jp.professor_id = p.id');
      }, 'computerArticles')
      .addSelect((subQuery) => {
        return subQuery
          .select(`COUNT(*)`, 'computerPublications')
          .from(ConferencePublication, 'cp')
          .where('cp.professor_id = p.id');
      }, 'computerPublications')
      .addSelect((subQuery) => {
        return subQuery
          .select(`COUNT(*)`, 'books')
          .from(Book, 'b')
          .where('b.professor_id = p.id');
      }, 'books')
      .addSelect((subQuery) => {
        return subQuery
          .select(`COUNT(*)`, 'patents')
          .from(Patent, 'pt')
          .where('pt.professor_id = p.id');
      }, 'patents')
      .addSelect((subQuery) => {
        return subQuery
          .select(`COUNT(*)`, 'artisticProductions')
          .from(ArtisticProduction, 'ap')
          .where('ap.professor_id = p.id');
      }, 'artisticProductions')
      .from(Professor, 'p')
      .orderBy('p.name')
      .getRawMany();

    const result: ProfessorTableDto[] = [];
    professors.forEach((professor) => {
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

  async findOne(id: number, queryRunner?: QueryRunner) {
    return await AppDataSource.createQueryBuilder(queryRunner)
      .select('p')
      .from(Professor, 'p')
      .where('p.id=:professorId', { professorId: id })
      .getOne();
  }

  async findOneByIdentifier(identifier: string, queryRunner: QueryRunner) {
    return await AppDataSource.createQueryBuilder(queryRunner)
      .select('p')
      .from(Professor, 'p')
      .where('p.identifier=:identifier', { identifier: identifier })
      .getOne();
  }

  update(id: number, updateProfessorDto: UpdateProfessorDto) {
    return `This action updates a #${id} professor`;
  }

  async getPublications(
    id: string,
    journalPublications: boolean,
    conferencePublications: boolean,
  ): Promise<ProfessorPublicationsDto[]> {
    if (!journalPublications && !conferencePublications) return [];

    const queryRunner = AppDataSource.createQueryRunner();

    const result = await queryRunner.query(
      `
      ${
        journalPublications
          ? `SELECT 
        jp.title, 
        jp.journal_title as "eventJournal", 
        jp.issn as "acronymIssn",
        'journal' as type, 
        jp.year as year, 
        jp.qualis, 
        jp.is_top as "isTop",
        jp.doi
      FROM journal_publication jp
      WHERE jp.professor_id=$1`
          : ''
      }
      ${journalPublications && conferencePublications ? 'UNION' : ''}
      ${
        conferencePublications
          ? `SELECT 
        c.title, 
        c.event as "eventJournal", 
        cq.acronym as "acronymIssn",
        'conference' as type, 
        c.year as year, 
        c.qualis, 
        c.is_top,
        c.doi
      FROM conference_publication c
      LEFT JOIN conference as cq ON c.conference_id=cq.id
      WHERE c.professor_id=$1`
          : ''
      }
      ORDER BY year DESC;
    `,
      [id],
    );
    await queryRunner.release();

    return result;
  }

  changeString(type: string) {
    if (type === Curriculum.ORIENTADOR_PRINCIPAL)
      return Curriculum.ORIENTADOR_PRINCIPAL_FORMAT;
    if (type === Curriculum.CO_ORIENTADOR)
      return Curriculum.CO_ORIENTADOR_FORMAT;
  }

  async getStudents(id: string, filter: string) {
    const studentsQuery = AppDataSource.createQueryBuilder()
      .select('a')
      .from(Advisee, 'a')
      .where('a.professor=:id', { id: id });

    let students: Advisee[] = [];
    if (filter === 'current') {
      students = await studentsQuery
        .andWhere('a.yearEnd IS NULL')
        .orderBy('a.yearStart', 'DESC')
        .getMany();
    } else if (filter === 'concluded') {
      students = await studentsQuery
        .andWhere('a.yearStart IS NULL')
        .orderBy('a.yearEnd', 'DESC')
        .getMany();
    }

    const studentsDto: AdviseeFormatDto[] = [];
    students.forEach((advisee) => {
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

  async getProjects(id: string) {
    const projects = await AppDataSource.createQueryBuilder()
      .select('p')
      .from(Project, 'p')
      .leftJoinAndSelect('p.projectFinancier', 'pf')
      .leftJoinAndSelect('pf.financier', 'f')
      .orderBy('p.yearStart', 'DESC')
      .where('p.professor_id=:id', { id: id })
      .getMany();

    const professorProjects: ProfessorProjectFinancierDto[] = [];
    projects.forEach((project) => {
      let capes = false;
      let cnpq = false;
      let facepe = false;
      let anotherFinanciers = false;

      project.projectFinancier.forEach((projectFinancier) => {
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
      const professor: Professor | null = await this.findOne(id, queryRunner);

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
        queryRunner,
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

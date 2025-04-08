import { Injectable } from '@nestjs/common';
import { Financier } from 'src/professor/entities/financier.entity';
import { ProjectFinancier } from 'src/professor/entities/projectFinancier.entity';
import { EntityType } from 'src/utils/exception-filters/entity-type-enum';
import logErrorToDatabase from 'src/utils/exception-filters/log-error';
import { QueryRunner } from 'typeorm';
import { ProjectDto } from '../../dto/project.dto';
import { Project } from '../../entities/projects.entity';
import { AppDataSource } from 'src/app.datasource';

@Injectable()
export class ProjectService {
  async getProject(projectDto: ProjectDto, queryRunner: QueryRunner) {
    return await AppDataSource.createQueryBuilder(queryRunner)
      .select('p')
      .from(Project, 'p')
      .where('p.name=:name', { name: projectDto.name })
      .andWhere('p.yearStart=:year', { year: projectDto.year })
      .andWhere('p.professor_id=:professorId', {
        professorId: projectDto.professor.id,
      })
      .getOne();
  }

  async createProject(projectDto: ProjectDto, queryRunner: QueryRunner) {
    const project = new Project();
    try {
      project.professor = projectDto.professor;
      project.name = projectDto.name;
      project.yearStart = +projectDto.year;
      project.periodFlag = projectDto.periodFlag;
      project.projectFinancier = [];
      await AppDataSource.createQueryBuilder(queryRunner).insert().into(Project).values(project).execute();
    } catch (error) {
      await logErrorToDatabase(error, EntityType.PROJECT, undefined);
      throw error;
    }
    return project;
  }

  async addFinancierToProject(project: Project, financier: Financier, nature: string, queryRunner: QueryRunner) {
    const projectFinancier = new ProjectFinancier();
    projectFinancier.project = project;
    projectFinancier.financier = financier;
    projectFinancier.nature = nature;
    await AppDataSource.createQueryBuilder(queryRunner)
      .insert()
      .into(ProjectFinancier)
      .values(projectFinancier)
      .execute();

    if (!project.projectFinancier) {
      project.projectFinancier = [projectFinancier];
    } else {
      project.projectFinancier.push(projectFinancier);
    }
    if (!financier.projectFinancier) {
      financier.projectFinancier = [projectFinancier];
    } else {
      financier.projectFinancier.push(projectFinancier);
    }

    await AppDataSource.createQueryBuilder(queryRunner)
      .insert()
      .into(Project)
      .values(project)
      .orUpdate(['year', 'name', 'period_flag', 'professor_id'], ['id'])
      .execute();

    await AppDataSource.createQueryBuilder(queryRunner)
      .insert()
      .into(Financier)
      .values(financier)
      .orUpdate(['acronym', 'name', 'code'], ['id'])
      .execute();
  }
}

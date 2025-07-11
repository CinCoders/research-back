import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import extract from 'extract-zip';
import * as fs from 'fs';
import { readdir, readFile, rename, unlink, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { AppDataSource } from 'src/app.datasource';
import { Curriculum } from './curriculum.enum';
import { AdviseeDto } from 'src/professor/dto/advisee.dto';
import { ArtisticProductionDto } from 'src/professor/dto/artistic-production.dto';
import { BookDto } from 'src/professor/dto/book.dto';
import { ConferenceDto } from 'src/professor/dto/conference.dto';
import { CreateProfessorDto } from 'src/professor/dto/create-professor.dto';
import { FinancierDto } from 'src/professor/dto/financier.dto';
import { JournalPublicationDto } from 'src/professor/dto/journal-publication.dto';
import { PatentDto } from 'src/professor/dto/patent.dto';
import { ProjectDto } from 'src/professor/dto/project.dto';
import { TranslationDto } from 'src/professor/dto/translation.dto';
import { Professor } from 'src/professor/entities/professor.entity';
import { ProfessorService } from 'src/professor/professor.service';
import { AdviseeService } from 'src/professor/services/advisee/advisee.service';
import { JournalPublicationService } from 'src/professor/services/article/journal-publication.service';
import { ArtisticProductionService } from 'src/professor/services/artistic-production/artistic-production.service';
import { BookService } from 'src/professor/services/book/book.service';
import { ConferencePublicationService } from 'src/professor/services/conference/conference.service';
import { FinancierService } from 'src/professor/services/financier/financier.service';
import { PatentService } from 'src/professor/services/patent/patent.service';
import { ProjectService } from 'src/professor/services/project/project.service';
import { TranslationService } from 'src/professor/services/translation/translation/translation.service';
import { ConferenceService } from 'src/qualis/conference/conference.service';
import { Conference } from 'src/qualis/entities/conference.entity';
import { Journal } from 'src/qualis/entities/journal.entity';
import { JournalService } from 'src/qualis/qualis.service';
import { EntityType } from 'src/utils/exception-filters/entity-type-enum';
import logErrorToDatabase from 'src/utils/exception-filters/log-error';
import { QueryRunner } from 'typeorm';
import { Log } from 'src/utils/exception-filters/log.entity';
import { Status } from 'src/types/enums';
import { ImportJson } from './entities/import-json.entity';
import { PaginationDto } from 'src/types/pagination.dto';
import { ImportJsonDto } from './dto/import-json.dto';


@Injectable()
export class ImportJsonService {
  path = require('path');

  JSON_PATH = process.env.JSON_PATH ?? 'downloadedFiles/json';

  constructor(
    private readonly journalService: JournalService,
    private readonly conferenceService: ConferenceService,
    private readonly professorService: ProfessorService,
    private readonly conferencePublicationsService: ConferencePublicationService,
    private readonly journalPublicationService: JournalPublicationService,
    private readonly adviseeService: AdviseeService,
    private readonly financierService: FinancierService,
    private readonly projectService: ProjectService,
    private readonly bookService: BookService,
    private readonly translationService: TranslationService,
    private readonly patentService: PatentService,
    private readonly artisticProductionService: ArtisticProductionService,
  ) {}

  async unzipFile(file: Express.Multer.File) {
    try {
      const zipPath = file.path;
      const absoluteJsonPath = resolve(this.JSON_PATH);

      let extractedJsonPath: string | null = null;

      await extract(zipPath, {
        dir: absoluteJsonPath,   
        onEntry: (entry) => {
          if (entry.fileName.endsWith('.json')) {
            extractedJsonPath = `${absoluteJsonPath}/${entry.fileName}`;
          }
        },
      });

      if (!extractedJsonPath) {
        throw new Error('Nenhum arquivo .json encontrado no .zip');
      }

      const newName = `${absoluteJsonPath}/${file.originalname.split('.')[0]}.json`;
      await rename(extractedJsonPath, newName);
      await unlink(zipPath);
      file.path = newName;
    } catch (err) {
      await logErrorToDatabase(err, EntityType.UNZIP);
      throw err;
    }
  }


  async splitJsonData(filePath: string, username: string) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      
      if (!fs.existsSync(this.JSON_PATH)) {
        fs.mkdirSync(this.JSON_PATH, { recursive: true });
      }

      const raw = await readFile(filePath, 'utf-8');
      let professors = JSON.parse(raw);
      if (!Array.isArray(professors)) {
        throw new HttpException('O arquivo JSON deve conter um array.', HttpStatus.NOT_ACCEPTABLE);
      }

      for (const professor of professors) {
        const json = professor.json;
        const id = json[Curriculum.NUMERO_IDENTIFICADOR];
        const fileJsonPath = `${this.JSON_PATH}/${id}.json`;
        const filename = `${id}.json`;

        const importJson = new ImportJson();
        importJson.id = filename;
        importJson.name = filename;
        importJson.user = username;
        importJson.status = Status.PENDING;
        importJson.startedAt = null;
        importJson.finishedAt = null;
        importJson.storedJson = true;

        await AppDataSource.manager.save(importJson);


        await writeFile(fileJsonPath, JSON.stringify(json, null, 2));
      }

      await unlink(filePath);       
      await queryRunner.commitTransaction();

    } catch (err) {

      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteFiles() {
    if (this.JSON_PATH) {
        const files = await readdir(this.JSON_PATH);
        for (const file of files) {
            await unlink(this.JSON_PATH + '/' + file);
        }
    }
  }

  async findAllJsons(paginationDto: PaginationDto){
    const totalCount = await AppDataSource.createQueryBuilder().select().from(ImportJson, 'i').getCount();

    const importedJsonEntity = await AppDataSource.createQueryBuilder()
      .select('i')
      .from(ImportJson, 'i')
      .orderBy('included_at', 'DESC')
      .offset(paginationDto.offset)
      .limit(paginationDto.limit)
      .getMany();

    const importedJsonDto: ImportJsonDto[] = [];
    for (const json of importedJsonEntity) {
      let importTime: number | undefined = undefined;
      if (json.startedAt) {
        if (json.finishedAt) {
          importTime = (json.finishedAt.valueOf() - json.startedAt.valueOf()) / 1000;
        } else {
          importTime = (new Date().valueOf() - json.startedAt.valueOf()) / 1000;
        }
      }

      const xmlDto: ImportJsonDto = {
        id: json.id,
        name: json.name,
        professor: json.professorName,
        user: json.user,
        status: json.status,
        storedXml: json.storedJson,
        includedAt: json.includedAt,
        importTime: importTime,
      };
      importedJsonDto.push(xmlDto);
    }

    return {
      totalElements: totalCount,
      totalPages: Math.ceil(totalCount / paginationDto.limit),
      currentPage: paginationDto.page + 1,
      pageSize: paginationDto.limit,
      offset: paginationDto.offset,
      data: importedJsonDto,
    };
  }


  createImportLog(file: string, username: string, professorName: string) {
    const importJson = new Log();
    importJson.entityType = EntityType.IMPORT;
    importJson.executionContextHost = '';

    importJson.message = `Original name: ${file}
      File name: ${file}
      Username: ${username}
      Professor name: ${professorName}
      Result: `;

    return importJson;
  }

  async updateJsonStatus(id: string, filename: string | undefined, status: string, professorName: string | undefined) {
    let importJson: Partial<ImportJson> = {status, professorName, name: filename};
    switch (status) {
      case Status.LOADING: {
        importJson.startedAt = new Date();
        break;
      }
      case Status.PROGRESS: {
        break;
      }  
      case Status.CONCLUDED:
      case Status.NOT_IMPORTED: {
        importJson.finishedAt = new Date();
        break;
      }
    }
    await AppDataSource.createQueryBuilder().update(ImportJson).set(importJson).where('id=:name', { name: id }).execute();
  }

  async updateStoredJson(id: string): Promise<void> {
    const Json: ImportJson | null = await this.findOne(id);
    if (Json === null) throw Error('Json not found');
    try {
      // Set storedJson to false for all JSONs with the same name as the one with the provided id
      await AppDataSource.createQueryBuilder()
        .update(ImportJson)
        .set({ storedJson: false })
        .where('name=:JsonName AND storedJson = true', {
          JsonName: Json.name,
        })
        .execute();

      // Set storedJson to true for the specific JSON with the provided id
      await AppDataSource.createQueryBuilder()
        .update(ImportJson)
        .set({ storedJson: true })
        .where('id=:JsonId', { JsonId: Json.id })
        .execute();
    } catch (error) {
      console.error('Error updating storedJson:', error);
      throw error;
    }
  }

  async findOne(id: string) {
    return AppDataSource.createQueryBuilder().select('i').from(ImportJson, 'i').where('i.id=:id', { id: id }).getOne();
  }

  async save(importJsonLog: Log) {
    return await AppDataSource.createQueryBuilder().insert().into(Log).values(importJsonLog).execute();
  }

  getProfessorData(json: any) {
    const identifier = json[Curriculum.NUMERO_IDENTIFICADOR];
    const name = json[Curriculum.DADOS_GERAIS][Curriculum.NOME_COMPLETO];

    const createProfessorDto: CreateProfessorDto = { name, identifier };
    return createProfessorDto;
  }

  async insertProfessor(createProfessorDto: CreateProfessorDto, queryRunner: QueryRunner) {
    let professor = await this.professorService.findOne(undefined, createProfessorDto.identifier, queryRunner);

    if (!professor) {
      professor = await this.professorService.create(createProfessorDto, queryRunner);
    } else {
      await this.professorService.clearProfessorData(professor, queryRunner);
    }

    return professor;
  }


  getArticlesFromJSON(json: any) {
    if (json[Curriculum.PRODUCAO_BIBLIOGRAFICA][Curriculum.ARTIGOS_PUBLICADOS]) {
        return json[Curriculum.PRODUCAO_BIBLIOGRAFICA][Curriculum.ARTIGOS_PUBLICADOS][Curriculum.ARTIGO_PUBLICADO];
    }
  }

  getArticleData(article: any, professor: Professor) {
      const bigArea =
        article[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_1]?.[
          Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO
        ] ?? undefined;
  
      const area =
        article[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_1]?.[
          Curriculum.NOME_DA_AREA_DO_CONHECIMENTO
        ] ?? undefined;
  
      const subArea =
        article[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_1]?.[
          Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO
        ] ?? undefined;
  
      const speciality =
        article[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_1]?.[
          Curriculum.NOME_DA_ESPECIALIDADE
        ] ?? undefined;
  
      const bigArea2 =
        article[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_2]?.[
          Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO
        ] ?? undefined;
  
      const area2 =
        article[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_2]?.[
          Curriculum.NOME_DA_AREA_DO_CONHECIMENTO
        ] ?? undefined;
  
      const subArea2 =
        article[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_2]?.[
          Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO
        ] ?? undefined;
  
      const speciality2 =
        article[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_2]?.[
          Curriculum.NOME_DA_ESPECIALIDADE
        ] ?? undefined;
  
      const title = article[Curriculum.DADOS_BASICOS_DO_ARTIGO][Curriculum.NOME_PRODUCAO];
      const doi = article[Curriculum.DADOS_BASICOS_DO_ARTIGO][Curriculum.DOI];
      const year = article[Curriculum.DADOS_BASICOS_DO_ARTIGO][Curriculum.ANO_PRODUCAO];
      const issn = article[Curriculum.DETALHAMENTO_DO_ARTIGO][Curriculum.ISSN];
  
      const journalTitle =
        article[Curriculum.DETALHAMENTO_DO_ARTIGO][Curriculum.TITULO_DO_PERIODICO_OU_REVISTA];
  
      const curriculumAuthors = article[Curriculum.AUTORES] ?? undefined;
      let authors = '';
  
      for (let i = 0; curriculumAuthors !== undefined && i < curriculumAuthors.length; i++) {
        const quoteName = curriculumAuthors[i][Curriculum.NOME_PARA_CITACAO];
        if (i === curriculumAuthors.length - 1) {
          authors += `${quoteName}`;
        } else {
          authors += `${quoteName}; `;
        }
      }
  
      const articleDto: JournalPublicationDto = {
        professor,
        title,
        doi,
        year,
        issn,
        journalTitle,
        authors: authors || undefined,
        bigArea,
        area,
        subArea,
        speciality,
        bigArea2,
        area2,
        subArea2,
        speciality2,
      };
  
      return articleDto;
  }

  async insertArticles(articles: any, professor: Professor, journals: Journal[], queryRunner: QueryRunner) {
    if (!articles) return;
    for (let i = 0; articles[i] !== undefined; i++) {
      const articleData = articles[i];
      const articleDto = this.getArticleData(articleData, professor);
      let article = await this.journalPublicationService.findOne(articleDto, queryRunner);

      try {
        article ??= await this.journalPublicationService.createJournalPublication(articleDto, queryRunner);

        await this.journalPublicationService.getQualisAndJournal(article, journals, queryRunner);
      } catch (error: any) {
        if (article) {
          await logErrorToDatabase(error, EntityType.JOURNAL_PUBLICATION, article.id.toString());
        } else {
          await logErrorToDatabase(error, EntityType.JOURNAL_PUBLICATION);
        }
        throw error;
      }
    }
  }

  getBooksFromJSON(json: any) {
    if (json[Curriculum.PRODUCAO_BIBLIOGRAFICA][Curriculum.LIVROS_E_CAPITULOS]?.[Curriculum.LIVROS_PUBLICADOS_OU_ORGANIZADOS]) {
      return json[Curriculum.PRODUCAO_BIBLIOGRAFICA][Curriculum.LIVROS_E_CAPITULOS][
        Curriculum.LIVROS_PUBLICADOS_OU_ORGANIZADOS
      ][Curriculum.LIVRO_PUBLICADO_OU_ORGANIZADO];
    }
  }

  getBookData(book: any, professor: Professor) {
    const bigArea =
      book[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_1]?.[
        Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO
      ] ?? undefined;
    
    const area =
      book[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_1]?.[
        Curriculum.NOME_DA_AREA_DO_CONHECIMENTO
      ] ?? undefined;

    const subArea =
      book[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_1]?.[
        Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO
      ] ?? undefined;

    const speciality =
      book[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_1]?.[
        Curriculum.NOME_DA_ESPECIALIDADE
      ] ?? undefined;

    const bigArea2 =
      book[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_2]?.[
        Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO
      ] ?? undefined;

    const area2 =
      book[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_2]?.[
        Curriculum.NOME_DA_AREA_DO_CONHECIMENTO
      ] ?? undefined;

    const subArea2 =
      book[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_2]?.[
        Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO
      ] ?? undefined;

    const speciality2 =
      book[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_2]?.[
        Curriculum.NOME_DA_ESPECIALIDADE
      ] ?? undefined;

    const title =
      book[Curriculum.DADOS_BASICOS_DO_LIVRO]?.[Curriculum.NOME_PRODUCAO] ?? undefined;

    const language =
      book[Curriculum.DADOS_BASICOS_DO_LIVRO]?.[Curriculum.IDIOMA] ?? undefined;

    const year = book[Curriculum.DADOS_BASICOS_DO_LIVRO]?.[Curriculum.ANO_PRODUCAO] ?? undefined;

    const publicationCountry =
      book[Curriculum.DADOS_BASICOS_DO_LIVRO]?.[Curriculum.PAIS_DE_PUBLICACAO] ?? undefined;

    const bookAuthors = book[Curriculum.AUTORES] ?? undefined;
    let authors = '';

    for (let i = 0; bookAuthors !== undefined && i < bookAuthors.length; i++) {
      const quoteName = bookAuthors[i][Curriculum.NOME_PARA_CITACAO];
      if (i === bookAuthors.length - 1) {
        authors += `${quoteName}`;
      } else {
        authors += `${quoteName}; `;
      }
    }

    const bookDto: BookDto = {
      professor,
      title,
      language,
      year,
      publicationCountry,
      authors: authors || undefined,
      bigArea,
      area,
      subArea,
      speciality,
      bigArea2,
      area2,
      subArea2,
      speciality2,
    };

    return bookDto;
  }

  async insertBooks(books: any, professor: Professor, queryRunner: QueryRunner) {
    if (!books) return;
    for (let i = 0; books[i] !== undefined; i++) {
      const bookData = books[i];
      const bookDto = this.getBookData(bookData, professor);

      let book = await this.bookService.findOne(bookDto, queryRunner);

      try {
        book ??= await this.bookService.createBook(bookDto, queryRunner);
      } catch (error: any) {
        if (book) {
          await logErrorToDatabase(error, EntityType.BOOK, book.id.toString());
        } else {
          await logErrorToDatabase(error, EntityType.BOOK);
        }
        throw error;
      }
    }
  }

  getTranslationsFromJSON(json: any) {
    if (json[Curriculum.PRODUCAO_BIBLIOGRAFICA][Curriculum.DEMAIS_TIPOS_DE_PRODUCAO_BIBLIOGRAFICA]?.[Curriculum.TRADUCAO]) {
      return json[Curriculum.PRODUCAO_BIBLIOGRAFICA][Curriculum.DEMAIS_TIPOS_DE_PRODUCAO_BIBLIOGRAFICA][Curriculum.TRADUCAO];
    }
  }

  getTranslationData(translation: any, professor: Professor) {
    const bigArea =
      translation[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_1]?.[Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO] ?? undefined;

    const area =
      translation[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_1]?.[Curriculum.NOME_DA_AREA_DO_CONHECIMENTO] ?? undefined;

    const subArea =
      translation[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_1]?.[Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO] ?? undefined;

    const speciality =
      translation[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_1]?.[Curriculum.NOME_DA_ESPECIALIDADE] ?? undefined;

    const title = translation[Curriculum.DADOS_BASICOS_DA_TRADUCAO]?.[Curriculum.NOME_PRODUCAO] ?? undefined;

    const originalTitle =
      translation[Curriculum.DETALHAMENTO_DA_TRADUCAO]?.[Curriculum.TITULO_DA_OBRA_ORIGINAL] ?? undefined;

    const language =
      translation[Curriculum.DADOS_BASICOS_DA_TRADUCAO]?.[Curriculum.IDIOMA] ?? undefined;

    const originalLanguage =
      translation[Curriculum.DETALHAMENTO_DA_TRADUCAO]?.[Curriculum.IDIOMA_DA_OBRA_ORIGINAL] ?? undefined;

    const year = translation[Curriculum.DADOS_BASICOS_DA_TRADUCAO]?.[Curriculum.ANO_PRODUCAO] ?? undefined;

    const originalAuthor =
      translation[Curriculum.DETALHAMENTO_DA_TRADUCAO]?.[Curriculum.NOME_DO_AUTOR_TRADUZIDO] ?? undefined;

    const publicationCountry =
      translation[Curriculum.DADOS_BASICOS_DA_TRADUCAO]?.[Curriculum.PAIS_DE_PUBLICACAO] ?? undefined;

    const originalPublicationCity =
      translation[Curriculum.DETALHAMENTO_DA_TRADUCAO]?.[Curriculum.CIDADE_DA_EDITORA] ?? undefined;

    const issn = translation[Curriculum.DETALHAMENTO_DA_TRADUCAO]?.[Curriculum.ISSN_ISBN] ?? undefined;

    const translationAuthors = translation[Curriculum.AUTORES] ?? undefined;
    let authors = '';

    for (let i = 0; translationAuthors !== undefined && i < translationAuthors.length; i++) {
      const quoteName = translationAuthors[i][Curriculum.NOME_PARA_CITACAO];
      if (i === translationAuthors.length - 1) {
        authors += `${quoteName}`;
      } else {
        authors += `${quoteName}; `;
      }
    }

    const translationDto: TranslationDto = {
      professor,
      title,
      originalTitle,
      language,
      originalLanguage,
      year,
      originalAuthor,
      publicationCountry,
      originalPublicationCity,
      authors: authors || undefined,
      bigArea,
      area,
      subArea,
      speciality,
      issn,
    };

    return translationDto;
  }

  async insertTranslations(translations: any, professor: Professor, queryRunner: QueryRunner) {
    if (!translations) return;
    for (let i = 0; translations[i] !== undefined; i++) {
      const translationData = translations[i];
      const translationDto = this.getTranslationData(translationData, professor);

      let translation = await this.translationService.findOne(translationDto, queryRunner);

      try {
        translation ??= await this.translationService.createTranslation(translationDto, queryRunner);
      } catch (error: any) {
        if (translation) {
          await logErrorToDatabase(error, EntityType.TRANSLATION, translation.id.toString());
        } else {
          await logErrorToDatabase(error, EntityType.BOOK);
        }
        throw error;
      }
    }
  }

  getPatentsFromJSON(json: any) {
    if (json[Curriculum.PRODUCAO_TECNICA]?.[Curriculum.PATENTE]) {
        return json[Curriculum.PRODUCAO_TECNICA][Curriculum.PATENTE];
    }
  }

  getPatentData(patent: any, professor: Professor) {
    const title =
      patent[Curriculum.DADOS_BASICOS_DA_PATENTE]?.[Curriculum.NOME_PRODUCAO_PATENTE] ?? undefined;

    const developmentYear =
      patent[Curriculum.DADOS_BASICOS_DA_PATENTE]?.[Curriculum.ANO_PRODUCAO] ??
      undefined;

    const country =
      patent[Curriculum.DADOS_BASICOS_DA_PATENTE]?.[Curriculum.PAIS] ?? undefined;

    const situationStatus =
      patent[Curriculum.DETALHAMENTO_DA_PATENTE]?.[Curriculum.HISTORICO_SITUACOES_PATENTE]?.[Curriculum.DESCRICAO_SITUACAO_PATENTE] ?? 'MISSING';

    const category =
      patent[Curriculum.DETALHAMENTO_DA_PATENTE]?.[Curriculum.CATEGORIA] ?? undefined;

    const patentType =
      patent[Curriculum.DETALHAMENTO_DA_PATENTE]?.[Curriculum.REGISTRO_OU_PATENTE]?.[0][
        Curriculum.TIPO_PATENTE
      ] ?? undefined;
    const registryCode =
      patent[Curriculum.DETALHAMENTO_DA_PATENTE]?.[Curriculum.REGISTRO_OU_PATENTE]?.[0][
        Curriculum.CODIGO_DO_REGISTRO_OU_PATENTE
      ] ?? undefined;
    const depositRegistrationInstitution =
      patent[Curriculum.DETALHAMENTO_DA_PATENTE]?.[Curriculum.REGISTRO_OU_PATENTE]?.[0][
        Curriculum.INSTITUICAO_DEPOSITO_REGISTRO
      ] ?? undefined;
    const depositantName =
      patent[Curriculum.DETALHAMENTO_DA_PATENTE]?.[Curriculum.REGISTRO_OU_PATENTE]?.[
        Curriculum.NOME_DO_TITULAR
      ] ?? undefined;

    const patentAuthors = patent[Curriculum.AUTORES] ?? undefined;
    let authors = '';
    for (let i = 0; patentAuthors !== undefined && i < patentAuthors.length; i++) {
      const quoteName = patentAuthors[i][Curriculum.NOME_PARA_CITACAO];
      if (i === patentAuthors.length - 1) {
        authors += `${quoteName}`;
      } else {
        authors += `${quoteName}; `;
      }
    }

    const patentDto: PatentDto = {
      professor,
      title,
      developmentYear,
      country,
      situationStatus,
      category,
      patentType,
      registryCode,
      depositRegistrationInstitution,
      depositantName,
      authors: authors || undefined,
    };

    return patentDto;
  }

  async insertPatents(patents: any, professor: Professor, queryRunner: QueryRunner) {
    if (!patents) return;
    for (let i = 0; patents[i] !== undefined; i++) {
      const patentData = patents[i];
      const patentDto = this.getPatentData(patentData, professor);

      let patent = await this.patentService.findOne(patentDto, queryRunner);

      try {
        patent ??= await this.patentService.createPatent(patentDto, queryRunner);
      } catch (error: any) {
        if (patent) {
          await logErrorToDatabase(error, EntityType.PATENT, patent.id.toString());
        } else {
          await logErrorToDatabase(error, EntityType.PATENT);
        }
        throw error;
      }
    }
  } 

  getArtisticProductionsFromJSON(json: any) {
    if (json[Curriculum.OUTRA_PRODUCAO]?.[Curriculum.PRODUCAO_ARTISTICA_CULTURAL]) {
      return json[Curriculum.OUTRA_PRODUCAO][Curriculum.PRODUCAO_ARTISTICA_CULTURAL][0][Curriculum.ARTES_VISUAIS];
    }
  }

  getArtisticProductionData(artisticProduction: any, professor: Professor) {
    const title =
      artisticProduction[Curriculum.DADOS_BASICOS_DE_ARTES_VISUAIS]?.[Curriculum.NOME_PRODUCAO] ??
      undefined;

    const year =
      artisticProduction[Curriculum.DADOS_BASICOS_DE_ARTES_VISUAIS]?.[Curriculum.ANO_PRODUCAO] ??
      undefined;

    const country =
      artisticProduction[Curriculum.DADOS_BASICOS_DE_ARTES_VISUAIS]?.[Curriculum.PAIS] ??
      undefined;

    const language =
      artisticProduction[Curriculum.DADOS_BASICOS_DE_ARTES_VISUAIS]?.[Curriculum.IDIOMA] ??
      undefined;

    const authorActivity =
      artisticProduction[Curriculum.DETALHAMENTO_DE_ARTES_VISUAIS]?.[
        Curriculum.ATIVIDADE_DOS_AUTORES
      ] ?? undefined;

    const promotingInstitution =
      artisticProduction[Curriculum.DETALHAMENTO_DE_ARTES_VISUAIS]?.[
        Curriculum.INSTITUICAO_PROMOTORA_DO_EVENTO
      ] ?? undefined;

    const bigArea =
      artisticProduction[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_1]?.[Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO] ?? undefined;

    const area =
      artisticProduction[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[Curriculum.NOME_DA_AREA_DO_CONHECIMENTO] ?? undefined;

    const subArea =
      artisticProduction[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO] ?? undefined;

    const speciality =
      artisticProduction[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[Curriculum.NOME_DA_ESPECIALIDADE] ?? undefined;

    const artisticProductionAuthors = artisticProduction[Curriculum.AUTORES] ?? undefined;
    let authors = '';

    for (let i = 0; artisticProductionAuthors !== undefined && i < artisticProductionAuthors.length; i++) {
      const quoteName = artisticProductionAuthors[i][Curriculum.NOME_PARA_CITACAO];
      if (i === artisticProductionAuthors.length - 1) {
        authors += `${quoteName}`;
      } else {
        authors += `${quoteName}; `;
      }
    }

    const artisticProductionDto: ArtisticProductionDto = {
      professor,
      title,
      year,
      country,
      language,
      authorActivity,
      promotingInstitution,
      bigArea,
      area,
      subArea,
      speciality,
      authors: authors || undefined,
    };

    return artisticProductionDto;
  }

  async insertArtisticProductions(artisticProductions: any, professor: Professor, queryRunner: QueryRunner) {
    if (!artisticProductions) return;
    for (let i = 0; artisticProductions[i] !== undefined; i++) {
      
      const artisticProductionData = artisticProductions[i];
      const artisticProductionDto = this.getArtisticProductionData(artisticProductionData, professor);
      let artisticProduction = await this.artisticProductionService.findOne(artisticProductionDto, queryRunner);

      try {
        artisticProduction ??= await this.artisticProductionService.createArtisticProduction(artisticProductionDto, queryRunner,);
      } catch (error: any) {
        if (artisticProduction) {
          await logErrorToDatabase(error, EntityType.ARTISTIC_PRODUCTION, artisticProduction.id.toString());
        } else {
          await logErrorToDatabase(error, EntityType.ARTISTIC_PRODUCTION);
        }
        throw error;
      }
    }
  }

  getConferencesFromJSON(json: any) {
    if (json[Curriculum.PRODUCAO_BIBLIOGRAFICA][Curriculum.TRABALHOS_EM_EVENTOS]) {
        return json[Curriculum.PRODUCAO_BIBLIOGRAFICA][Curriculum.TRABALHOS_EM_EVENTOS][
        Curriculum.TRABALHO_EM_EVENTOS
        ];
    }
  }

  getConferenceData(conference: any, professor: Professor) {
    const bigArea =
      conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_1]?.[
        Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO
      ] ?? undefined;

    const area =
      conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_1]?.[
        Curriculum.NOME_DA_AREA_DO_CONHECIMENTO
      ] ?? undefined;

    const subArea =
      conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_1]?.[
        Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO
      ] ?? undefined;

    const speciality =
      conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_1]?.[
        Curriculum.NOME_DA_ESPECIALIDADE
      ] ?? undefined;

    const bigArea2 =
      conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_2]?.[
        Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO
      ] ?? undefined;

    const area2 =
      conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_2]?.[
        Curriculum.NOME_DA_AREA_DO_CONHECIMENTO
      ] ?? undefined;

    const subArea2 =
      conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_2]?.[
        Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO
      ] ?? undefined;

    const speciality2 =
      conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[Curriculum.AREA_DO_CONHECIMENTO_2]?.[
        Curriculum.NOME_DA_ESPECIALIDADE
      ] ?? undefined;

    const title =
      conference[Curriculum.DADOS_BASICOS_DO_TRABALHO][Curriculum.NOME_PRODUCAO];
    const year = conference[Curriculum.DADOS_BASICOS_DO_TRABALHO][Curriculum.ANO_PRODUCAO];

    const nature = conference[Curriculum.DADOS_BASICOS_DO_TRABALHO][Curriculum.NATUREZA];

    const event = conference[Curriculum.DETALHAMENTO_DO_TRABALHO][Curriculum.NOME_DO_EVENTO];
    const proceedings =
      conference[Curriculum.DETALHAMENTO_DO_TRABALHO][
        Curriculum.TITULO_DOS_ANAIS_OU_PROCEEDINGS
      ];

    const doi = conference[Curriculum.DADOS_BASICOS_DO_TRABALHO][Curriculum.DOI];

    const curriculumAuthors = conference[Curriculum.AUTORES] ?? undefined;
    let authors = '';

    for (let i = 0; curriculumAuthors !== undefined && i < curriculumAuthors.length; i++) {
      const quoteName = curriculumAuthors[i][Curriculum.NOME_PARA_CITACAO];
      if (i === curriculumAuthors.length - 1) {
        authors += `${quoteName}`;
      } else {
        authors += `${quoteName}; `;
      }
    }

    const conferenceDto: ConferenceDto = {
      professor,
      title,
      year,
      event,
      proceedings,
      doi,
      authors: authors || undefined,
      bigArea,
      area,
      subArea,
      speciality,
      bigArea2,
      area2,
      subArea2,
      speciality2,
      nature,
    };

    return conferenceDto;
  }

  async insertConferences(
    conferencePublications: any,
    professor: Professor,
    conferences: Conference[],
    queryRunner: QueryRunner,
  ) {
    if (!conferencePublications) return;
    try {
      for (let i = 0; conferencePublications[i] !== undefined; i++) {
        const conferenceData = conferencePublications[i];
        const conferenceDto = this.getConferenceData(conferenceData, professor);
        conferenceDto.doi = conferenceDto.doi?.substring(
          conferenceDto.doi.length - Math.min(conferenceDto.doi?.length, 50),
        );
        let conference = await this.conferencePublicationsService.getConference(conferenceDto, queryRunner);
        conference ??= await this.conferencePublicationsService.createConference(conferenceDto, queryRunner);
        this.conferencePublicationsService.getConferenceAndQualis(conference, conferences, queryRunner);
      }
    } catch (error) {
      await logErrorToDatabase(error, EntityType.CONFERENCE);
      throw error;
    }
  }

  getAdviseesFromJSON(json: any) {
    if (json[Curriculum.DADOS_COMPLEMENTARES][Curriculum.ORIENTACOES_EM_ANDAMENTO])
        return json[Curriculum.DADOS_COMPLEMENTARES][
        Curriculum.ORIENTACOES_EM_ANDAMENTO
        ];
  }

  getAdviseeData(advisee: any, professor: Professor, degree: string) {
    let basicData;
    let details;
    if (degree === Curriculum.MESTRADO) {
      basicData = Curriculum.DADOS_BASICOS_DA_ORIENTACAO_EM_ANDAMENTO_DE_MESTRADO;
      details = Curriculum.DETALHAMENTO_DA_ORIENTACAO_EM_ANDAMENTO_DE_MESTRADO;
    } else if (degree === Curriculum.DOUTORADO) {
      basicData = Curriculum.DADOS_BASICOS_DA_ORIENTACAO_EM_ANDAMENTO_DE_DOUTORADO;
      details = Curriculum.DETALHAMENTO_DA_ORIENTACAO_EM_ANDAMENTO_DE_DOUTORADO;
    } else if (degree === Curriculum.POS_DOUTORADO) {
      basicData = Curriculum.DADOS_BASICOS_DA_ORIENTACAO_EM_ANDAMENTO_DE_POS_DOUTORADO;
      details = Curriculum.DETALHAMENTO_DA_ORIENTACAO_EM_ANDAMENTO_DE_POS_DOUTORADO;
    } else {
      basicData = Curriculum.DADOS_BASICOS_DA_ORIENTACAO_EM_ANDAMENTO_DE_INICIACAO_CIENTIFICA;
      details = Curriculum.DETALHAMENTO_DA_ORIENTACAO_EM_ANDAMENTO_DE_INICIACAO_CIENTIFICA;
    }

    if (!basicData || !details) return;
    
    const yearStart = advisee[basicData][Curriculum.ANO] ?? null;

    const name = advisee[details][Curriculum.NOME_DO_ORIENTANDO];
    const type = advisee[details][Curriculum.TIPO_DE_ORIENTACAO];
    let scholarship = advisee[details][Curriculum.FLAG_BOLSA];
    const financierCode = advisee[details][Curriculum.CODIGO_AGENCIA_FINANCIADORA];
    const institution = advisee[details][Curriculum.NOME_INSTITUICAO];
    const title = advisee[basicData][Curriculum.TITULO_DO_TRABALHO];
    const course = advisee[details][Curriculum.NOME_CURSO];

    if (scholarship === 'SIM') {
      scholarship = true;
    } else scholarship = false;

    const adviseeDto: AdviseeDto = {
      professor,
      yearStart: yearStart,
      name,
      type,
      scholarship,
      financierCode,
      institution,
      title,
      course,
    };
    return adviseeDto;
  }

  async insertAdvisees(advisees: any, professor: Professor, queryRunner: QueryRunner) {
    if (!advisees) return;
    try {
      if (advisees?.[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_MESTRADO]) {
        for (let i = 0; advisees[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_MESTRADO][i] !== undefined; i++) {
          const adviseeData = advisees[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_MESTRADO][i];
          const adviseeDto = this.getAdviseeData(adviseeData, professor, Curriculum.MESTRADO);

          if (adviseeDto) {
            const advisee = await this.adviseeService.getAdvisee(adviseeDto, queryRunner);
            if (!advisee) await this.adviseeService.createAdvisee(adviseeDto, Curriculum.MESTRADO, queryRunner);
          }
        }
      }

      if (advisees?.[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_DOUTORADO]) {
        for (let i = 0; advisees[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_DOUTORADO][i] !== undefined; i++) {
          const adviseeData = advisees[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_DOUTORADO][i];
          const adviseeDto = this.getAdviseeData(adviseeData, professor, Curriculum.DOUTORADO);
          if (adviseeDto) {
            let advisee = await this.adviseeService.getAdvisee(adviseeDto, queryRunner);
            if (!advisee) await this.adviseeService.createAdvisee(adviseeDto, Curriculum.DOUTORADO, queryRunner);
          }
        }
      }
      if (advisees?.[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_POS_DOUTORADO]) {
        for (let i = 0; advisees[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_POS_DOUTORADO][i] !== undefined; i++) {
          const adviseeData = advisees[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_POS_DOUTORADO][i];
          const adviseeDto = this.getAdviseeData(adviseeData, professor, Curriculum.POS_DOUTORADO);
          if (adviseeDto) {
            let advisee = await this.adviseeService.getAdvisee(adviseeDto, queryRunner);
            if (!advisee)
              advisee = await this.adviseeService.createAdvisee(adviseeDto, Curriculum.POS_DOUTORADO, queryRunner);
          }
        }
      }
      if (advisees?.[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_INICIACAO_CIENTIFICA]) {
        for (let i = 0; advisees[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_INICIACAO_CIENTIFICA][i] !== undefined; i++) {
          const adviseeData = advisees[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_INICIACAO_CIENTIFICA][i];
          const adviseeDto = this.getAdviseeData(adviseeData, professor, Curriculum.INICIACAO_CIENTIFICA);
          if (adviseeDto) {
            let advisee = await this.adviseeService.getAdvisee(adviseeDto, queryRunner);
            if (!advisee)
              advisee = await this.adviseeService.createAdvisee(
                adviseeDto,
                Curriculum.INICIACAO_CIENTIFICA,
                queryRunner,
              );
          }
        }
      }
    } catch (error) {
      await logErrorToDatabase(error, EntityType.ADVISEE);
      throw error;
    }
  }

  getConcludedAdviseesFromJSON(json: any) {
    if (json[Curriculum.OUTRA_PRODUCAO][Curriculum.ORIENTACOES_CONCLUIDAS]) {
        return json[Curriculum.OUTRA_PRODUCAO][Curriculum.ORIENTACOES_CONCLUIDAS];
    }
  }

  getConcludedAdviseesData(concludedAdvisee: any, professor: Professor, degree: string) {
    let basicData = Curriculum.DADOS_BASICOS_DE_ORIENTACOES_CONCLUIDAS_PARA_MESTRADO;
    let details = Curriculum.DETALHAMENTO_DE_ORIENTACOES_CONCLUIDAS_PARA_MESTRADO;

    if (degree === Curriculum.DOUTORADO) {
      basicData = Curriculum.DADOS_BASICOS_DE_ORIENTACOES_CONCLUIDAS_PARA_DOUTORADO;
      details = Curriculum.DETALHAMENTO_DE_ORIENTACOES_CONCLUIDAS_PARA_DOUTORADO;
    }

    if (degree === Curriculum.POS_DOUTORADO) {
      basicData = Curriculum.DADOS_BASICOS_DE_ORIENTACOES_CONCLUIDAS_PARA_POS_DOUTORADO;
      details = Curriculum.DETALHAMENTO_DE_ORIENTACOES_CONCLUIDAS_PARA_POS_DOUTORADO;
    }

    if (degree === Curriculum.INICIACAO_CIENTIFICA) {
      basicData = Curriculum.DADOS_BASICOS_DE_OUTRAS_ORIENTACOES_CONCLUIDAS;
      details = Curriculum.DETALHAMENTO_DE_OUTRAS_ORIENTACOES_CONCLUIDAS;
    }

    const yearEnd = concludedAdvisee[basicData][Curriculum.ANO];
    const name = concludedAdvisee[details][Curriculum.NOME_DO_ORIENTADO];
    let type = concludedAdvisee[details][Curriculum.TIPO_DE_ORIENTACAO];
    if (degree === Curriculum.INICIACAO_CIENTIFICA) {
      type = concludedAdvisee[details][Curriculum.TIPO_DE_ORIENTACAO_CONCLUIDA];
    }
    let scholarship = concludedAdvisee[details][Curriculum.FLAG_BOLSA];
    const financierCode = concludedAdvisee[details][Curriculum.CODIGO_AGENCIA_FINANCIADORA];
    const institution =
      concludedAdvisee[details][Curriculum.NOME_INSTITUICAO_ORIENTACOES_CONCLUIDAS];
    const title = concludedAdvisee[basicData][Curriculum.TITULO];
    const course = concludedAdvisee[details][Curriculum.NOME_CURSO_ORIENTACOES_CONCLUIDAS];

    if (scholarship === 'SIM') {
      scholarship = true;
    } else scholarship = false;

    const adviseeDto: AdviseeDto = {
      professor,
      yearEnd,
      name,
      type,
      scholarship,
      financierCode,
      institution,
      title,
      course,
    };
    return adviseeDto;
  }

  async insertConcludedAdvisees(concludedAdvisees: any, professor: Professor, queryRunner: QueryRunner) {
    if (!concludedAdvisees) return;
    try {
      if (concludedAdvisees[Curriculum.ORIENTACOES_CONCLUIDAS_PARA_MESTRADO]) {
        for (let i = 0; concludedAdvisees[Curriculum.ORIENTACOES_CONCLUIDAS_PARA_MESTRADO][i] !== undefined; i++) {
          const adviseeData = concludedAdvisees[Curriculum.ORIENTACOES_CONCLUIDAS_PARA_MESTRADO][i];
          const adviseeDto = this.getConcludedAdviseesData(adviseeData, professor, Curriculum.MESTRADO);
          if (adviseeDto) {
            const advisee = await this.adviseeService.getAdvisee(adviseeDto, queryRunner);
            if (!advisee) await this.adviseeService.createAdvisee(adviseeDto, Curriculum.MESTRADO, queryRunner);
          }
        }
      }

      if (concludedAdvisees[Curriculum.ORIENTACOES_CONCLUIDAS_PARA_DOUTORADO]) {
        for (let i = 0; concludedAdvisees[Curriculum.ORIENTACOES_CONCLUIDAS_PARA_DOUTORADO][i] !== undefined; i++) {
          const adviseeData = concludedAdvisees[Curriculum.ORIENTACOES_CONCLUIDAS_PARA_DOUTORADO][i];
          const adviseeDto = this.getConcludedAdviseesData(adviseeData, professor, Curriculum.DOUTORADO);
          if (adviseeDto) {
            let advisee = await this.adviseeService.getAdvisee(adviseeDto, queryRunner);
            if (!advisee)
              advisee = await this.adviseeService.createAdvisee(adviseeDto, Curriculum.DOUTORADO, queryRunner);
          }
        }
      }

      if (concludedAdvisees[Curriculum.ORIENTACOES_CONCLUIDAS_PARA_POS_DOUTORADO]) {
        for (let i = 0; concludedAdvisees[Curriculum.ORIENTACOES_CONCLUIDAS_PARA_POS_DOUTORADO][i] !== undefined; i++) {
          const adviseeData = concludedAdvisees[Curriculum.ORIENTACOES_CONCLUIDAS_PARA_POS_DOUTORADO][i];
          const adviseeDto = this.getConcludedAdviseesData(adviseeData, professor, Curriculum.POS_DOUTORADO);
          if (adviseeDto) {
            let advisee = await this.adviseeService.getAdvisee(adviseeDto, queryRunner);
            if (!advisee)
              advisee = await this.adviseeService.createAdvisee(adviseeDto, Curriculum.POS_DOUTORADO, queryRunner);
          }
        }
      }

      if (concludedAdvisees[Curriculum.OUTRAS_ORIENTACOES_CONCLUIDAS]) {
        for (let i = 0; concludedAdvisees[Curriculum.OUTRAS_ORIENTACOES_CONCLUIDAS][i] !== undefined; i++) {
          const adviseeType =
            concludedAdvisees[Curriculum.OUTRAS_ORIENTACOES_CONCLUIDAS][i][
              Curriculum.DADOS_BASICOS_DE_OUTRAS_ORIENTACOES_CONCLUIDAS
            ][Curriculum.NATUREZA];
          if (adviseeType === Curriculum.INICIACAO_CIENTIFICA) {
            const adviseeData = concludedAdvisees[Curriculum.OUTRAS_ORIENTACOES_CONCLUIDAS][i];
            const adviseeDto = this.getConcludedAdviseesData(adviseeData, professor, Curriculum.INICIACAO_CIENTIFICA);
            if (adviseeDto) {
              let advisee = await this.adviseeService.getAdvisee(adviseeDto, queryRunner);
              if (!advisee)
                advisee = await this.adviseeService.createAdvisee(
                  adviseeDto,
                  Curriculum.INICIACAO_CIENTIFICA,
                  queryRunner,
                );
            }
          }
        }
      }
    } catch (error) {
      await logErrorToDatabase(error, EntityType.CONCLUDED_ADVISEE);
      throw error;
    }
  }

  getFinancierData(financierData: any) {
    const name = financierData[Curriculum.NOME_INSTITUICAO];
    const code = financierData[Curriculum.CODIGO_INSTITUICAO];
    const nature = financierData[Curriculum.NATUREZA];
    const financierDto: FinancierDto = {
      name,
      code,
      nature,
    };
    return financierDto;
  }

  getProjectsFromJSON(json: any) {
      if (json[Curriculum.DADOS_GERAIS][Curriculum.ATUACOES_PROFISSIONAIS]) {
          return json[Curriculum.DADOS_GERAIS][Curriculum.ATUACOES_PROFISSIONAIS][Curriculum.ATUACAO_PROFISSIONAL];
      }
  }

  getResearchProjects(project: any) {
      return project[Curriculum.ATIVIDADES_DE_PARTICIPACAO_EM_PROJETO][Curriculum.PARTICIPACAO_EM_PROJETO];
  }

  getResearchProjectFinancier(researchProject: any) {
      if (researchProject[Curriculum.PROJETO_DE_PESQUISA])
            return researchProject[Curriculum.PROJETO_DE_PESQUISA][Curriculum.FINANCIADORES_DO_PROJETO];
  }

  getFinancierFromJSON(json: any) {
      if (json) {
        const financiersDto: FinancierDto[] = [];
        for (let i = 0; json[Curriculum.FINANCIADOR_DO_PROJETO][i] !== undefined; i++) {
          const financierJson = json[Curriculum.FINANCIADOR_DO_PROJETO][i];
          const name = financierJson[Curriculum.NOME_INSTITUICAO];
          const code = financierJson[Curriculum.CODIGO_INSTITUICAO];
          const nature = financierJson[Curriculum.NATUREZA];
          financiersDto.push({ name, code, nature });
        }
        return financiersDto;
      }
  }

  getProjectData(researchProject: any, professor: Professor) {
    if (
      researchProject[Curriculum.PROJETO_DE_PESQUISA]?.[0]?.[Curriculum.ANO_INICIO] &&
      researchProject[Curriculum.PROJETO_DE_PESQUISA][0][Curriculum.ANO_INICIO] !== ''
    ) {
      const yearStart = researchProject[Curriculum.PROJETO_DE_PESQUISA][0][Curriculum.ANO_INICIO];
      const name = researchProject[Curriculum.PROJETO_DE_PESQUISA][0][Curriculum.NOME_DO_PROJETO];
      const periodFlag = researchProject[Curriculum.FLAG_PERIODO];

      const projectDto: ProjectDto = {
        professor,
        year: yearStart,
        name,
        periodFlag,
      };

      return projectDto;
    }
    return;
  }

  async insertProjects(projects: any, professor: Professor, queryRunner: QueryRunner) {
    if (!projects) return;
    try {
      if (projects)
        for (let i = 0; i < projects.length; i++) {
          if (projects[i][Curriculum.ATIVIDADES_DE_PARTICIPACAO_EM_PROJETO]) {
            const researchProjects = this.getResearchProjects(projects[i]);
            for (let j = 0; researchProjects[j] !== undefined; j++) {
              const researchProject = researchProjects[j];
              let project;
              const projectDto = this.getProjectData(researchProject, professor);
              if (projectDto) project = await this.projectService.getProject(projectDto, queryRunner);
              if (!project && projectDto) project = await this.projectService.createProject(projectDto, queryRunner);
              const financiers = this.getResearchProjectFinancier(researchProject);
              const financiersDto = this.getFinancierFromJSON(financiers);
              if (financiersDto) {
                for (let k = 0; k < financiersDto.length; k++) {
                  const financierDto = financiersDto[k];
                  let financier = await this.financierService.getFinancier(financierDto, queryRunner);
                  if (!financier) {
                    financier = await this.financierService.createFinancier(financierDto, queryRunner);
                  }
                  if (project) {
                    await this.projectService.addFinancierToProject(
                      project,
                      financier,
                      financierDto.nature,
                      queryRunner,
                    );
                  }
                }
              }
            }
          }
        }
    } catch (error) {
      await logErrorToDatabase(error, EntityType.PROJECT);
      throw error;
    }
  }

  async processJson(file: string, username: string, journals: Journal[], conferences: Conference[], queryRunner: QueryRunner){
    await queryRunner.startTransaction();

    try{
      this.updateJsonStatus(file, undefined, Status.LOADING, undefined);
      let importJsonLog = this.createImportLog(file, username, 'undefined');
      let professorDto: CreateProfessorDto | undefined;

      try {
        const filePath = `${this.JSON_PATH}/${file}`;
        const raw = await readFile(filePath, 'utf-8');
        const jsonRaw = JSON.parse(raw);
        
        professorDto = this.getProfessorData(jsonRaw);
      
        this.updateJsonStatus(file, file, Status.PROGRESS, professorDto.name);
        
        const professor = await this.insertProfessor(professorDto, queryRunner);
        importJsonLog = this.createImportLog(file, username, professor.name);
        
        const articles = this.getArticlesFromJSON(jsonRaw);
        await this.insertArticles(articles, professor, journals, queryRunner);

        const books = this.getBooksFromJSON(jsonRaw);
        await this.insertBooks(books, professor, queryRunner);

        const translations = this.getTranslationsFromJSON(jsonRaw);
        await this.insertTranslations(translations, professor, queryRunner);

        const patents = this.getPatentsFromJSON(jsonRaw);
        await this.insertPatents(patents, professor, queryRunner);

        const artisticProductions = this.getArtisticProductionsFromJSON(jsonRaw);
        await this.insertArtisticProductions(artisticProductions, professor, queryRunner);

        const conferencePublications = this.getConferencesFromJSON(jsonRaw);
        await this.insertConferences(conferencePublications, professor, conferences, queryRunner);

        const advisees = this.getAdviseesFromJSON(jsonRaw);
        await this.insertAdvisees(advisees, professor, queryRunner);

        const concludedAdvisees = this.getConcludedAdviseesFromJSON(jsonRaw);
        await this.insertConcludedAdvisees(concludedAdvisees, professor, queryRunner);

        const projects = this.getProjectsFromJSON(jsonRaw);
        await this.insertProjects(projects, professor, queryRunner);

        importJsonLog.message += 'SUCCESS';
        this.updateJsonStatus(file, file, Status.CONCLUDED, professorDto.name);
      }catch(err){
        importJsonLog.message += 'FAILED';
        this.updateJsonStatus(file, undefined, Status.NOT_IMPORTED, professorDto?.name);
        throw err;
      }finally{
        this.updateStoredJson(file);
        await this.save(importJsonLog);
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await logErrorToDatabase(err, EntityType.IMPORT, file);
    }
  }

  async reprocessJson(id: string) {
    const importedJson = await this.findOne(id);
    const queryRunner = AppDataSource.createQueryRunner();

    if (!importedJson) throw new Error('Json not found');

    const journals = await this.journalService.findAll(queryRunner);
    const conferences = await this.conferenceService.findAll(queryRunner);

    try {
      await queryRunner.startTransaction();

      const importJson = new ImportJson();
      importJson.id = id;
      importJson.name = id;
      importJson.user = importedJson.user;
      importJson.status = Status.PENDING;
      importJson.startedAt = undefined;
      importJson.finishedAt = undefined;
      importJson.storedJson = true;

      await AppDataSource.getRepository(ImportJson).save(importJson);
      
      await queryRunner.commitTransaction();

      await this.processJson(id, importedJson.name, journals, conferences, queryRunner);

    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('Erro ao processar json:', err);
      throw err;
    } finally {
      await queryRunner.release();
    }

    return importedJson;
  }

  
  async insertDataToDatabase(username: string) {
    const files = await readdir(this.JSON_PATH);
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      const journals = await this.journalService.findAll(queryRunner);
      const conferences = await this.conferenceService.findAll(queryRunner);

      for (const file of files) {
        await this.processJson(file, username, journals, conferences, queryRunner);
      }
    }  finally {
      await queryRunner.release();
    }
  }

  async processImportJson(file: Express.Multer.File, username: string) {
      await this.splitJsonData(file.path, username);
      this.insertDataToDatabase(username);
  }
}

import { Injectable } from '@nestjs/common';
import { readdir, readFile, rename, unlink } from 'fs/promises';
import { parseStringPromise } from 'xml2js';
import { Financier } from 'src/professor/entities/financier.entity';
import { JournalService } from 'src/qualis/qualis.service';
import { ConferenceService } from 'src/qualis/conference/conference.service';
import { ProfessorService } from 'src/professor/professor.service';
import { ConferencePublicationService } from 'src/professor/services/conference/conference.service';
import { JournalPublicationService } from 'src/professor/services/article/journal-publication.service';
import { AdviseeService } from 'src/professor/services/advisee/advisee.service';
import { FinancierService } from 'src/professor/services/financier/financier.service';
import { ProjectService } from 'src/professor/services/project/project.service';
import { JournalPublicationDto } from 'src/professor/dto/journal-publication.dto';
import { Professor } from 'src/professor/entities/professor.entity';
import { Journal } from 'src/qualis/entities/journal.entity';
import { Conference } from 'src/qualis/entities/conference.entity';
import { ConferenceDto } from 'src/professor/dto/conference.dto';
import { AdviseeDto } from 'src/professor/dto/advisee.dto';
import { ProjectDto } from 'src/professor/dto/project.dto';
import { FinancierDto } from 'src/professor/dto/financier.dto';
import { CreateProfessorDto } from 'src/professor/dto/create-professor.dto';
import { Curriculum } from './curriculum.enum';
import logErrorToDatabase from 'src/utils/exception-filters/log-error';
import { EntityType } from 'src/utils/exception-filters/entity-type-enum';
import { extname } from 'path';
import * as fs from 'fs';
import extract from 'extract-zip';
import { QueryRunner } from 'typeorm';
import { Log } from 'src/utils/exception-filters/log.entity';
import { ImportXml } from './entities/import-xml.entity';
import { Status } from 'src/types/enums';
import { ImportXmlDto } from './dto/import-xml.dto';
import { PaginationDto } from '../types/pagination.dto';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '.././app.datasource';
import { BookDto } from '../professor/dto/book.dto';
import { BookService } from '../professor/services/book/book.service';
import { PatentDto } from '../professor/dto/patent.dto';
import { PatentService } from '../professor/services/patent/patent.service';
import { ArtisticProductionDto } from '../professor/dto/artistic-production.dto';
import { ArtisticProductionService } from '../professor/services/artistic-production/artistic-production.service';

@Injectable()
export class ImportXmlService {
  XML_PATH = process.env.XML_PATH ?? 'downloadedFiles';

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
    private readonly patentService: PatentService,
    private readonly artisticProductionService: ArtisticProductionService,
  ) {}

  async findAllXmlsPaginated(paginationDto: PaginationDto) {
    const totalCount = await AppDataSource.createQueryBuilder()
      .select()
      .from(ImportXml, 'i')
      .getCount();

    const importedXmlEntity = await AppDataSource.createQueryBuilder()
      .select('i')
      .from(ImportXml, 'i')
      .orderBy('included_at', 'DESC')
      .offset(paginationDto.offset)
      .limit(paginationDto.limit)
      .getMany();

    const importedXmlDto = [];
    for (let i = 0; i < importedXmlEntity.length; i++) {
      let importTime: number | undefined = undefined;
      if (importedXmlEntity[i].startedAt) {
        if (importedXmlEntity[i].finishedAt) {
          importTime =
            (importedXmlEntity[i].finishedAt!.valueOf() -
              importedXmlEntity[i].startedAt!.valueOf()) /
            1000;
        } else {
          importTime =
            (new Date().valueOf() - importedXmlEntity[i].startedAt!.valueOf()) /
            1000;
        }
      }

      const xmlDto: ImportXmlDto = {
        name: importedXmlEntity[i].name,
        professor: importedXmlEntity[i].professorName,
        user: importedXmlEntity[i].user,
        status: importedXmlEntity[i].status,
        includedAt: importedXmlEntity[i].includedAt,
        importTime: importTime,
      };
      importedXmlDto.push(xmlDto);
    }
    return {
      totalElements: totalCount,
      totalPages: Math.ceil(totalCount / paginationDto.limit),
      currentPage: paginationDto.page + 1,
      pageSize: paginationDto.limit,
      offset: paginationDto.offset,
      data: importedXmlDto,
    };
  }

  async reprocessXML(id: string) {
    const queryRunner = AppDataSource.createQueryRunner();
    const importXml = await AppDataSource.createQueryBuilder()
      .select('i')
      .from(ImportXml, 'i')
      .where('i.professor_name=:id', { id: id })
      .orderBy('included_at', 'DESC')
      .getOne();

    try {
      await queryRunner.startTransaction();

      if (!importXml) throw Error('XML not found');

      const filesArray: Array<Express.Multer.File> = [];
      const filePath = this.XML_PATH + '/' + importXml.name;
      const file = {
        fieldname: 'file0',
        filename: uuidv4(),
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        originalname: importXml.name,
        path: filePath,
        destination: filePath,
        size: fs.statSync(filePath).size,
        buffer: fs.readFileSync(filePath), // Read the file into a buffer
        stream: fs.createReadStream(filePath),
      };
      filesArray.push(file);
      await queryRunner.commitTransaction();

      this.enqueueFiles(filesArray, importXml.user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
      return importXml;
    }
  }

  async findXMLDocument(file: Express.Multer.File) {
    return AppDataSource.createQueryBuilder()
      .select('i')
      .from(ImportXml, 'i')
      .where('i.id=:name', { name: file.filename })
      .getOne();
  }

  async updateXMLStatus(
    id: string,
    filename: string | undefined,
    status: string,
    professorName: string | undefined,
  ) {
    let importXml: any = undefined;
    switch (status) {
      case Status.LOADING: {
        importXml = { status: status, startedAt: new Date() };
        break;
      }
      case Status.PROGRESS: {
        importXml = {
          status: status,
          professorName: professorName,
          name: filename,
        };
        break;
      }
      case Status.CONCLUDED:
      case Status.NOT_IMPORTED: {
        importXml = { status: status, finishedAt: new Date() };
        break;
      }
    }
    await AppDataSource.createQueryBuilder()
      .update(ImportXml)
      .set(importXml)
      .where('id=:name', { name: id })
      .execute();
  }

  async parseXMLDocument(file: Express.Multer.File) {
    let xmlData: string;
    // se um dos arquivos for no formato zip, vamos extraí-lo
    if (extname(file.originalname) === '.zip') {
      await this.unzipFile(file);
      xmlData = await readFile(
        this.XML_PATH + '/' + file.originalname.split('.')[0] + '.xml',
        {
          encoding: 'latin1',
        },
      );
    } else {
      try {
        await rename(file.path, this.XML_PATH + '/' + file.originalname);
        file.path = this.XML_PATH + '/' + file.originalname;
      } catch (error) {
        if (error instanceof Error) {
          throw Error(
            `The file could not be renamed. Message: ${error.message}`,
          );
        }

        throw Error('The file could not be renamed.');
      }

      xmlData = await readFile(this.XML_PATH + '/' + file.originalname, {
        encoding: 'latin1',
      });
    }
    const object = await parseStringPromise(xmlData);
    return JSON.parse(JSON.stringify(object));
  }

  getProfessorData(json: any) {
    const identifier =
      json[Curriculum.CURRICULO_VITAE][Curriculum.ATRIBUTOS][
        Curriculum.NUMERO_IDENTIFICADOR
      ];
    const name =
      json[Curriculum.CURRICULO_VITAE][Curriculum.DADOS_GERAIS][0][
        Curriculum.ATRIBUTOS
      ][Curriculum.NOME_COMPLETO];

    const createProfessorDto: CreateProfessorDto = { name, identifier };
    return createProfessorDto;
  }

  async insertProfessor(
    createProfessorDto: CreateProfessorDto,
    queryRunner: QueryRunner,
  ) {
    let professor = await this.professorService.findOneByIdentifier(
      createProfessorDto.identifier,
      queryRunner,
    );

    if (!professor) {
      professor = await this.professorService.create(
        createProfessorDto,
        queryRunner,
      );
    } else {
      await this.professorService.clearProfessorData(professor, queryRunner);
    }

    return professor;
  }

  getArticlesFromXML(json: any) {
    if (
      json[Curriculum.CURRICULO_VITAE][Curriculum.PRODUCAO_BIBLIOGRAFICA][0][
        Curriculum.ARTIGOS_PUBLICADOS
      ]
    ) {
      return json[Curriculum.CURRICULO_VITAE][
        Curriculum.PRODUCAO_BIBLIOGRAFICA
      ][0][Curriculum.ARTIGOS_PUBLICADOS][0][Curriculum.ARTIGO_PUBLICADO];
    }
  }

  getBooksFromXML(json: any) {
    if (
      json[Curriculum.CURRICULO_VITAE][Curriculum.PRODUCAO_BIBLIOGRAFICA][0][
        Curriculum.LIVROS_E_CAPITULOS
      ] &&
      json[Curriculum.CURRICULO_VITAE][Curriculum.PRODUCAO_BIBLIOGRAFICA][0][
        Curriculum.LIVROS_E_CAPITULOS
      ][0][Curriculum.LIVROS_PUBLICADOS_OU_ORGANIZADOS]
    ) {
      return json[Curriculum.CURRICULO_VITAE][
        Curriculum.PRODUCAO_BIBLIOGRAFICA
      ][0][Curriculum.LIVROS_E_CAPITULOS][0][
        Curriculum.LIVROS_PUBLICADOS_OU_ORGANIZADOS
      ][0][Curriculum.LIVRO_PUBLICADO_OU_ORGANIZADO];
    }
  }

  getPatentsFromXML(json: any) {
    if (
      json[Curriculum.CURRICULO_VITAE][Curriculum.PRODUCAO_TECNICA] &&
      json[Curriculum.CURRICULO_VITAE][Curriculum.PRODUCAO_TECNICA][0][
        Curriculum.PATENTE
      ]
    ) {
      return json[Curriculum.CURRICULO_VITAE][Curriculum.PRODUCAO_TECNICA][0][
        Curriculum.PATENTE
      ];
    }
  }

  getArtisticProductionsFromXML(json: any) {
    if (
      json[Curriculum.CURRICULO_VITAE][Curriculum.OUTRA_PRODUCAO] &&
      json[Curriculum.CURRICULO_VITAE][Curriculum.OUTRA_PRODUCAO][0][
        Curriculum.PRODUCAO_ARTISTICA_CULTURAL
      ]
    ) {
      return json[Curriculum.CURRICULO_VITAE]?.[Curriculum.OUTRA_PRODUCAO]?.[0][
        Curriculum.PRODUCAO_ARTISTICA_CULTURAL
      ]?.[0][Curriculum.ARTES_VISUAIS];
    }
  }

  getArticleData(article: any, professor: Professor) {
    const bigArea =
      article[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][
        Curriculum.AREA_DO_CONHECIMENTO_1
      ]?.[0][Curriculum.ATRIBUTOS]?.[
        Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO
      ] || undefined;

    const area =
      article[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][
        Curriculum.AREA_DO_CONHECIMENTO_1
      ]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.NOME_DA_AREA_DO_CONHECIMENTO] ||
      undefined;

    const subArea =
      article[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][
        Curriculum.AREA_DO_CONHECIMENTO_1
      ]?.[0][Curriculum.ATRIBUTOS]?.[
        Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO
      ] || undefined;

    const speciality =
      article[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][
        Curriculum.AREA_DO_CONHECIMENTO_1
      ]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.NOME_DA_ESPECIALIDADE] ||
      undefined;

    const title =
      article[Curriculum.DADOS_BASICOS_DO_ARTIGO][0][Curriculum.ATRIBUTOS][
        Curriculum.TITULO_DO_ARTIGO
      ];
    const doi =
      article[Curriculum.DADOS_BASICOS_DO_ARTIGO][0][Curriculum.ATRIBUTOS][
        Curriculum.DOI
      ];
    const year =
      article[Curriculum.DADOS_BASICOS_DO_ARTIGO][0][Curriculum.ATRIBUTOS][
        Curriculum.ANO_DO_ARTIGO
      ];
    const issn =
      article[Curriculum.DETALHAMENTO_DO_ARTIGO][0][Curriculum.ATRIBUTOS][
        Curriculum.ISSN
      ];

    const journalTitle =
      article[Curriculum.DETALHAMENTO_DO_ARTIGO][0][Curriculum.ATRIBUTOS][
        Curriculum.TITULO_DO_PERIODICO_OU_REVISTA
      ];

    const curriculumAuthors = article[Curriculum.AUTORES] || undefined;
    let authors = '';

    for (let i = 0; i < curriculumAuthors.length; i++) {
      const quoteName =
        curriculumAuthors[i][Curriculum.ATRIBUTOS][
          Curriculum.NOME_PARA_CITACAO
        ];
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
      authors,
      bigArea,
      area,
      subArea,
      speciality,
    };

    return articleDto;
  }

  async insertArticles(
    articles: any,
    professor: Professor,
    journals: Journal[],
    queryRunner: QueryRunner,
  ) {
    if (!articles) return;
    for (let i = 0; articles[i] !== undefined; i++) {
      const articleData = articles[i];
      const articleDto = this.getArticleData(articleData, professor);
      let article = await this.journalPublicationService.findOne(
        articleDto,
        queryRunner,
      );

      try {
        if (!article)
          article =
            await this.journalPublicationService.createJournalPublication(
              articleDto,
              queryRunner,
            );

        await this.journalPublicationService.getQualisAndJournal(
          article!,
          journals,
          queryRunner,
        );
      } catch (error: any) {
        if (article) {
          await logErrorToDatabase(
            error,
            EntityType.JOURNAL_PUBLICATION,
            article.id.toString(),
          );
        } else {
          await logErrorToDatabase(
            error,
            EntityType.JOURNAL_PUBLICATION,
            undefined,
          );
        }
        throw error;
      }
    }
  }

  getBookData(book: any, professor: Professor) {
    const bigArea =
      book[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][
        Curriculum.AREA_DO_CONHECIMENTO_1
      ]?.[0][Curriculum.ATRIBUTOS]?.[
        Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO
      ] || undefined;

    const area =
      book[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][
        Curriculum.AREA_DO_CONHECIMENTO_1
      ]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.NOME_DA_AREA_DO_CONHECIMENTO] ||
      undefined;

    const subArea =
      book[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][
        Curriculum.AREA_DO_CONHECIMENTO_1
      ]?.[0][Curriculum.ATRIBUTOS]?.[
        Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO
      ] || undefined;

    const speciality =
      book[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][
        Curriculum.AREA_DO_CONHECIMENTO_1
      ]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.NOME_DA_ESPECIALIDADE] ||
      undefined;

    const title =
      book[Curriculum.DADOS_BASICOS_DO_LIVRO]?.[0][Curriculum.ATRIBUTOS]?.[
        Curriculum.TITULO_DO_LIVRO
      ] || undefined;

    const language =
      book[Curriculum.DADOS_BASICOS_DO_LIVRO]?.[0][Curriculum.ATRIBUTOS]?.[
        Curriculum.IDIOMA
      ] || undefined;

    const year =
      book[Curriculum.DADOS_BASICOS_DO_LIVRO]?.[0][Curriculum.ATRIBUTOS]?.[
        Curriculum.ANO
      ] || undefined;

    const publicationCountry =
      book[Curriculum.DADOS_BASICOS_DO_LIVRO]?.[0][Curriculum.ATRIBUTOS]?.[
        Curriculum.PAIS_DE_PUBLICACAO
      ] || undefined;

    const bookAuthors = book[Curriculum.AUTORES] || undefined;
    let authors = '';

    for (let i = 0; i < bookAuthors.length; i++) {
      const quoteName =
        bookAuthors[i][Curriculum.ATRIBUTOS][Curriculum.NOME_PARA_CITACAO];
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
      authors,
      bigArea,
      area,
      subArea,
      speciality,
    };

    return bookDto;
  }

  getPatentData(patent: any, professor: Professor) {
    const title =
      patent[Curriculum.DADOS_BASICOS_DA_PATENTE]?.[0][Curriculum.ATRIBUTOS]?.[
        Curriculum.TITULO
      ] || undefined;

    const developmentYear =
      patent[Curriculum.DADOS_BASICOS_DA_PATENTE]?.[0][Curriculum.ATRIBUTOS]?.[
        Curriculum.ANO_DESENVOLVIMENTO
      ] || undefined;

    const country =
      patent[Curriculum.DADOS_BASICOS_DA_PATENTE]?.[0][Curriculum.ATRIBUTOS]?.[
        Curriculum.PAIS
      ] || undefined;

    const situationStatus =
      patent[Curriculum.DETALHAMENTO_DA_PATENTE]?.[0][
        Curriculum.HISTORICO_SITUACOES_PATENTE
      ]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.DESCRICAO_SITUACAO_PATENTE] ||
      undefined;

    const category =
      patent[Curriculum.DETALHAMENTO_DA_PATENTE]?.[0][Curriculum.ATRIBUTOS]?.[
        Curriculum.CATEGORIA
      ] || undefined;

    const patentType =
      patent[Curriculum.DETALHAMENTO_DA_PATENTE]?.[0][
        Curriculum.REGISTRO_OU_PATENTE
      ]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.TIPO_PATENTE] || undefined;
    const registryCode =
      patent[Curriculum.DETALHAMENTO_DA_PATENTE]?.[0][
        Curriculum.REGISTRO_OU_PATENTE
      ]?.[0][Curriculum.ATRIBUTOS]?.[
        Curriculum.CODIGO_DO_REGISTRO_OU_PATENTE
      ] || undefined;
    const depositRegistrationInstitution =
      patent[Curriculum.DETALHAMENTO_DA_PATENTE]?.[0][
        Curriculum.REGISTRO_OU_PATENTE
      ]?.[0][Curriculum.ATRIBUTOS]?.[
        Curriculum.INSTITUICAO_DEPOSITO_REGISTRO
      ] || undefined;
    const depositantName =
      patent[Curriculum.DETALHAMENTO_DA_PATENTE]?.[0][
        Curriculum.REGISTRO_OU_PATENTE
      ]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.NOME_DO_DEPOSITANTE] ||
      undefined;

    const patentAuthors = patent[Curriculum.AUTORES] || undefined;
    let authors = '';

    for (let i = 0; i < patentAuthors.length; i++) {
      const quoteName =
        patentAuthors[i][Curriculum.ATRIBUTOS][Curriculum.NOME_PARA_CITACAO];
      if (i === patentAuthors.length - 1) {
        authors += `${quoteName}`;
      } else {
        authors += `${quoteName}; `;
      }
    }

    const patentDto: PatentDto = {
      title,
      developmentYear,
      country,
      situationStatus,
      category,
      patentType,
      registryCode,
      depositRegistrationInstitution,
      depositantName,
      authors,
      professor,
    };

    return patentDto;
  }

  getArtisticProductionData(artisticProduction: any, professor: Professor) {
    const title =
      artisticProduction[Curriculum.DADOS_BASICOS_DE_ARTES_VISUAIS]?.[0][
        Curriculum.ATRIBUTOS
      ]?.[Curriculum.TITULO] || undefined;

    const year =
      artisticProduction[Curriculum.DADOS_BASICOS_DE_ARTES_VISUAIS]?.[0][
        Curriculum.ATRIBUTOS
      ]?.[Curriculum.ANO] || undefined;

    const country =
      artisticProduction[Curriculum.DADOS_BASICOS_DE_ARTES_VISUAIS]?.[0][
        Curriculum.ATRIBUTOS
      ]?.[Curriculum.PAIS] || undefined;

    const language =
      artisticProduction[Curriculum.DADOS_BASICOS_DE_ARTES_VISUAIS]?.[0][
        Curriculum.ATRIBUTOS
      ]?.[Curriculum.IDIOMA] || undefined;

    const authorActivity =
      artisticProduction[Curriculum.DETALHAMENTO_DE_ARTES_VISUAIS]?.[0][
        Curriculum.ATRIBUTOS
      ]?.[Curriculum.ATIVIDADE_DOS_AUTORES] || undefined;

    const promotingInstitution =
      artisticProduction[Curriculum.DETALHAMENTO_DE_ARTES_VISUAIS]?.[0][
        Curriculum.ATRIBUTOS
      ]?.[Curriculum.INSTITUICAO_PROMOTORA_DO_EVENTO] || undefined;

    const bigArea =
      artisticProduction[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][
        Curriculum.AREA_DO_CONHECIMENTO_1
      ]?.[0][Curriculum.ATRIBUTOS]?.[
        Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO
      ] || undefined;

    const area =
      artisticProduction[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][
        Curriculum.AREA_DO_CONHECIMENTO_1
      ]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.NOME_DA_AREA_DO_CONHECIMENTO] ||
      undefined;

    const subArea =
      artisticProduction[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][
        Curriculum.AREA_DO_CONHECIMENTO_1
      ]?.[0][Curriculum.ATRIBUTOS]?.[
        Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO
      ] || undefined;

    const speciality =
      artisticProduction[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][
        Curriculum.AREA_DO_CONHECIMENTO_1
      ]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.NOME_DA_ESPECIALIDADE] ||
      undefined;

    const artisticProductionAuthors =
      artisticProduction[Curriculum.AUTORES] || undefined;
    let authors = '';

    for (let i = 0; i < artisticProductionAuthors.length; i++) {
      const quoteName =
        artisticProductionAuthors[i][Curriculum.ATRIBUTOS][
          Curriculum.NOME_PARA_CITACAO
        ];
      if (i === artisticProductionAuthors.length - 1) {
        authors += `${quoteName}`;
      } else {
        authors += `${quoteName}; `;
      }
    }

    const artisticProductionDto: ArtisticProductionDto = {
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
      authors,
      professor,
    };

    return artisticProductionDto;
  }

  async insertBooks(
    books: any,
    professor: Professor,
    queryRunner: QueryRunner,
  ) {
    if (!books) return;
    for (let i = 0; books[i] !== undefined; i++) {
      const bookData = books[i];
      const bookDto = this.getBookData(bookData, professor);

      let book = await this.bookService.findOne(bookDto, queryRunner);

      try {
        if (!book)
          book = await this.bookService.createBook(bookDto, queryRunner);
      } catch (error: any) {
        if (book) {
          await logErrorToDatabase(error, EntityType.BOOK, book.id.toString());
        } else {
          await logErrorToDatabase(error, EntityType.BOOK, undefined);
        }
        throw error;
      }
    }
  }

  async insertPatents(
    patents: any,
    professor: Professor,
    queryRunner: QueryRunner,
  ) {
    if (!patents) return;
    for (let i = 0; patents[i] !== undefined; i++) {
      const patentData = patents[i];
      const patentDto = this.getPatentData(patentData, professor);

      let patent = await this.patentService.findOne(patentDto, queryRunner);

      try {
        if (!patent)
          patent = await this.patentService.createPatent(
            patentDto,
            queryRunner,
          );
      } catch (error: any) {
        if (patent) {
          await logErrorToDatabase(
            error,
            EntityType.PATENT,
            patent.id.toString(),
          );
        } else {
          await logErrorToDatabase(error, EntityType.PATENT, undefined);
        }
        throw error;
      }
    }
  }

  async insertArtisticProductions(
    artisticProductions: any,
    professor: Professor,
    queryRunner: QueryRunner,
  ) {
    if (!artisticProductions) return;
    for (let i = 0; artisticProductions[i] !== undefined; i++) {
      const artisticProductionData = artisticProductions[i];

      const artisticProductionDto = this.getArtisticProductionData(
        artisticProductionData,
        professor,
      );

      let artisticProduction = await this.artisticProductionService.findOne(
        artisticProductionDto,
        queryRunner,
      );

      try {
        if (!artisticProduction)
          artisticProduction =
            await this.artisticProductionService.createArtisticProduction(
              artisticProductionDto,
              queryRunner,
            );
      } catch (error: any) {
        if (artisticProduction) {
          await logErrorToDatabase(
            error,
            EntityType.ARTISTIC_PRODUCTION,
            artisticProduction.id.toString(),
          );
        } else {
          await logErrorToDatabase(
            error,
            EntityType.ARTISTIC_PRODUCTION,
            undefined,
          );
        }
        throw error;
      }
    }
  }

  getConferencesFromXML(json: any) {
    if (
      json[Curriculum.CURRICULO_VITAE][Curriculum.PRODUCAO_BIBLIOGRAFICA][0][
        Curriculum.TRABALHOS_EM_EVENTOS
      ]
    ) {
      return json[Curriculum.CURRICULO_VITAE][
        Curriculum.PRODUCAO_BIBLIOGRAFICA
      ][0][Curriculum.TRABALHOS_EM_EVENTOS][0][Curriculum.TRABALHO_EM_EVENTOS];
    }
  }

  getConferenceData(conference: any, professor: Professor) {
    const bigArea =
      conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][
        Curriculum.AREA_DO_CONHECIMENTO_1
      ]?.[0][Curriculum.ATRIBUTOS]?.[
        Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO
      ] || undefined;

    const area =
      conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][
        Curriculum.AREA_DO_CONHECIMENTO_1
      ]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.NOME_DA_AREA_DO_CONHECIMENTO] ||
      undefined;

    const subArea =
      conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][
        Curriculum.AREA_DO_CONHECIMENTO_1
      ]?.[0][Curriculum.ATRIBUTOS]?.[
        Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO
      ] || undefined;

    const speciality =
      conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][
        Curriculum.AREA_DO_CONHECIMENTO_1
      ]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.NOME_DA_ESPECIALIDADE] ||
      undefined;

    const title =
      conference[Curriculum.DADOS_BASICOS_DO_TRABALHO][0][Curriculum.ATRIBUTOS][
        Curriculum.TITULO_DO_TRABALHO
      ];
    const year =
      conference[Curriculum.DADOS_BASICOS_DO_TRABALHO][0][Curriculum.ATRIBUTOS][
        Curriculum.ANO_DO_TRABALHO
      ];
    const event =
      conference[Curriculum.DETALHAMENTO_DO_TRABALHO][0][Curriculum.ATRIBUTOS][
        Curriculum.NOME_DO_EVENTO
      ];
    const proceedings =
      conference[Curriculum.DETALHAMENTO_DO_TRABALHO][0][Curriculum.ATRIBUTOS][
        Curriculum.TITULO_DOS_ANAIS_OU_PROCEEDINGS
      ];

    const doi =
      conference[Curriculum.DADOS_BASICOS_DO_TRABALHO][0][Curriculum.ATRIBUTOS][
        Curriculum.DOI
      ];

    const curriculumAuthors = conference[Curriculum.AUTORES] || undefined;
    let authors = '';

    for (let i = 0; i < curriculumAuthors.length; i++) {
      const quoteName =
        curriculumAuthors[i][Curriculum.ATRIBUTOS][
          Curriculum.NOME_PARA_CITACAO
        ];
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
      authors,
      bigArea,
      area,
      subArea,
      speciality,
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
        let conference = await this.conferencePublicationsService.getConference(
          conferenceDto,
          queryRunner,
        );
        if (!conference)
          conference =
            await this.conferencePublicationsService.createConference(
              conferenceDto,
              queryRunner,
            );

        this.conferencePublicationsService.getConferenceAndQualis(
          conference,
          conferences,
          queryRunner,
        );
      }
    } catch (error) {
      await logErrorToDatabase(error, EntityType.CONFERENCE, undefined);
      throw error;
    }
  }

  getAdviseesFromXML(json: any) {
    if (
      json[Curriculum.CURRICULO_VITAE][Curriculum.DADOS_COMPLEMENTARES][0][
        Curriculum.ORIENTACOES_EM_ANDAMENTO
      ]
    )
      return json[Curriculum.CURRICULO_VITAE][
        Curriculum.DADOS_COMPLEMENTARES
      ][0][Curriculum.ORIENTACOES_EM_ANDAMENTO][0];
  }

  getAdviseeData(advisee: any, professor: Professor, degree: string) {
    let basicData;
    let details;
    if (degree === Curriculum.MESTRADO) {
      basicData =
        Curriculum.DADOS_BASICOS_DA_ORIENTACAO_EM_ANDAMENTO_DE_MESTRADO;
      details = Curriculum.DETALHAMENTO_DA_ORIENTACAO_EM_ANDAMENTO_DE_MESTRADO;
    } else if (degree === Curriculum.DOUTORADO) {
      basicData =
        Curriculum.DADOS_BASICOS_DA_ORIENTACAO_EM_ANDAMENTO_DE_DOUTORADO;
      details = Curriculum.DETALHAMENTO_DA_ORIENTACAO_EM_ANDAMENTO_DE_DOUTORADO;
    } else if (degree === Curriculum.POS_DOUTORADO) {
      basicData =
        Curriculum.DADOS_BASICOS_DA_ORIENTACAO_EM_ANDAMENTO_DE_POS_DOUTORADO;
      details =
        Curriculum.DETALHAMENTO_DA_ORIENTACAO_EM_ANDAMENTO_DE_POS_DOUTORADO;
    } else {
      basicData =
        Curriculum.DADOS_BASICOS_DA_ORIENTACAO_EM_ANDAMENTO_DE_INICIACAO_CIENTIFICA;
      details =
        Curriculum.DETALHAMENTO_DA_ORIENTACAO_EM_ANDAMENTO_DE_INICIACAO_CIENTIFICA;
    }

    if (!basicData || !details) return;

    const yearStart =
      advisee[basicData][0][Curriculum.ATRIBUTOS][Curriculum.ANO];
    const name =
      advisee[details][0][Curriculum.ATRIBUTOS][Curriculum.NOME_DO_ORIENTANDO];
    const type =
      advisee[details][0][Curriculum.ATRIBUTOS][Curriculum.TIPO_DE_ORIENTACAO];
    let scholarship =
      advisee[details][0][Curriculum.ATRIBUTOS][Curriculum.FLAG_BOLSA];
    const financierCode =
      advisee[details][0][Curriculum.ATRIBUTOS][
        Curriculum.CODIGO_AGENCIA_FINANCIADORA
      ];
    const institution =
      advisee[details][0][Curriculum.ATRIBUTOS][Curriculum.NOME_INSTITUICAO];
    const title =
      advisee[basicData][0][Curriculum.ATRIBUTOS][
        Curriculum.TITULO_DO_TRABALHO
      ];
    const course =
      advisee[details][0][Curriculum.ATRIBUTOS][Curriculum.NOME_CURSO];

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

  async insertAdvisees(
    advisees: any,
    professor: Professor,
    queryRunner: QueryRunner,
  ) {
    if (!advisees) return;
    try {
      if (
        advisees &&
        advisees[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_MESTRADO]
      ) {
        for (
          let i = 0;
          advisees[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_MESTRADO][i] !==
          undefined;
          i++
        ) {
          const adviseeData =
            advisees[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_MESTRADO][i];
          const adviseeDto = this.getAdviseeData(
            adviseeData,
            professor,
            Curriculum.MESTRADO,
          );

          if (adviseeDto) {
            const advisee = await this.adviseeService.getAdvisee(
              adviseeDto,
              queryRunner,
            );
            if (!advisee)
              await this.adviseeService.createAdvisee(
                adviseeDto,
                Curriculum.MESTRADO,
                queryRunner,
              );
          }
        }
      }

      if (
        advisees &&
        advisees[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_DOUTORADO]
      ) {
        for (
          let i = 0;
          advisees[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_DOUTORADO][i] !==
          undefined;
          i++
        ) {
          const adviseeData =
            advisees[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_DOUTORADO][i];
          const adviseeDto = this.getAdviseeData(
            adviseeData,
            professor,
            Curriculum.DOUTORADO,
          );
          if (adviseeDto) {
            let advisee = await this.adviseeService.getAdvisee(
              adviseeDto,
              queryRunner,
            );
            if (!advisee)
              advisee = await this.adviseeService.createAdvisee(
                adviseeDto,
                Curriculum.DOUTORADO,
                queryRunner,
              );
          }
        }
      }
      if (
        advisees &&
        advisees[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_POS_DOUTORADO]
      ) {
        for (
          let i = 0;
          advisees[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_POS_DOUTORADO][i] !==
          undefined;
          i++
        ) {
          const adviseeData =
            advisees[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_POS_DOUTORADO][i];
          const adviseeDto = this.getAdviseeData(
            adviseeData,
            professor,
            Curriculum.POS_DOUTORADO,
          );
          if (adviseeDto) {
            let advisee = await this.adviseeService.getAdvisee(
              adviseeDto,
              queryRunner,
            );
            if (!advisee)
              advisee = await this.adviseeService.createAdvisee(
                adviseeDto,
                Curriculum.POS_DOUTORADO,
                queryRunner,
              );
          }
        }
      }
      if (
        advisees &&
        advisees[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_INICIACAO_CIENTIFICA]
      ) {
        for (
          let i = 0;
          advisees[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_INICIACAO_CIENTIFICA][
            i
          ] !== undefined;
          i++
        ) {
          const adviseeData =
            advisees[
              Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_INICIACAO_CIENTIFICA
            ][i];
          const adviseeDto = this.getAdviseeData(
            adviseeData,
            professor,
            Curriculum.INICIACAO_CIENTIFICA,
          );
          if (adviseeDto) {
            let advisee = await this.adviseeService.getAdvisee(
              adviseeDto,
              queryRunner,
            );
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
      await logErrorToDatabase(error, EntityType.ADVISEE, undefined);
      throw error;
    }
  }

  getConcludedAdviseesFromXML(json: any) {
    if (
      json[Curriculum.CURRICULO_VITAE][Curriculum.OUTRA_PRODUCAO][0][
        Curriculum.ORIENTACOES_CONCLUIDAS
      ]
    ) {
      return json[Curriculum.CURRICULO_VITAE][Curriculum.OUTRA_PRODUCAO][0][
        Curriculum.ORIENTACOES_CONCLUIDAS
      ][0];
    }
  }

  getConcludedAdviseesData(
    concludedAdvisee: any,
    professor: Professor,
    degree: string,
  ) {
    let basicData =
      Curriculum.DADOS_BASICOS_DE_ORIENTACOES_CONCLUIDAS_PARA_MESTRADO;
    let details =
      Curriculum.DETALHAMENTO_DE_ORIENTACOES_CONCLUIDAS_PARA_MESTRADO;

    if (degree === Curriculum.DOUTORADO) {
      basicData =
        Curriculum.DADOS_BASICOS_DE_ORIENTACOES_CONCLUIDAS_PARA_DOUTORADO;
      details =
        Curriculum.DETALHAMENTO_DE_ORIENTACOES_CONCLUIDAS_PARA_DOUTORADO;
    }

    if (degree === Curriculum.POS_DOUTORADO) {
      basicData =
        Curriculum.DADOS_BASICOS_DE_ORIENTACOES_CONCLUIDAS_PARA_POS_DOUTORADO;
      details =
        Curriculum.DETALHAMENTO_DE_ORIENTACOES_CONCLUIDAS_PARA_POS_DOUTORADO;
    }

    if (degree === Curriculum.INICIACAO_CIENTIFICA) {
      basicData = Curriculum.DADOS_BASICOS_DE_OUTRAS_ORIENTACOES_CONCLUIDAS;
      details = Curriculum.DETALHAMENTO_DE_OUTRAS_ORIENTACOES_CONCLUIDAS;
    }

    const yearEnd =
      concludedAdvisee[basicData][0][Curriculum.ATRIBUTOS][Curriculum.ANO];
    const name =
      concludedAdvisee[details][0][Curriculum.ATRIBUTOS][
        Curriculum.NOME_DO_ORIENTADO
      ];
    let type =
      concludedAdvisee[details][0][Curriculum.ATRIBUTOS][
        Curriculum.TIPO_DE_ORIENTACAO
      ];
    if (degree === Curriculum.INICIACAO_CIENTIFICA) {
      type =
        concludedAdvisee[details][0][Curriculum.ATRIBUTOS][
          Curriculum.TIPO_DE_ORIENTACAO_CONCLUIDA
        ];
    }
    let scholarship =
      concludedAdvisee[details][0][Curriculum.ATRIBUTOS][Curriculum.FLAG_BOLSA];
    const financierCode =
      concludedAdvisee[details][0][Curriculum.ATRIBUTOS][
        Curriculum.CODIGO_AGENCIA_FINANCIADORA
      ];
    const institution =
      concludedAdvisee[details][0][Curriculum.ATRIBUTOS][
        Curriculum.NOME_INSTITUICAO_ORIENTACOES_CONCLUIDAS
      ];
    const title =
      concludedAdvisee[basicData][0][Curriculum.ATRIBUTOS][Curriculum.TITULO];
    const course =
      concludedAdvisee[details][0][Curriculum.ATRIBUTOS][
        Curriculum.NOME_CURSO_ORIENTACOES_CONCLUIDAS
      ];

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

  async insertConcludedAdvisees(
    concludedAdvisees: any,
    professor: Professor,
    queryRunner: QueryRunner,
  ) {
    if (!concludedAdvisees) return;
    try {
      if (concludedAdvisees[Curriculum.ORIENTACOES_CONCLUIDAS_PARA_MESTRADO]) {
        for (
          let i = 0;
          concludedAdvisees[Curriculum.ORIENTACOES_CONCLUIDAS_PARA_MESTRADO][
            i
          ] !== undefined;
          i++
        ) {
          const adviseeData =
            concludedAdvisees[Curriculum.ORIENTACOES_CONCLUIDAS_PARA_MESTRADO][
              i
            ];
          const adviseeDto = this.getConcludedAdviseesData(
            adviseeData,
            professor,
            Curriculum.MESTRADO,
          );
          if (adviseeDto) {
            const advisee = await this.adviseeService.getAdvisee(
              adviseeDto,
              queryRunner,
            );
            if (!advisee)
              await this.adviseeService.createAdvisee(
                adviseeDto,
                Curriculum.MESTRADO,
                queryRunner,
              );
          }
        }
      }

      if (concludedAdvisees[Curriculum.ORIENTACOES_CONCLUIDAS_PARA_DOUTORADO]) {
        for (
          let i = 0;
          concludedAdvisees[Curriculum.ORIENTACOES_CONCLUIDAS_PARA_DOUTORADO][
            i
          ] !== undefined;
          i++
        ) {
          const adviseeData =
            concludedAdvisees[Curriculum.ORIENTACOES_CONCLUIDAS_PARA_DOUTORADO][
              i
            ];
          const adviseeDto = this.getConcludedAdviseesData(
            adviseeData,
            professor,
            Curriculum.DOUTORADO,
          );
          if (adviseeDto) {
            let advisee = await this.adviseeService.getAdvisee(
              adviseeDto,
              queryRunner,
            );
            if (!advisee)
              advisee = await this.adviseeService.createAdvisee(
                adviseeDto,
                Curriculum.DOUTORADO,
                queryRunner,
              );
          }
        }
      }

      if (
        concludedAdvisees[Curriculum.ORIENTACOES_CONCLUIDAS_PARA_POS_DOUTORADO]
      ) {
        for (
          let i = 0;
          concludedAdvisees[
            Curriculum.ORIENTACOES_CONCLUIDAS_PARA_POS_DOUTORADO
          ][i] !== undefined;
          i++
        ) {
          const adviseeData =
            concludedAdvisees[
              Curriculum.ORIENTACOES_CONCLUIDAS_PARA_POS_DOUTORADO
            ][i];
          const adviseeDto = this.getConcludedAdviseesData(
            adviseeData,
            professor,
            Curriculum.POS_DOUTORADO,
          );
          if (adviseeDto) {
            let advisee = await this.adviseeService.getAdvisee(
              adviseeDto,
              queryRunner,
            );
            if (!advisee)
              advisee = await this.adviseeService.createAdvisee(
                adviseeDto,
                Curriculum.POS_DOUTORADO,
                queryRunner,
              );
          }
        }
      }

      if (concludedAdvisees[Curriculum.OUTRAS_ORIENTACOES_CONCLUIDAS]) {
        for (
          let i = 0;
          concludedAdvisees[Curriculum.OUTRAS_ORIENTACOES_CONCLUIDAS][i] !==
          undefined;
          i++
        ) {
          const adviseeType =
            concludedAdvisees[Curriculum.OUTRAS_ORIENTACOES_CONCLUIDAS][i][
              Curriculum.DADOS_BASICOS_DE_OUTRAS_ORIENTACOES_CONCLUIDAS
            ][0][Curriculum.ATRIBUTOS][Curriculum.NATUREZA];
          if (adviseeType === Curriculum.INICIACAO_CIENTIFICA) {
            const adviseeData =
              concludedAdvisees[Curriculum.OUTRAS_ORIENTACOES_CONCLUIDAS][i];
            const adviseeDto = this.getConcludedAdviseesData(
              adviseeData,
              professor,
              Curriculum.INICIACAO_CIENTIFICA,
            );
            if (adviseeDto) {
              let advisee = await this.adviseeService.getAdvisee(
                adviseeDto,
                queryRunner,
              );
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
      await logErrorToDatabase(error, EntityType.CONCLUDED_ADVISEE, undefined);
      throw error;
    }
  }

  getFinancierFromXML(json: any) {
    if (json) {
      const financiersDto: FinancierDto[] = [];
      for (
        let i = 0;
        json[0][Curriculum.FINANCIADOR_DO_PROJETO][i] !== undefined;
        i++
      ) {
        const financierJson =
          json[0][Curriculum.FINANCIADOR_DO_PROJETO][i][Curriculum.ATRIBUTOS];
        const name = financierJson[Curriculum.NOME_INSTITUICAO];
        const code = financierJson[Curriculum.CODIGO_INSTITUICAO];
        const nature = financierJson[Curriculum.NATUREZA];
        financiersDto.push({ name, code, nature });
      }
      return financiersDto;
    }
  }

  getFinancierData(financierData: any) {
    const name =
      financierData[Curriculum.ATRIBUTOS][Curriculum.NOME_INSTITUICAO];
    const code =
      financierData[Curriculum.ATRIBUTOS][Curriculum.CODIGO_INSTITUICAO];
    const nature = financierData[Curriculum.ATRIBUTOS][Curriculum.NATUREZA];
    const financierDto: FinancierDto = {
      name,
      code,
      nature,
    };
    return financierDto;
  }

  async insertFinancier(
    financiersDto: FinancierDto[],
    queryRunner: QueryRunner,
  ) {
    const financiersList: Financier[] = [];
    for (let i = 0; i < financiersDto.length; i++) {
      const financierDto = financiersDto[i];
      let financier = await this.financierService.getFinancier(
        financierDto,
        queryRunner,
      );
      if (!financier)
        financier = await this.financierService.createFinancier(
          financierDto,
          queryRunner,
        );
      return financiersList.push(financier);
    }
  }

  getResearchProjectFinancier(researchProject: any) {
    if (researchProject[Curriculum.PROJETO_DE_PESQUISA])
      return researchProject[Curriculum.PROJETO_DE_PESQUISA][0][
        Curriculum.FINANCIADORES_DO_PROJETO
      ];
  }

  getProjectsFromXML(json: any) {
    if (
      json[Curriculum.CURRICULO_VITAE][Curriculum.DADOS_GERAIS][0][
        Curriculum.ATUACOES_PROFISSIONAIS
      ]
    ) {
      return json[Curriculum.CURRICULO_VITAE][Curriculum.DADOS_GERAIS][0][
        Curriculum.ATUACOES_PROFISSIONAIS
      ][0][Curriculum.ATUACAO_PROFISSIONAL];
    }
  }

  getProjectData(researchProject: any, professor: Professor) {
    if (
      researchProject[Curriculum.PROJETO_DE_PESQUISA] &&
      researchProject[Curriculum.PROJETO_DE_PESQUISA][0][Curriculum.ATRIBUTOS][
        Curriculum.ANO_INICIO
      ] &&
      researchProject[Curriculum.PROJETO_DE_PESQUISA][0][Curriculum.ATRIBUTOS][
        Curriculum.ANO_INICIO
      ] !== ''
    ) {
      const yearStart =
        researchProject[Curriculum.PROJETO_DE_PESQUISA][0][
          Curriculum.ATRIBUTOS
        ][Curriculum.ANO_INICIO];
      const name =
        researchProject[Curriculum.PROJETO_DE_PESQUISA][0][
          Curriculum.ATRIBUTOS
        ][Curriculum.NOME_DO_PROJETO];

      const periodFlag =
        researchProject[Curriculum.ATRIBUTOS][Curriculum.FLAG_PERIODO];

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

  getResearchProjects(project: any) {
    return project[Curriculum.ATIVIDADES_DE_PARTICIPACAO_EM_PROJETO][0][
      Curriculum.PARTICIPACAO_EM_PROJETO
    ];
  }

  async insertProjects(
    projects: any,
    professor: Professor,
    queryRunner: QueryRunner,
  ) {
    if (!projects) return;
    try {
      if (projects)
        for (let i = 0; i < projects.length; i++) {
          if (projects[i][Curriculum.ATIVIDADES_DE_PARTICIPACAO_EM_PROJETO]) {
            const researchProjects = this.getResearchProjects(projects[i]);
            for (let j = 0; researchProjects[j] !== undefined; j++) {
              const researchProject = researchProjects[j];
              let project;
              const projectDto = this.getProjectData(
                researchProject,
                professor,
              );
              if (projectDto)
                project = await this.projectService.getProject(
                  projectDto,
                  queryRunner,
                );
              if (!project && projectDto)
                project = await this.projectService.createProject(
                  projectDto,
                  queryRunner,
                );
              const financiers =
                this.getResearchProjectFinancier(researchProject);
              const financiersDto = this.getFinancierFromXML(financiers);
              if (financiersDto) {
                for (let k = 0; k < financiersDto.length; k++) {
                  const financierDto = financiersDto[k];
                  let financier = await this.financierService.getFinancier(
                    financierDto,
                    queryRunner,
                  );
                  if (!financier) {
                    financier = await this.financierService.createFinancier(
                      financierDto,
                      queryRunner,
                    );
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
      await logErrorToDatabase(error, EntityType.PROJECT, undefined);
      throw error;
    }
  }

  async unzipFile(file: Express.Multer.File) {
    try {
      const zipPath = file.path;
      await extract(zipPath, {
        dir: this.XML_PATH,
      });
      await rename(
        this.XML_PATH + '/' + 'curriculo.xml',
        this.XML_PATH + '/' + file.originalname.split('.')[0] + '.xml',
      );
      unlink(zipPath);
      file.path =
        this.XML_PATH + '/' + file.originalname.split('.')[0] + '.xml';
    } catch (err) {
      await logErrorToDatabase(err, EntityType.UNZIP, undefined);
    }
  }

  async deleteFiles() {
    if (process.env.XML_PATH) {
      const files = await readdir(process.env.XML_PATH);
      for (let i = 0; i < files.length; i++) {
        await unlink(process.env.XML_PATH + '/' + files[i]);
      }
    }
  }

  createImportLog(
    file: Express.Multer.File,
    username: string,
    professorName: string,
  ) {
    const importXml = new Log();
    importXml.entityType = EntityType.IMPORT;
    importXml.executionContextHost = '';
    importXml.message = `Original name: ${file.originalname}
      File name: ${file.filename}
      Username: ${username}
      Professor name: ${professorName}
      Result: `;

    return importXml;
  }

  async save(importXmlLog: Log) {
    return await AppDataSource.createQueryBuilder()
      .insert()
      .into(Log)
      .values(importXmlLog)
      .execute();
  }

  async enqueueFiles(files: Array<Express.Multer.File>, username: string) {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      for (let i = 0; i < files.length; i++) {
        await queryRunner.startTransaction();
        const importXml = new ImportXml();
        importXml.id = files[i].filename;
        importXml.name = files[i].originalname;
        importXml.user = username;
        importXml.status = Status.PENDING;
        importXml.startedAt = undefined;
        importXml.finishedAt = undefined;
        await AppDataSource.createQueryBuilder(queryRunner)
          .insert()
          .into(ImportXml)
          .values(importXml)
          .execute();
        await queryRunner.commitTransaction();
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    this.insertDataToDatabase(files, username).catch((err) => {
      logErrorToDatabase(err, EntityType.XML, undefined);
    });
  }

  async insertDataToDatabase(
    files: Array<Express.Multer.File>,
    username: string,
  ) {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      // os artigos top
      const journals = await this.journalService.findAll(queryRunner);

      // as conferencias top
      const conferences = await this.conferenceService.findAll(queryRunner);

      // leitura dos arquivos xml dos professores
      for (let i = 0; i < files.length; i++) {
        await queryRunner.startTransaction();
        try {
          this.updateXMLStatus(
            files[i].filename,
            undefined,
            Status.LOADING,
            undefined,
          );
          let importXmlLog = this.createImportLog(
            files[i],
            username,
            'undefined',
          );
          let professorDto: CreateProfessorDto | undefined = undefined;
          try {
            const json = await this.parseXMLDocument(files[i]);

            // se o professor não existir, criamos, se existir podemos usá-lo
            professorDto = this.getProfessorData(json);

            const filePath =
              this.XML_PATH + '/' + professorDto.identifier + '.xml';
            // renomear com o lattes do professor
            try {
              // checar se o arquivo existe
              fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                  console.error('File does not exist or cannot be accessed.');
                } else {
                  // Check if the file is writable
                  fs.access(filePath, fs.constants.W_OK, (err) => {
                    if (err) {
                      console.error(
                        'File is not writable. Check file permissions.',
                      );
                    } else {
                      // File is writable, proceed with rename
                      fs.rename(
                        files[i].path,
                        this.XML_PATH + '/' + professorDto?.identifier + '.xml',
                        (err) => {
                          if (err) {
                            console.error(
                              'Error occurred during file renaming:',
                              err,
                            );
                          } else {
                            console.log('File renamed successfully.');
                          }
                        },
                      );
                    }
                  });
                }
              });
            } catch (error) {
              console.error('Error occurred:', error);
            }

            const filename = professorDto.identifier + '.xml';

            this.updateXMLStatus(
              files[i].filename,
              filename,
              Status.PROGRESS,
              professorDto.name,
            );
            const professor = await this.insertProfessor(
              professorDto,
              queryRunner,
            );

            importXmlLog = this.createImportLog(
              files[i],
              username,
              professor.name,
            );

            // artigos publicados do professor
            const articles = this.getArticlesFromXML(json);

            await this.insertArticles(
              articles,
              professor,
              journals,
              queryRunner,
            );

            const books = this.getBooksFromXML(json);

            await this.insertBooks(books, professor, queryRunner);

            const patents = this.getPatentsFromXML(json);

            await this.insertPatents(patents, professor, queryRunner);

            const artisticProductions =
              this.getArtisticProductionsFromXML(json);

            await this.insertArtisticProductions(
              artisticProductions,
              professor,
              queryRunner,
            );

            // trabalhos em eventos do professor
            const conferencePublications = this.getConferencesFromXML(json);

            await this.insertConferences(
              conferencePublications,
              professor,
              conferences,
              queryRunner,
            );

            // orientandos do professor
            const advisees = this.getAdviseesFromXML(json);
            await this.insertAdvisees(advisees, professor, queryRunner);

            // orientações concluidas do professor
            const concludedAdvisees = this.getConcludedAdviseesFromXML(json);
            await this.insertConcludedAdvisees(
              concludedAdvisees,
              professor,
              queryRunner,
            );

            // projetos de pesquisa por professor
            const projects = this.getProjectsFromXML(json);
            await this.insertProjects(projects, professor, queryRunner);
            importXmlLog.message += 'SUCCESS';
            this.updateXMLStatus(
              files[i].filename,
              filename,
              Status.CONCLUDED,
              professorDto.name,
            );
          } catch (err) {
            importXmlLog.message += 'FAILED';
            this.updateXMLStatus(
              files[i].filename,
              undefined,
              Status.NOT_IMPORTED,
              professorDto?.name,
            );
            throw err;
          } finally {
            await this.save(importXmlLog);
          }
          await queryRunner.commitTransaction();
        } catch (err) {
          await queryRunner.rollbackTransaction();
          await logErrorToDatabase(err, EntityType.XML, files[i].filename);
        }
      }
    } finally {
      await queryRunner.release();
    }
  }
}

import { Injectable } from '@nestjs/common';
import { readdir, unlink, rename } from 'fs/promises';
import { AppDataSource } from 'src/app.datasource';
import { Curriculum } from 'src/import-xml/curriculum.enum';
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
import * as fs from 'fs';
import { extname } from 'path';
import extract from 'extract-zip';

@Injectable()
export class ImportJsonService {

    path = require('path');

    JSON_PATH = process.env.JSON_PATH ?? 'downloadedfiles';

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

    async unzipFile(file: Express.Multer.File){
      try{
        const zipPath = file.path;
        await extract(zipPath, {
            dir: this.JSON_PATH,
          });
        const extractedJsonPath = this.JSON_PATH + '/curriculo.json';
        const newName = this.JSON_PATH + '/' + file.originalname.split('.')[0] + '.json';
        await rename(extractedJsonPath, newName);

        await unlink(zipPath); 
        file.path = newName; 
      }catch(err){
        await logErrorToDatabase(err, EntityType.UNZIP)
      }
    }

    async splitJsonData(filePath: string){
      const raw = await fs.promises.readFile(filePath, 'utf-8');
      const professors = JSON.parse(raw);

      for (const professor of professors) {
        const json = professor;
        const id = json[Curriculum.NUMERO_IDENTIFICADOR];
        const filename = `${this.JSON_PATH}/${id}.json`;
        await fs.promises.writeFile(filename, JSON.stringify(json, null, 2));
      }
      
      unlink(filePath);
    }

    async processImportJson(file: Express.Multer.File){
      if(extname(file.originalname) === '.zip'){
        await this.unzipFile(file);
      }
      await this.splitJsonData(file.path);
      await this.insertDataToDatabase();
    }

    async deleteFiles() {
        if (this.JSON_PATH) {
            const files = await readdir(this.JSON_PATH);
            for (const file of files) {
                await unlink(this.JSON_PATH + '/' + file);
            }
        }
    }

    getProfessorData(json: any) {
        const identifier = json[Curriculum.CURRICULO_VITAE][Curriculum.ATRIBUTOS][Curriculum.NUMERO_IDENTIFICADOR];
        const name =
            json[Curriculum.CURRICULO_VITAE][Curriculum.DADOS_GERAIS][0][Curriculum.ATRIBUTOS][Curriculum.NOME_COMPLETO];

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
        if (json[Curriculum.CURRICULO_VITAE][Curriculum.PRODUCAO_BIBLIOGRAFICA][0][Curriculum.ARTIGOS_PUBLICADOS]) {
            return json[Curriculum.CURRICULO_VITAE][Curriculum.PRODUCAO_BIBLIOGRAFICA][0][Curriculum.ARTIGOS_PUBLICADOS][0][
                Curriculum.ARTIGO_PUBLICADO
            ];
        }
    }

    getArticleData(article: any, professor: Professor) {
        const bigArea =
          article[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO
          ] ?? undefined;
    
        const area =
          article[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_DA_AREA_DO_CONHECIMENTO
          ] ?? undefined;
    
        const subArea =
          article[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO
          ] ?? undefined;
    
        const speciality =
          article[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_DA_ESPECIALIDADE
          ] ?? undefined;
    
        const bigArea2 =
          article[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_2]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO
          ] ?? undefined;
    
        const area2 =
          article[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_2]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_DA_AREA_DO_CONHECIMENTO
          ] ?? undefined;
    
        const subArea2 =
          article[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_2]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO
          ] ?? undefined;
    
        const speciality2 =
          article[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_2]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_DA_ESPECIALIDADE
          ] ?? undefined;
    
        const title = article[Curriculum.DADOS_BASICOS_DO_ARTIGO][0][Curriculum.ATRIBUTOS][Curriculum.TITULO_DO_ARTIGO];
        const doi = article[Curriculum.DADOS_BASICOS_DO_ARTIGO][0][Curriculum.ATRIBUTOS][Curriculum.DOI];
        const year = article[Curriculum.DADOS_BASICOS_DO_ARTIGO][0][Curriculum.ATRIBUTOS][Curriculum.ANO_DO_ARTIGO];
        const issn = article[Curriculum.DETALHAMENTO_DO_ARTIGO][0][Curriculum.ATRIBUTOS][Curriculum.ISSN];
    
        const journalTitle =
          article[Curriculum.DETALHAMENTO_DO_ARTIGO][0][Curriculum.ATRIBUTOS][Curriculum.TITULO_DO_PERIODICO_OU_REVISTA];
    
        const curriculumAuthors = article[Curriculum.AUTORES] ?? undefined;
        let authors = '';
    
        for (let i = 0; curriculumAuthors !== undefined && i < curriculumAuthors.length; i++) {
          const quoteName = curriculumAuthors[i][Curriculum.ATRIBUTOS][Curriculum.NOME_PARA_CITACAO];
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
          authors: authors ?? undefined,
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
        if (
            json[Curriculum.CURRICULO_VITAE][Curriculum.PRODUCAO_BIBLIOGRAFICA][0][Curriculum.LIVROS_E_CAPITULOS]?.[0][
                Curriculum.LIVROS_PUBLICADOS_OU_ORGANIZADOS]
        ) {
        return json[Curriculum.CURRICULO_VITAE][Curriculum.PRODUCAO_BIBLIOGRAFICA][0][Curriculum.LIVROS_E_CAPITULOS][0][
            Curriculum.LIVROS_PUBLICADOS_OU_ORGANIZADOS
        ][0][Curriculum.LIVRO_PUBLICADO_OU_ORGANIZADO];
        }
    }

    getBookData(book: any, professor: Professor) {
        const bigArea =
          book[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO
          ] ?? undefined;
    
        const area =
          book[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_DA_AREA_DO_CONHECIMENTO
          ] ?? undefined;
    
        const subArea =
          book[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO
          ] ?? undefined;
    
        const speciality =
          book[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_DA_ESPECIALIDADE
          ] ?? undefined;
    
        const bigArea2 =
          book[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_2]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO
          ] ?? undefined;
    
        const area2 =
          book[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_2]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_DA_AREA_DO_CONHECIMENTO
          ] ?? undefined;
    
        const subArea2 =
          book[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_2]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO
          ] ?? undefined;
    
        const speciality2 =
          book[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_2]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_DA_ESPECIALIDADE
          ] ?? undefined;
    
        const title =
          book[Curriculum.DADOS_BASICOS_DO_LIVRO]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.TITULO_DO_LIVRO] ?? undefined;
    
        const language =
          book[Curriculum.DADOS_BASICOS_DO_LIVRO]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.IDIOMA] ?? undefined;
    
        const year = book[Curriculum.DADOS_BASICOS_DO_LIVRO]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.ANO] ?? undefined;
    
        const publicationCountry =
          book[Curriculum.DADOS_BASICOS_DO_LIVRO]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.PAIS_DE_PUBLICACAO] ?? undefined;
    
        const bookAuthors = book[Curriculum.AUTORES] ?? undefined;
        let authors = '';
    
        for (let i = 0; bookAuthors !== undefined && i < bookAuthors.length; i++) {
          const quoteName = bookAuthors[i][Curriculum.ATRIBUTOS][Curriculum.NOME_PARA_CITACAO];
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
          authors: authors ?? undefined,
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
        if (
            json[Curriculum.CURRICULO_VITAE][Curriculum.PRODUCAO_BIBLIOGRAFICA][0][
                'DEMAIS-TIPOS-DE-PRODUCAO-BIBLIOGRAFICA'
            ]?.[0]['TRADUCAO']
            ) {
            return json[Curriculum.CURRICULO_VITAE][Curriculum.PRODUCAO_BIBLIOGRAFICA][0][
                'DEMAIS-TIPOS-DE-PRODUCAO-BIBLIOGRAFICA'
            ][0]['TRADUCAO'];
        }
    }

    getTranslationData(translation: any, professor: Professor) {
        const bigArea =
          translation[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][
            Curriculum.ATRIBUTOS
          ]?.[Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO] ?? undefined;
    
        const area =
          translation[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][
            Curriculum.ATRIBUTOS
          ]?.[Curriculum.NOME_DA_AREA_DO_CONHECIMENTO] ?? undefined;
    
        const subArea =
          translation[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][
            Curriculum.ATRIBUTOS
          ]?.[Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO] ?? undefined;
    
        const speciality =
          translation[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][
            Curriculum.ATRIBUTOS
          ]?.[Curriculum.NOME_DA_ESPECIALIDADE] ?? undefined;
    
        const title = translation['DADOS-BASICOS-DA-TRADUCAO']?.[0][Curriculum.ATRIBUTOS]?.['TITULO'] ?? undefined;
    
        const originalTitle =
          translation['DETALHAMENTO-DA-TRADUCAO']?.[0][Curriculum.ATRIBUTOS]?.['TITULO-DA-OBRA-ORIGINAL'] ?? undefined;
    
        const language =
          translation['DADOS-BASICOS-DA-TRADUCAO']?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.IDIOMA] ?? undefined;
    
        const originalLanguage =
          translation['DETALHAMENTO-DA-TRADUCAO']?.[0][Curriculum.ATRIBUTOS]?.['IDIOMA-DA-OBRA-ORIGINAL'] ?? undefined;
    
        const year = translation['DADOS-BASICOS-DA-TRADUCAO']?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.ANO] ?? undefined;
    
        const originalAuthor =
          translation['DETALHAMENTO-DA-TRADUCAO']?.[0][Curriculum.ATRIBUTOS]?.['NOME-DO-AUTOR-TRADUZIDO'] ?? undefined;
    
        const publicationCountry =
          translation['DADOS-BASICOS-DA-TRADUCAO']?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.PAIS_DE_PUBLICACAO] ?? undefined;
    
        const originalPublicationCity =
          translation['DETALHAMENTO-DA-TRADUCAO']?.[0][Curriculum.ATRIBUTOS]?.['CIDADE-DA-EDITORA'] ?? undefined;
    
        const issn = translation['DETALHAMENTO-DA-TRADUCAO']?.[0][Curriculum.ATRIBUTOS]?.['ISSN-ISBN'] ?? undefined;
    
        const translationAuthors = translation[Curriculum.AUTORES] ?? undefined;
        let authors = '';
    
        for (let i = 0; translationAuthors !== undefined && i < translationAuthors.length; i++) {
          const quoteName = translationAuthors[i][Curriculum.ATRIBUTOS][Curriculum.NOME_PARA_CITACAO];
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
          authors: authors ?? undefined,
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
        if (
            json[Curriculum.CURRICULO_VITAE][Curriculum.PRODUCAO_TECNICA]?.[0][Curriculum.PATENTE]
        ) {
            return json[Curriculum.CURRICULO_VITAE][Curriculum.PRODUCAO_TECNICA][0][Curriculum.PATENTE];
        }
    }

    getPatentData(patent: any, professor: Professor) {
        const title =
          patent[Curriculum.DADOS_BASICOS_DA_PATENTE]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.TITULO] ?? undefined;
    
        const developmentYear =
          patent[Curriculum.DADOS_BASICOS_DA_PATENTE]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.ANO_DESENVOLVIMENTO] ??
          undefined;
    
        const country =
          patent[Curriculum.DADOS_BASICOS_DA_PATENTE]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.PAIS] ?? undefined;
    
        const situationStatus =
          patent[Curriculum.DETALHAMENTO_DA_PATENTE]?.[0][Curriculum.HISTORICO_SITUACOES_PATENTE]?.[0][
            Curriculum.ATRIBUTOS
          ]?.[Curriculum.DESCRICAO_SITUACAO_PATENTE] ?? undefined;
    
        const category =
          patent[Curriculum.DETALHAMENTO_DA_PATENTE]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.CATEGORIA] ?? undefined;
    
        const patentType =
          patent[Curriculum.DETALHAMENTO_DA_PATENTE]?.[0][Curriculum.REGISTRO_OU_PATENTE]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.TIPO_PATENTE
          ] ?? undefined;
        const registryCode =
          patent[Curriculum.DETALHAMENTO_DA_PATENTE]?.[0][Curriculum.REGISTRO_OU_PATENTE]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.CODIGO_DO_REGISTRO_OU_PATENTE
          ] ?? undefined;
        const depositRegistrationInstitution =
          patent[Curriculum.DETALHAMENTO_DA_PATENTE]?.[0][Curriculum.REGISTRO_OU_PATENTE]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.INSTITUICAO_DEPOSITO_REGISTRO
          ] ?? undefined;
        const depositantName =
          patent[Curriculum.DETALHAMENTO_DA_PATENTE]?.[0][Curriculum.REGISTRO_OU_PATENTE]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_DO_DEPOSITANTE
          ] ?? undefined;
    
        const patentAuthors = patent[Curriculum.AUTORES] ?? undefined;
        let authors = '';
        for (let i = 0; patentAuthors !== undefined && i < patentAuthors.length; i++) {
          const quoteName = patentAuthors[i][Curriculum.ATRIBUTOS][Curriculum.NOME_PARA_CITACAO];
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
          authors: authors ?? undefined,
          professor,
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
        if (
            json[Curriculum.CURRICULO_VITAE][Curriculum.OUTRA_PRODUCAO]?.[0][Curriculum.PRODUCAO_ARTISTICA_CULTURAL]
        ) {
            return json[Curriculum.CURRICULO_VITAE]?.[Curriculum.OUTRA_PRODUCAO]?.[0][
                Curriculum.PRODUCAO_ARTISTICA_CULTURAL
            ]?.[0][Curriculum.ARTES_VISUAIS];
        }
    }

    getArtisticProductionData(artisticProduction: any, professor: Professor) {
        const title =
          artisticProduction[Curriculum.DADOS_BASICOS_DE_ARTES_VISUAIS]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.TITULO] ??
          undefined;
    
        const year =
          artisticProduction[Curriculum.DADOS_BASICOS_DE_ARTES_VISUAIS]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.ANO] ??
          undefined;
    
        const country =
          artisticProduction[Curriculum.DADOS_BASICOS_DE_ARTES_VISUAIS]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.PAIS] ??
          undefined;
    
        const language =
          artisticProduction[Curriculum.DADOS_BASICOS_DE_ARTES_VISUAIS]?.[0][Curriculum.ATRIBUTOS]?.[Curriculum.IDIOMA] ??
          undefined;
    
        const authorActivity =
          artisticProduction[Curriculum.DETALHAMENTO_DE_ARTES_VISUAIS]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.ATIVIDADE_DOS_AUTORES
          ] ?? undefined;
    
        const promotingInstitution =
          artisticProduction[Curriculum.DETALHAMENTO_DE_ARTES_VISUAIS]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.INSTITUICAO_PROMOTORA_DO_EVENTO
          ] ?? undefined;
    
        const bigArea =
          artisticProduction[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][
            Curriculum.ATRIBUTOS
          ]?.[Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO] ?? undefined;
    
        const area =
          artisticProduction[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][
            Curriculum.ATRIBUTOS
          ]?.[Curriculum.NOME_DA_AREA_DO_CONHECIMENTO] ?? undefined;
    
        const subArea =
          artisticProduction[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][
            Curriculum.ATRIBUTOS
          ]?.[Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO] ?? undefined;
    
        const speciality =
          artisticProduction[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][
            Curriculum.ATRIBUTOS
          ]?.[Curriculum.NOME_DA_ESPECIALIDADE] ?? undefined;
    
        const artisticProductionAuthors = artisticProduction[Curriculum.AUTORES] ?? undefined;
        let authors = '';
    
        for (let i = 0; artisticProductionAuthors !== undefined && i < artisticProductionAuthors.length; i++) {
          const quoteName = artisticProductionAuthors[i][Curriculum.ATRIBUTOS][Curriculum.NOME_PARA_CITACAO];
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
          authors: authors ?? undefined,
          professor,
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
                artisticProduction ??= await this.artisticProductionService.createArtisticProduction(
                    artisticProductionDto,
                    queryRunner,
                );
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
        if (json[Curriculum.CURRICULO_VITAE][Curriculum.PRODUCAO_BIBLIOGRAFICA][0][Curriculum.TRABALHOS_EM_EVENTOS]) {
            return json[Curriculum.CURRICULO_VITAE][Curriculum.PRODUCAO_BIBLIOGRAFICA][0][Curriculum.TRABALHOS_EM_EVENTOS][0][
                Curriculum.TRABALHO_EM_EVENTOS
            ];
        }
    }

    getConferenceData(conference: any, professor: Professor) {
        const bigArea =
          conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO
          ] ?? undefined;
    
        const area =
          conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_DA_AREA_DO_CONHECIMENTO
          ] ?? undefined;
    
        const subArea =
          conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO
          ] ?? undefined;
    
        const speciality =
          conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_1]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_DA_ESPECIALIDADE
          ] ?? undefined;
    
        const bigArea2 =
          conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_2]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_GRANDE_AREA_DO_CONHECIMENTO
          ] ?? undefined;
    
        const area2 =
          conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_2]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_DA_AREA_DO_CONHECIMENTO
          ] ?? undefined;
    
        const subArea2 =
          conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_2]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_DA_SUB_AREA_DO_CONHECIMENTO
          ] ?? undefined;
    
        const speciality2 =
          conference[Curriculum.AREAS_DO_CONHECIMENTO]?.[0][Curriculum.AREA_DO_CONHECIMENTO_2]?.[0][Curriculum.ATRIBUTOS]?.[
            Curriculum.NOME_DA_ESPECIALIDADE
          ] ?? undefined;
    
        const title =
          conference[Curriculum.DADOS_BASICOS_DO_TRABALHO][0][Curriculum.ATRIBUTOS][Curriculum.TITULO_DO_TRABALHO];
        const year = conference[Curriculum.DADOS_BASICOS_DO_TRABALHO][0][Curriculum.ATRIBUTOS][Curriculum.ANO_DO_TRABALHO];
    
        const nature = conference[Curriculum.DADOS_BASICOS_DO_TRABALHO][0][Curriculum.ATRIBUTOS][Curriculum.NATUREZA];
    
        const event = conference[Curriculum.DETALHAMENTO_DO_TRABALHO][0][Curriculum.ATRIBUTOS][Curriculum.NOME_DO_EVENTO];
        const proceedings =
          conference[Curriculum.DETALHAMENTO_DO_TRABALHO][0][Curriculum.ATRIBUTOS][
            Curriculum.TITULO_DOS_ANAIS_OU_PROCEEDINGS
          ];
    
        const doi = conference[Curriculum.DADOS_BASICOS_DO_TRABALHO][0][Curriculum.ATRIBUTOS][Curriculum.DOI];
    
        const curriculumAuthors = conference[Curriculum.AUTORES] ?? undefined;
        let authors = '';
    
        for (let i = 0; curriculumAuthors !== undefined && i < curriculumAuthors.length; i++) {
          const quoteName = curriculumAuthors[i][Curriculum.ATRIBUTOS][Curriculum.NOME_PARA_CITACAO];
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
          authors: authors ?? undefined,
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
        if (json[Curriculum.CURRICULO_VITAE][Curriculum.DADOS_COMPLEMENTARES][0][Curriculum.ORIENTACOES_EM_ANDAMENTO])
            return json[Curriculum.CURRICULO_VITAE][Curriculum.DADOS_COMPLEMENTARES][0][
                Curriculum.ORIENTACOES_EM_ANDAMENTO
            ][0];
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
    
        if (!details) return;
    
        const yearStart = advisee[basicData][0][Curriculum.ATRIBUTOS][Curriculum.ANO];
        const name = advisee[details][0][Curriculum.ATRIBUTOS][Curriculum.NOME_DO_ORIENTANDO];
        const type = advisee[details][0][Curriculum.ATRIBUTOS][Curriculum.TIPO_DE_ORIENTACAO];
        let scholarship = advisee[details][0][Curriculum.ATRIBUTOS][Curriculum.FLAG_BOLSA];
        const financierCode = advisee[details][0][Curriculum.ATRIBUTOS][Curriculum.CODIGO_AGENCIA_FINANCIADORA];
        const institution = advisee[details][0][Curriculum.ATRIBUTOS][Curriculum.NOME_INSTITUICAO];
        const title = advisee[basicData][0][Curriculum.ATRIBUTOS][Curriculum.TITULO_DO_TRABALHO];
        const course = advisee[details][0][Curriculum.ATRIBUTOS][Curriculum.NOME_CURSO];
    
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

    async creatAdvisees(advisees: any, professor: Professor, queryRunner: QueryRunner, program: string, programOrientation: string){
      for(let i = 0; advisees[programOrientation][i] !== undefined; i++){
        const adviseeData = advisees[programOrientation][i];
        const adviseeDto = this.getAdviseeData(adviseeData, professor, program);

        if (adviseeDto) {
            const advisee = await this.adviseeService.getAdvisee(adviseeDto, queryRunner);
            if (!advisee) await this.adviseeService.createAdvisee(adviseeDto, program, queryRunner);
        }
      }
    }

    async insertAdvisees(advisees: any, professor: Professor, queryRunner: QueryRunner) {
        if (!advisees) return;
        try {
            if (advisees?.[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_MESTRADO]) {
                await this.creatAdvisees(advisees, professor, queryRunner, Curriculum.MESTRADO, Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_MESTRADO)
            }

            if (advisees?.[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_DOUTORADO]) {
                await this.creatAdvisees(advisees, professor, queryRunner, Curriculum.DOUTORADO, Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_DOUTORADO)
            }

            if (advisees?.[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_POS_DOUTORADO]) {
                await this.creatAdvisees(advisees, professor, queryRunner, Curriculum.POS_DOUTORADO, Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_POS_DOUTORADO)
            }

            if (advisees?.[Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_MESTRADO]) {
                await this.creatAdvisees(advisees, professor, queryRunner, Curriculum.MESTRADO, Curriculum.ORIENTACAO_EM_ANDAMENTO_DE_INICIACAO_CIENTIFICA)
            }

        } catch (error) {
            await logErrorToDatabase(error, EntityType.ADVISEE);
            throw error;
        }
    }

    getConcludedAdviseesFromJSON(json: any) {
        if (json[Curriculum.CURRICULO_VITAE][Curriculum.OUTRA_PRODUCAO][0][Curriculum.ORIENTACOES_CONCLUIDAS]) {
            return json[Curriculum.CURRICULO_VITAE][Curriculum.OUTRA_PRODUCAO][0][Curriculum.ORIENTACOES_CONCLUIDAS][0];
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

        const yearEnd = concludedAdvisee[basicData][0][Curriculum.ATRIBUTOS][Curriculum.ANO];
        const name = concludedAdvisee[details][0][Curriculum.ATRIBUTOS][Curriculum.NOME_DO_ORIENTADO];
        let type = concludedAdvisee[details][0][Curriculum.ATRIBUTOS][Curriculum.TIPO_DE_ORIENTACAO];
        if (degree === Curriculum.INICIACAO_CIENTIFICA) {
            type = concludedAdvisee[details][0][Curriculum.ATRIBUTOS][Curriculum.TIPO_DE_ORIENTACAO_CONCLUIDA];
        }
        let scholarship = concludedAdvisee[details][0][Curriculum.ATRIBUTOS][Curriculum.FLAG_BOLSA];
        const financierCode = concludedAdvisee[details][0][Curriculum.ATRIBUTOS][Curriculum.CODIGO_AGENCIA_FINANCIADORA];
        const institution =
        concludedAdvisee[details][0][Curriculum.ATRIBUTOS][Curriculum.NOME_INSTITUICAO_ORIENTACOES_CONCLUIDAS];
        const title = concludedAdvisee[basicData][0][Curriculum.ATRIBUTOS][Curriculum.TITULO];
        const course = concludedAdvisee[details][0][Curriculum.ATRIBUTOS][Curriculum.NOME_CURSO_ORIENTACOES_CONCLUIDAS];

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
          await this.creatAdvisees(concludedAdvisees, professor, queryRunner, Curriculum.MESTRADO, Curriculum.ORIENTACOES_CONCLUIDAS_PARA_MESTRADO);
        }

        if (concludedAdvisees[Curriculum.ORIENTACOES_CONCLUIDAS_PARA_DOUTORADO]) {
          await this.creatAdvisees(concludedAdvisees, professor, queryRunner, Curriculum.DOUTORADO, Curriculum.ORIENTACOES_CONCLUIDAS_PARA_DOUTORADO);
        }

        if (concludedAdvisees[Curriculum.ORIENTACOES_CONCLUIDAS_PARA_POS_DOUTORADO]) {
          await this.creatAdvisees(concludedAdvisees, professor, queryRunner, Curriculum.POS_DOUTORADO, Curriculum.ORIENTACOES_CONCLUIDAS_PARA_POS_DOUTORADO);
        }

        if (concludedAdvisees[Curriculum.OUTRAS_ORIENTACOES_CONCLUIDAS]) {
          for (let i = 0; concludedAdvisees[Curriculum.OUTRAS_ORIENTACOES_CONCLUIDAS][i] !== undefined; i++) {
          const adviseeType =
            concludedAdvisees[Curriculum.OUTRAS_ORIENTACOES_CONCLUIDAS][i][
              Curriculum.DADOS_BASICOS_DE_OUTRAS_ORIENTACOES_CONCLUIDAS
            ][0][Curriculum.ATRIBUTOS][Curriculum.NATUREZA];
          if (adviseeType === Curriculum.INICIACAO_CIENTIFICA) {
            const adviseeData = concludedAdvisees[Curriculum.OUTRAS_ORIENTACOES_CONCLUIDAS][i];
            const adviseeDto = this.getConcludedAdviseesData(adviseeData, professor, Curriculum.INICIACAO_CIENTIFICA);
            if (adviseeDto) {
              let advisee = await this.adviseeService.getAdvisee(adviseeDto, queryRunner);
              if (!advisee)
              await this.adviseeService.createAdvisee(
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


    getProjectsFromJSON(json: any) {
        if (json[Curriculum.CURRICULO_VITAE][Curriculum.DADOS_GERAIS][0][Curriculum.ATUACOES_PROFISSIONAIS]) {
            return json[Curriculum.CURRICULO_VITAE][Curriculum.DADOS_GERAIS][0][Curriculum.ATUACOES_PROFISSIONAIS][0][
                Curriculum.ATUACAO_PROFISSIONAL
            ];
        }
    }

    getResearchProjectFinancier(researchProject: any) {
        if (researchProject[Curriculum.PROJETO_DE_PESQUISA])
            return researchProject[Curriculum.PROJETO_DE_PESQUISA][0][Curriculum.FINANCIADORES_DO_PROJETO];
    }

    getResearchProjects(project: any) {
        return project[Curriculum.ATIVIDADES_DE_PARTICIPACAO_EM_PROJETO][0][Curriculum.PARTICIPACAO_EM_PROJETO];
    }

    getFinancierFromJSON(json: any) {
        if (json) {
          const financiersDto: FinancierDto[] = [];
          for (let i = 0; json[0][Curriculum.FINANCIADOR_DO_PROJETO][i] !== undefined; i++) {
            const financierJson = json[0][Curriculum.FINANCIADOR_DO_PROJETO][i][Curriculum.ATRIBUTOS];
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
          researchProject[Curriculum.PROJETO_DE_PESQUISA]?.[0][Curriculum.ATRIBUTOS][Curriculum.ANO_INICIO] &&
          researchProject[Curriculum.PROJETO_DE_PESQUISA][0][Curriculum.ATRIBUTOS][Curriculum.ANO_INICIO] !== ''
        ) {
          const yearStart = researchProject[Curriculum.PROJETO_DE_PESQUISA][0][Curriculum.ATRIBUTOS][Curriculum.ANO_INICIO];
          const name = researchProject[Curriculum.PROJETO_DE_PESQUISA][0][Curriculum.ATRIBUTOS][Curriculum.NOME_DO_PROJETO];
    
          const periodFlag = researchProject[Curriculum.ATRIBUTOS][Curriculum.FLAG_PERIODO];
    
          const projectDto: ProjectDto = {
            professor,
            year: yearStart,
            name,
            periodFlag,
          };
    
          return projectDto;
        }
    }


    async insertProjects(projects: any, professor: Professor, queryRunner: QueryRunner) {
    if (!projects) return;
    try {
      if (projects)
        for (const proj of projects) {
          if (proj[Curriculum.ATIVIDADES_DE_PARTICIPACAO_EM_PROJETO]) {
            const researchProjects = this.getResearchProjects(proj);
            for (let j = 0; researchProjects[j] !== undefined; j++) {
              const researchProject = researchProjects[j];
              let project;
              const projectDto = this.getProjectData(researchProject, professor);
              if (projectDto) project = await this.projectService.getProject(projectDto, queryRunner);
              if (!project && projectDto) project = await this.projectService.createProject(projectDto, queryRunner);
              const financiers = this.getResearchProjectFinancier(researchProject);
              const financiersDto = this.getFinancierFromJSON(financiers);
              if (financiersDto) {
                for (const financierDto of financiersDto) {
                  let financier = await this.financierService.getFinancier(financierDto, queryRunner);
                  financier ??= await this.financierService.createFinancier(financierDto, queryRunner);
                  if (project) {
                    await this.projectService.addFinancierToProject(project, financier, financierDto.nature, queryRunner);
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

    async insertDataToDatabase(){
        const files = await fs.promises.readdir(this.JSON_PATH);
        const queryRunner = AppDataSource.createQueryRunner();
        try{
            const journals = await this.journalService.findAll(queryRunner);
            const conferences = await this.conferenceService.findAll(queryRunner);
            for(const file of files){
                await queryRunner.startTransaction();
                try{

                    const filePath = `${this.JSON_PATH}/${file}`;
                    const raw = await fs.promises.readFile(filePath, 'utf-8');
                    const json = JSON.parse(raw);
                    
                    let professorDto: CreateProfessorDto | undefined = undefined;
                    professorDto = this.getProfessorData(json);
                    const professor = await this.insertProfessor(professorDto, queryRunner);

                    const articles = this.getArticlesFromJSON(json);
                    await this.insertArticles(articles, professor, journals, queryRunner);

                    const books = this.getBooksFromJSON(json);
                    await this.insertBooks(books, professor, queryRunner);

                    const translations = this.getTranslationsFromJSON(json);
                    await this.insertTranslations(translations, professor, queryRunner);

                    const patents = this.getPatentsFromJSON(json);
                    await this.insertPatents(patents, professor, queryRunner);

                    const artisticProductions = this.getArtisticProductionsFromJSON(json);
                    await this.insertArtisticProductions(artisticProductions, professor, queryRunner);

                    const conferencePublications = this.getConferencesFromJSON(json);
                    await this.insertConferences(conferencePublications, professor, conferences, queryRunner);

                    const advisees = this.getAdviseesFromJSON(json);
                    await this.insertAdvisees(advisees, professor, queryRunner);

                    const concludedAdvisees = this.getConcludedAdviseesFromJSON(json);
                    await this.insertConcludedAdvisees(concludedAdvisees, professor, queryRunner);

                    const projects = this.getProjectsFromJSON(json);
                    await this.insertProjects(projects, professor, queryRunner);

                }catch (err){
                    await queryRunner.rollbackTransaction();
                    await logErrorToDatabase(err, EntityType.XML, file);
                }
            }
        await queryRunner.commitTransaction();
        }finally{
            await queryRunner.release();
        }
    }
}

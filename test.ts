import { Injectable } from '@nestjs/common';
import extract from 'extract-zip';
import * as fs from 'fs';
import { readdir, readFile, rename, unlink } from 'fs/promises';
import { AppDataSource } from 'src/app.datasource';
import { Curriculum } from 'src/import-json/curriculum.enum';
import { ImportXml } from 'src/import-xml/entities/import-xml.entity';
import { AdviseeDto } from 'src/professor/dto/advisee.dto';
import { BookDto } from 'src/professor/dto/book.dto';
import { ConferenceDto } from 'src/professor/dto/conference.dto';
import { CreateProfessorDto } from 'src/professor/dto/create-professor.dto';
import { FinancierDto } from 'src/professor/dto/financier.dto';
import { JournalPublicationDto } from 'src/professor/dto/journal-publication.dto';
import { ProjectDto } from 'src/professor/dto/project.dto';
import { TranslationDto } from 'src/professor/dto/translation.dto';
import { Financier } from 'src/professor/entities/financier.entity';
import { Professor } from 'src/professor/entities/professor.entity';
import { Conference } from 'src/qualis/entities/conference.entity';
import { Journal } from 'src/qualis/entities/journal.entity';
import { Status } from 'src/types/enums';
import { EntityType } from 'src/utils/exception-filters/entity-type-enum';
import logErrorToDatabase from 'src/utils/exception-filters/log-error';
import { Log } from 'src/utils/exception-filters/log.entity';
import { QueryRunner } from 'typeorm';


@Injectable()
export class ImportXmlService {
    path = require('path');

    XML_PATH = process.env.XML_PATH ?? 'downloadedFiles';
  

    getProfessorData(json: any) {
        const identifier = json[Curriculum.NUMERO_IDENTIFICADOR];
        const name = json[Curriculum.DADOS_GERAIS][Curriculum.NOME_COMPLETO];

        const createProfessorDto: CreateProfessorDto = { name, identifier };
        return createProfessorDto;
    }

    

    getArticlesFromJSON(json: any) {
        if (json[Curriculum.PRODUCAO_BIBLIOGRAFICA][Curriculum.ARTIGOS_PUBLICADOS]) {
            return json[Curriculum.PRODUCAO_BIBLIOGRAFICA][Curriculum.ARTIGOS_PUBLICADOS][Curriculum.ARTIGO_PUBLICADO];
        }
    }

    getArticleData(article: any) {
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
    
        console.log(curriculumAuthors);
        for (let i = 0; curriculumAuthors !== undefined && i < curriculumAuthors.length; i++) {
          const quoteName = curriculumAuthors[i][Curriculum.NOME_PARA_CITACAO];
          if (i === curriculumAuthors.length - 1) {
            authors += `${quoteName}`;
          } else {
            authors += `${quoteName}; `;
          }
        }

        // TODO: add professor instance
    
        const articleDto = {
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

    getBookData(book: any) {
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

        // TODO: add professor instance
    
        const bookDto = {
          
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


        getTranslationData(translation: any) {
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


           // TODO: add professor instance

      
          const translationDto = {
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

        getPatentData(patent: any) {
            const title =
              patent[Curriculum.DADOS_BASICOS_DA_PATENTE]?.[Curriculum.NOME_PRODUCAO_PATENTE] ?? undefined;
        
            const developmentYear =
              patent[Curriculum.DADOS_BASICOS_DA_PATENTE]?.[Curriculum.ANO_PRODUCAO] ??
              undefined;
        
            const country =
              patent[Curriculum.DADOS_BASICOS_DA_PATENTE]?.[Curriculum.PAIS] ?? undefined;
        
            const situationStatus =
              patent[Curriculum.DETALHAMENTO_DA_PATENTE]?.[Curriculum.HISTORICO_SITUACOES_PATENTE]?.[Curriculum.DESCRICAO_SITUACAO_PATENTE] ?? undefined;
        
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

            // TODO: add professor instance
        
            const patentDto = {
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


        

          getArtisticProductionData(artisticProduction: any) {
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

              // TODO: add professor instance
          
              const artisticProductionDto = {
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


    getConferenceData(conference: any) {
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

        // TODO: add professor instance
    
        const conferenceDto = {
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

      getAdviseeData(advisee: any, degree: string) {
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
      
          const yearStart = advisee[basicData][Curriculum.ANO];
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
      
          const adviseeDto = {
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


    getBooksFromJSON(json: any) {
        if (
          json[Curriculum.PRODUCAO_BIBLIOGRAFICA][Curriculum.LIVROS_E_CAPITULOS] &&
          json[Curriculum.PRODUCAO_BIBLIOGRAFICA][Curriculum.LIVROS_E_CAPITULOS][Curriculum.LIVROS_PUBLICADOS_OU_ORGANIZADOS]
        ) {
          return json[Curriculum.PRODUCAO_BIBLIOGRAFICA][Curriculum.LIVROS_E_CAPITULOS][
            Curriculum.LIVROS_PUBLICADOS_OU_ORGANIZADOS
          ][Curriculum.LIVRO_PUBLICADO_OU_ORGANIZADO];
        }
    }

    getTranslationsFromJSON(json: any) {
        if (
          json[Curriculum.PRODUCAO_BIBLIOGRAFICA][
           Curriculum.DEMAIS_TIPOS_DE_PRODUCAO_BIBLIOGRAFICA
          ] &&
          json[Curriculum.PRODUCAO_BIBLIOGRAFICA][
            Curriculum.DEMAIS_TIPOS_DE_PRODUCAO_BIBLIOGRAFICA
          ][Curriculum.TRADUCAO]
        ) {
          return json[Curriculum.PRODUCAO_BIBLIOGRAFICA][
            Curriculum.DEMAIS_TIPOS_DE_PRODUCAO_BIBLIOGRAFICA
          ][Curriculum.TRADUCAO];
        }
    }

    getPatentsFromJSON(json: any) {
        if (
            json[Curriculum.PRODUCAO_TECNICA] &&
            json[Curriculum.PRODUCAO_TECNICA][Curriculum.PATENTE]
        ) {
            return json[Curriculum.PRODUCAO_TECNICA][Curriculum.PATENTE];
        }
    }

    getArtisticProductionsFromJSON(json: any) {
        if (
            json[Curriculum.OUTRA_PRODUCAO] &&
            json[Curriculum.OUTRA_PRODUCAO][Curriculum.PRODUCAO_ARTISTICA_CULTURAL]
        ) {
            return json[Curriculum.OUTRA_PRODUCAO][Curriculum.PRODUCAO_ARTISTICA_CULTURAL][0][Curriculum.ARTES_VISUAIS];
        }
    }

    getConferencesFromJSON(json: any) {
        if (json[Curriculum.PRODUCAO_BIBLIOGRAFICA][Curriculum.TRABALHOS_EM_EVENTOS]) {
            return json[Curriculum.PRODUCAO_BIBLIOGRAFICA][Curriculum.TRABALHOS_EM_EVENTOS][
            Curriculum.TRABALHO_EM_EVENTOS
            ];
        }
    }

    getAdviseesFromJSON(json: any) {
        if (json[Curriculum.DADOS_COMPLEMENTARES][Curriculum.ORIENTACOES_EM_ANDAMENTO])
            return json[Curriculum.DADOS_COMPLEMENTARES][
            Curriculum.ORIENTACOES_EM_ANDAMENTO
            ];
    }

    getConcludedAdviseesFromJSON(json: any) {
        if (json[Curriculum.OUTRA_PRODUCAO][Curriculum.ORIENTACOES_CONCLUIDAS]) {
            return json[Curriculum.OUTRA_PRODUCAO][Curriculum.ORIENTACOES_CONCLUIDAS];
        }
    }

   getProjectsFromJSON(json: any) {
        if (json[Curriculum.DADOS_GERAIS]?.[Curriculum.ATUACOES_PROFISSIONAIS]) {
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

    async insertDataToDatabase() {
        const jsonRaw = await import('./professor.json')

        const professorData = this.getProfessorData(jsonRaw);
        const articles = this.getArticlesFromJSON(jsonRaw);
        const books = this.getBooksFromJSON(jsonRaw);
        const translations = this.getTranslationsFromJSON(jsonRaw);
        const patents = this.getPatentsFromJSON(jsonRaw);
        const artisticProductions = this.getArtisticProductionsFromJSON(jsonRaw);
        const conferences = this.getConferencesFromJSON(jsonRaw);
        const advisees = this.getAdviseesFromJSON(jsonRaw);
        const concludedAdvisees = this.getConcludedAdviseesFromJSON(jsonRaw);
        const projects = this.getProjectsFromJSON(jsonRaw);
        const articleData = this.getArticleData(articles[1]);
        const bookData = this.getBookData(books[0]);
        //const translationData = this.getTranslationData(translations[0]);
        const patentData = this.getPatentData(patents[0]);
        const artisticProdutionData = this.getArtisticProductionData(artisticProductions[0]);
        const conferenceData = this.getConferenceData(conferences[3]);
        //const adviseeMestrado = this.getAdviseeData(advisees[0], 'mestrado');
        //const financiers = this.getFinancierFromJSON(projects);

        console.log("ENDS")
    };
}

const importXml = new ImportXmlService()
importXml.insertDataToDatabase()

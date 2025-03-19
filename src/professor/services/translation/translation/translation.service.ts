import { Injectable } from '@nestjs/common';
import { AppDataSource } from 'src/app.datasource';
import { TranslationDto } from 'src/professor/dto/translation.dto';
import { Translation } from 'src/professor/entities/translation.entity';
import { EntityType } from 'src/utils/exception-filters/entity-type-enum';
import logErrorToDatabase from 'src/utils/exception-filters/log-error';
import { QueryRunner } from 'typeorm';

@Injectable()
export class TranslationService {
  async findOne(
    translationDto: TranslationDto,
    queryRunner: QueryRunner | undefined,
  ) {
    try {
      return await AppDataSource.createQueryBuilder(queryRunner)
        .select('t')
        .from(Translation, 't')
        .where('t.title=:title', { title: translationDto.title })
        .andWhere('t.professor_id=:professorId', {
          professorId: translationDto.professor.id,
        })
        .getOne();
    } catch (error) {
      throw error;
    }
  }

  async createTranslation(
    translationDto: TranslationDto,
    queryRunner: QueryRunner,
  ) {
    try {
      const translation = new Translation();
      translation.title = translationDto.title;
      translation.originalTitle = translationDto.originalTitle;
      translation.language = translationDto.language;
      translation.originalLanguage = translationDto.originalLanguage;
      translation.authors = translationDto.authors;
      translation.originalAuthor = translationDto.originalAuthor;
      translation.professor = translationDto.professor;
      translation.publicationCountry = translationDto.publicationCountry;
      translation.originalPublicationCity =
        translationDto.originalPublicationCity;
      translation.bigArea = translationDto.bigArea;
      translation.area = translationDto.area;
      translation.subArea = translationDto.subArea;
      translation.speciality = translationDto.speciality;
      translation.issn = translationDto.issn;
      translation.year = translationDto.year;

      await AppDataSource.createQueryBuilder(queryRunner)
        .insert()
        .into(Translation)
        .values(translation)
        .execute();

      return translation;
    } catch (error) {
      await logErrorToDatabase(error, EntityType.TRANSLATION, undefined);
      throw error;
    }
  }
}

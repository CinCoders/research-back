import { Injectable } from '@nestjs/common';
import { AppDataSource } from 'src/app.datasource';
import { ArtisticProductionDto } from 'src/professor/dto/artistic-production.dto';
import { ArtisticProduction } from 'src/professor/entities/artisticProduction.entity';
import { EntityType } from 'src/utils/exception-filters/entity-type-enum';
import logErrorToDatabase from 'src/utils/exception-filters/log-error';
import { QueryRunner } from 'typeorm';

@Injectable()
export class ArtisticProductionService {
  async findOne(artisticProductionDto: ArtisticProductionDto, queryRunner: QueryRunner | undefined) {
    try {
      return await AppDataSource.createQueryBuilder(queryRunner)
        .select('a')
        .from(ArtisticProduction, 'a')
        .where('a.title=:title', { title: artisticProductionDto.title })
        .andWhere('a.professor_id=:professorId', {
          professorId: artisticProductionDto.professor.id,
        })
        .getOne();
    } catch (error) {
      throw error;
    }
  }

  async createArtisticProduction(artisticProductionDto: ArtisticProductionDto, queryRunner: QueryRunner) {
    try {
      const artisticProduction = new ArtisticProduction();
      artisticProduction.title = artisticProductionDto.title;
      artisticProduction.year = +artisticProductionDto.year;
      artisticProduction.language = artisticProductionDto.language;
      artisticProduction.authors = artisticProductionDto.authors;
      artisticProduction.authorActivity = artisticProductionDto.authorActivity;
      artisticProduction.promotingInstitution = artisticProductionDto.promotingInstitution;
      artisticProduction.professor = artisticProductionDto.professor;
      artisticProduction.country = artisticProductionDto.country;
      artisticProduction.bigArea = artisticProductionDto.bigArea;
      artisticProduction.area = artisticProductionDto.area;
      artisticProduction.subArea = artisticProductionDto.subArea;
      artisticProduction.speciality = artisticProductionDto.speciality;

      await AppDataSource.createQueryBuilder(queryRunner)
        .insert()
        .into(ArtisticProduction)
        .values(artisticProduction)
        .execute();

      return artisticProduction;
    } catch (error) {
      await logErrorToDatabase(error, EntityType.ARTISTIC_PRODUCTION, undefined);
      throw error;
    }
  }
}

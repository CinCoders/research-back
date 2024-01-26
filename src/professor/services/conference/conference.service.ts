import { Injectable } from '@nestjs/common';
import { Conference } from 'src/qualis/entities/conference.entity';
import { EntityType } from 'src/utils/exception-filters/entity-type-enum';
import logErrorToDatabase from 'src/utils/exception-filters/log-error';
import { StringSimilarityService } from 'src/utils/string-similarity.service';
import { QueryRunner } from 'typeorm';
import { ConferenceDto } from '../../dto/conference.dto';
import { ConferencePublication } from '../../entities/conference-publication.entity';
import { AppDataSource } from 'src/app.datasource';

@Injectable()
export class ConferencePublicationService {
  constructor(private readonly stringSimilarityService: StringSimilarityService) {}

  async createConference(conferenceDto: ConferenceDto, queryRunner: QueryRunner) {
    const conferencePublication = new ConferencePublication();
    conferencePublication.professor = conferenceDto.professor;
    conferencePublication.title = conferenceDto.title;
    conferencePublication.year = +conferenceDto.year;
    conferencePublication.event = conferenceDto.event;
    conferencePublication.proceedings = conferenceDto.proceedings;
    conferencePublication.doi = conferenceDto.doi;
    conferencePublication.authors = conferenceDto.authors;
    conferencePublication.bigArea = conferenceDto.bigArea;
    conferencePublication.area = conferenceDto.area;
    conferencePublication.subArea = conferenceDto.subArea;
    conferencePublication.speciality = conferenceDto.speciality;
    conferencePublication.nature = conferenceDto.nature;

    await AppDataSource.createQueryBuilder(queryRunner)
      .insert()
      .into(ConferencePublication)
      .values(conferencePublication)
      .execute();

    return conferencePublication;
  }

  async getConference(conferenceDto: ConferenceDto, queryRunner: QueryRunner) {
    return await AppDataSource.createQueryBuilder(queryRunner)
      .select('c')
      .from(ConferencePublication, 'c')
      .where('c.title=:title', { title: conferenceDto.title })
      .andWhere('c.professor_id=:professorId', {
        professorId: conferenceDto.professor.id,
      })
      .getOne();
  }
  async getConferenceAndQualis(
    conferencePublication: ConferencePublication,
    conferenceList: Conference[],
    queryRunner: QueryRunner,
  ) {
    const conferenceNameList: string[] = [];
    const conferenceAcronymList: string[] = [];
    for (let i = 0; i < conferenceList.length; i++) {
      conferenceNameList.push(conferenceList[i].name);
      conferenceAcronymList.push(conferenceList[i].acronym);
    }
    try {
      // create pattern for splitting strings
      const pattern = /\s|'|"|\(|\)|\[|\]|\{|\}|`|\&apos;/;
      // ignore if conferencePublication.event contains 'Workshop'
      if (
        conferencePublication.event.search(/Workshop/i) < 0 &&
        conferencePublication.proceedings.search(/Workshop/i) < 0 &&
        conferencePublication.event.search(/Demonstration/i) < 0 &&
        conferencePublication.proceedings.search(/Demonstration/i) < 0 &&
        conferencePublication.event.search(/Doctoral Symposium/i) < 0 &&
        conferencePublication.proceedings.search(/Doctoral Symposium/i) < 0
      ) {
        // search conferencePublication event string for conferencePublication name
        if (!conferencePublication.conference) {
          const bestMatchEvent = this.stringSimilarityService.findBestMatch(
            conferencePublication.event,
            conferenceNameList,
          ).bestMatch;

          if (bestMatchEvent.rating >= 1) {
            const topConference: Conference | undefined = conferenceList.find(
              top => top.name === bestMatchEvent.target,
            );
            if (topConference) {
              conferencePublication.conference = topConference;
              if (topConference.qualis) conferencePublication.qualis = topConference.qualis;
              if (topConference.isTop) conferencePublication.isTop = true;
              await AppDataSource.createQueryBuilder(queryRunner)
                .insert()
                .into(ConferencePublication)
                .values(conferencePublication)
                .orUpdate(['title', 'proceedings', 'qualis', 'conference_id', 'is_top'], ['id'])
                .execute();
            }
          }
        }

        // search conferencePublication proceedings string for conferencePublication name
        if (!conferencePublication.conference) {
          const bestMatchProceedings = this.stringSimilarityService.findBestMatch(
            conferencePublication.proceedings,
            conferenceNameList,
          ).bestMatch;

          if (bestMatchProceedings.rating >= 1) {
            const conference: Conference | undefined = conferenceList.find(
              top => top.name === bestMatchProceedings.target,
            );
            if (conference) {
              conferencePublication.conference = conference;
              if (conference.qualis) conferencePublication.qualis = conference.qualis;
              if (conference.isTop) conferencePublication.isTop = true;
              await AppDataSource.createQueryBuilder(queryRunner)
                .insert()
                .into(ConferencePublication)
                .values(conferencePublication)
                .orUpdate(['conference_id', 'qualis', 'is_top'], ['id'])
                .execute();
            }
          }
        }

        // search conferencePublication event string for conferencePublication acronym
        if (!conferencePublication.conference) {
          const conferenceEventStrings = conferencePublication.event.split(pattern);
          let highestMatch: { target: string; rating: number } = {
            target: '',
            rating: -1,
          };
          let result: {
            ratings: { target: string; rating: number }[];
            bestMatch: { target: string; rating: number };
            bestMatchIndex: number;
          };
          let index = -1;
          for (let k = 0; k < conferenceEventStrings.length; k++) {
            result = this.stringSimilarityService.findBestMatch(conferenceEventStrings[k], conferenceAcronymList);

            if (result.bestMatch.rating > highestMatch.rating) {
              highestMatch = result.bestMatch;
              index = result.bestMatchIndex;
            }
          }

          if (highestMatch.rating >= 1 && index > -1) {
            const topConference = conferenceList[index];
            if (topConference) {
              conferencePublication.conference = topConference;
              if (topConference.qualis) conferencePublication.qualis = topConference.qualis;
              if (topConference.isTop) conferencePublication.isTop = true;
              await AppDataSource.createQueryBuilder(queryRunner)
                .insert()
                .into(ConferencePublication)
                .values(conferencePublication)
                .orUpdate(['conference_id', 'qualis', 'is_top'], ['id'])
                .execute();
            }
          }
        }

        // search conferencePublication proceedings string for conferencePublication acronym
        if (!conferencePublication.conference) {
          const conferenceProceedingsStrings = conferencePublication.proceedings.split(pattern);
          let highestMatch: { target: string; rating: number } = {
            target: '',
            rating: -1,
          };
          let result: {
            ratings: { target: string; rating: number }[];
            bestMatch: { target: string; rating: number };
            bestMatchIndex: number;
          };
          let index = -1;
          for (let k = 0; k < conferenceProceedingsStrings.length; k++) {
            result = this.stringSimilarityService.findBestMatch(conferenceProceedingsStrings[k], conferenceAcronymList);

            if (result.bestMatch.rating > highestMatch.rating) {
              highestMatch = result.bestMatch;
              index = result.bestMatchIndex;
            }
          }

          if (highestMatch.rating >= 1 && index > -1) {
            const topConference: Conference | undefined = conferenceList.find(
              top => top.acronym === highestMatch.target,
            );
            if (topConference) {
              conferencePublication.conference = topConference;
              if (topConference.qualis) conferencePublication.qualis = topConference.qualis;
              if (topConference.isTop) conferencePublication.isTop = true;
              await AppDataSource.createQueryBuilder(queryRunner)
                .insert()
                .into(ConferencePublication)
                .values(conferencePublication)
                .orUpdate(
                  ['title', 'event', 'proceedings', 'year', 'is_top', 'qualis', 'professor_id', 'conference_id'],
                  ['id'],
                )
                .execute();
            }
          }
        }
      }
    } catch (err: any) {
      await logErrorToDatabase(err, EntityType.CONFERENCE, conferencePublication.id.toString());
      throw err;
    }
  }
}

import { Injectable } from '@nestjs/common';
import { AppDataSource } from 'src/app.datasource';
import { BookDto } from 'src/professor/dto/book.dto';
import { Book } from 'src/professor/entities/book.entity';
import { EntityType } from 'src/utils/exception-filters/entity-type-enum';
import logErrorToDatabase from 'src/utils/exception-filters/log-error';
import { QueryRunner } from 'typeorm';

@Injectable()
export class BookService {
  async findOne(bookDto: BookDto, queryRunner: QueryRunner | undefined) {
    try {
      return await AppDataSource.createQueryBuilder(queryRunner)
        .select('b')
        .from(Book, 'b')
        .where('b.title=:title', { title: bookDto.title })
        .andWhere('b.professor_id=:professorId', {
          professorId: bookDto.professor.id,
        })
        .getOne();
    } catch (error) {
      throw error;
    }
  }

  async createBook(bookDto: BookDto, queryRunner: QueryRunner) {
    try {
      const book = new Book();
      book.title = bookDto.title;
      book.year = +bookDto.year;
      book.language = bookDto.language;
      book.authors = bookDto.authors;
      book.professor = bookDto.professor;
      book.publicationCountry = bookDto.publicationCountry;
      book.bigArea = bookDto.bigArea;
      book.area = bookDto.area;
      book.subArea = bookDto.subArea;
      book.speciality = bookDto.speciality;
      book.bigArea2 = bookDto.bigArea2;
      book.area2 = bookDto.area2;
      book.subArea2 = bookDto.subArea2;
      book.speciality2 = bookDto.speciality2;

      await AppDataSource.createQueryBuilder(queryRunner)
        .insert()
        .into(Book)
        .values(book)
        .execute();

      return book;
    } catch (error) {
      await logErrorToDatabase(error, EntityType.BOOK, undefined);
      throw error;
    }
  }
}

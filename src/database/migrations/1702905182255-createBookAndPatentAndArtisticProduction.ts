import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookAndPatentAndArtisticProduction1702905182255 implements MigrationInterface {
  name = 'CreateBookAndPatentAndArtisticProduction1702905182255';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "book" ("id" integer GENERATED BY DEFAULT AS IDENTITY NOT NULL, "title" character varying NOT NULL, "language" character varying NOT NULL, "year" integer NOT NULL, "publicationCountry" character varying NOT NULL, "bigArea" character varying, "area" character varying, "subArea" character varying, "speciality" character varying, "authors" character varying(1500), "professor_id" integer, CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "patent" ("id" integer GENERATED BY DEFAULT AS IDENTITY NOT NULL, "title" character varying NOT NULL, "developmentYear" character varying NOT NULL, "country" character varying NOT NULL, "situationStatus" character varying NOT NULL, "category" character varying, "patentType" character varying, "registryCode" character varying, "depositRegistrationInstitution" character varying, "depositantName" character varying, "authors" character varying(1500), "professor_id" integer, CONSTRAINT "PK_96dffa9f77a7b6bf84dea124cbd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "artistic_production" ("id" integer GENERATED BY DEFAULT AS IDENTITY NOT NULL, "title" character varying NOT NULL, "language" character varying NOT NULL, "year" integer NOT NULL, "country" character varying NOT NULL, "authorActivity" character varying, "promotingInstitution" character varying, "bigArea" character varying, "area" character varying, "subArea" character varying, "speciality" character varying, "authors" character varying(1500), "professor_id" integer, CONSTRAINT "PK_f516e2aef25e7034d8577f22429" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "journal_publication" ADD "bigArea" character varying`);
    await queryRunner.query(`ALTER TABLE "journal_publication" ADD "area" character varying`);
    await queryRunner.query(`ALTER TABLE "journal_publication" ADD "subArea" character varying`);
    await queryRunner.query(`ALTER TABLE "journal_publication" ADD "speciality" character varying`);
    await queryRunner.query(`ALTER TABLE "conference_publication" ADD "bigArea" character varying`);
    await queryRunner.query(`ALTER TABLE "conference_publication" ADD "area" character varying`);
    await queryRunner.query(`ALTER TABLE "conference_publication" ADD "subArea" character varying`);
    await queryRunner.query(`ALTER TABLE "conference_publication" ADD "speciality" character varying`);
    await queryRunner.query(
      `ALTER TABLE "book" ADD CONSTRAINT "FK_f3f60cb80a7b97e22bb9907864a" FOREIGN KEY ("professor_id") REFERENCES "professor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "patent" ADD CONSTRAINT "FK_e2e22f8ce27efd7bc6e3b39ba9d" FOREIGN KEY ("professor_id") REFERENCES "professor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "artistic_production" ADD CONSTRAINT "FK_8c68fd413f52218a031bc97f1a1" FOREIGN KEY ("professor_id") REFERENCES "professor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "artistic_production" DROP CONSTRAINT "FK_8c68fd413f52218a031bc97f1a1"`);
    await queryRunner.query(`ALTER TABLE "patent" DROP CONSTRAINT "FK_e2e22f8ce27efd7bc6e3b39ba9d"`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_f3f60cb80a7b97e22bb9907864a"`);
    await queryRunner.query(`ALTER TABLE "conference_publication" DROP COLUMN "speciality"`);
    await queryRunner.query(`ALTER TABLE "conference_publication" DROP COLUMN "subArea"`);
    await queryRunner.query(`ALTER TABLE "conference_publication" DROP COLUMN "area"`);
    await queryRunner.query(`ALTER TABLE "conference_publication" DROP COLUMN "bigArea"`);
    await queryRunner.query(`ALTER TABLE "journal_publication" DROP COLUMN "speciality"`);
    await queryRunner.query(`ALTER TABLE "journal_publication" DROP COLUMN "subArea"`);
    await queryRunner.query(`ALTER TABLE "journal_publication" DROP COLUMN "area"`);
    await queryRunner.query(`ALTER TABLE "journal_publication" DROP COLUMN "bigArea"`);
    await queryRunner.query(`DROP TABLE "artistic_production"`);
    await queryRunner.query(`DROP TABLE "patent"`);
    await queryRunner.query(`DROP TABLE "book"`);
  }
}

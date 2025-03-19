import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterConferencePubAndJournalPubAndBook1706298287607
  implements MigrationInterface
{
  name = 'AlterConferencePubAndJournalPubAndBook1706298287607';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "journal_publication" ADD "bigArea2" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "journal_publication" ADD "area2" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "journal_publication" ADD "subArea2" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "journal_publication" ADD "speciality2" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "conference_publication" ADD "bigArea2" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "conference_publication" ADD "area2" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "conference_publication" ADD "subArea2" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "conference_publication" ADD "speciality2" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "book" ADD "bigArea2" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "book" ADD "area2" character varying`);
    await queryRunner.query(
      `ALTER TABLE "book" ADD "subArea2" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "book" ADD "speciality2" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "speciality2"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "subArea2"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "area2"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "bigArea2"`);
    await queryRunner.query(
      `ALTER TABLE "conference_publication" DROP COLUMN "speciality2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conference_publication" DROP COLUMN "subArea2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conference_publication" DROP COLUMN "area2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conference_publication" DROP COLUMN "bigArea2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "journal_publication" DROP COLUMN "speciality2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "journal_publication" DROP COLUMN "subArea2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "journal_publication" DROP COLUMN "area2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "journal_publication" DROP COLUMN "bigArea2"`,
    );
  }
}

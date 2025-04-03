import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableJournalConference1661801391940 implements MigrationInterface {
  name = 'AlterTableJournalConference1661801391940';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "journal_publication" ADD "journal_title" character varying(100)`);
    await queryRunner.query(`ALTER TABLE "conference_publication" ADD "doi" character varying(50)`);
    await queryRunner.query(`ALTER TABLE "logs" DROP COLUMN "entity_id"`);
    await queryRunner.query(`ALTER TABLE "logs" ADD "entity_id" character varying`);
    await queryRunner.query(`ALTER TABLE "logs" ALTER COLUMN "execution_context_host" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "logs" ALTER COLUMN "execution_context_host" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "logs" DROP COLUMN "entity_id"`);
    await queryRunner.query(`ALTER TABLE "logs" ADD "entity_id" integer`);
    await queryRunner.query(`ALTER TABLE "conference_publication" DROP COLUMN "doi"`);
    await queryRunner.query(`ALTER TABLE "journal_publication" DROP COLUMN "journal_title"`);
  }
}

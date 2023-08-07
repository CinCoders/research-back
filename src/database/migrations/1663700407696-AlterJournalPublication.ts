import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterJournalPublication1663700407696
  implements MigrationInterface
{
  name = 'AlterJournalPublication1663700407696';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "journal_publication" ALTER COLUMN "journal_title" TYPE character varying(200)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "journal_publication" ALTER COLUMN "journal_title" TYPE character varying(100)`,
    );
  }
}

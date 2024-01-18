import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterTableImportXml1705606892154 implements MigrationInterface {
  name = 'alterTableImportXml1705606892154';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "xml_imports" ADD COLUMN "reprocess_flag" BOOLEAN DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "xml_imports" DROP COLUMN "reprocess_flag"`,
    );
  }
}

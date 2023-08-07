import { MigrationInterface, QueryRunner } from 'typeorm';

export class importXmlRefactoring1683838256398 implements MigrationInterface {
  name = 'importXmlRefactoring1683838256398';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "xml_imports" ("id" character varying NOT NULL, "name" character varying(50) NOT NULL, "professor_name" character varying(100), "user" character varying(80) NOT NULL, "status" character varying NOT NULL, "included_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "started_at" TIMESTAMP WITH TIME ZONE, "finished_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_0f238745dc11afc1c574f717249" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "xml_imports"`);
  }
}

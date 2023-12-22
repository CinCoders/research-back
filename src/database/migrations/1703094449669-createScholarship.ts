import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateScholarship1703094449669 implements MigrationInterface {
  name = 'CreateScholarship1703094449669';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "scholarship" ("id" SERIAL NOT NULL, "name" character varying, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_90ab4b7111faf40fd3c788eac7b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "professor" ADD "scholarship_id" integer`,
    );

    await queryRunner.query(
      `ALTER TABLE "professor" ADD CONSTRAINT "FK_ecf3734ccd39b5a672178dddf1d" FOREIGN KEY ("scholarship_id") REFERENCES "scholarship"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professor" DROP CONSTRAINT "FK_ecf3734ccd39b5a672178dddf1d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professor" DROP COLUMN "scholarship_id"`,
    );
    await queryRunner.query(`DROP TABLE "scholarship"`);
  }
}

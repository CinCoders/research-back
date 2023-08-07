import { MigrationInterface, QueryRunner } from 'typeorm';

export class adviseeUpdate11662986604383 implements MigrationInterface {
  name = 'adviseeUpdate11662986604383';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "journal_publication" ADD "authors" character varying(1500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "conference_publication" ADD "authors" character varying(1500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "advisee" ADD "institution" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "advisee" ALTER COLUMN "type" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "advisee" ADD "title" character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "advisee" ADD "course" character varying(100)`,
    );
    await queryRunner.query(`ALTER TABLE "advisee" ADD "schoolarship" boolean`);
    await queryRunner.query(`ALTER TABLE "advisee" ADD "financierId" integer`);
    await queryRunner.query(
      `ALTER TABLE "advisee" ALTER COLUMN "name" TYPE character varying(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE "advisee" ADD CONSTRAINT "FK_812d377eb13dc1a3e9077ef2294" FOREIGN KEY ("financierId") REFERENCES "financier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "advisee" DROP CONSTRAINT "FK_812d377eb13dc1a3e9077ef2294"`,
    );
    await queryRunner.query(`ALTER TABLE "advisee" DROP COLUMN "financierId"`);
    await queryRunner.query(`ALTER TABLE "advisee" DROP COLUMN "schoolarship"`);
    await queryRunner.query(`ALTER TABLE "advisee" DROP COLUMN "course"`);
    await queryRunner.query(`ALTER TABLE "advisee" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "advisee" DROP COLUMN "institution"`);
    await queryRunner.query(
      `ALTER TABLE "journal_publication" DROP COLUMN "authors"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conference_publication" DROP COLUMN "authors"`,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDatabase1641912530758 implements MigrationInterface {
  name = 'CreateDatabase1641912530758';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "journal" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "issn" character varying(18) NOT NULL, "qualis" character varying(4), "is_top" boolean NOT NULL DEFAULT false, "official" boolean NOT NULL DEFAULT false, "derived_from_id" integer, CONSTRAINT "PK_396f862c229742e29f888b1abce" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "journal_publication" ("id" SERIAL NOT NULL, "title" character varying(500) NOT NULL, "year" integer NOT NULL, "doi" character varying(100), "is_top" boolean NOT NULL DEFAULT false, "issn" character varying(16), "qualis" character varying(4), "professor_id" integer, "journal_id" integer, CONSTRAINT "PK_40808690eb7b915046558c0f81b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "conference" ("id" SERIAL NOT NULL, "acronym" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "qualis" character varying(4), "is_top" boolean NOT NULL DEFAULT false, "official" boolean NOT NULL DEFAULT false, "derived_from_id" integer, CONSTRAINT "PK_e203a214f53b0eeefb3db00fdb2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "conference_publication" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "event" character varying(255) NOT NULL, "proceedings" character varying(255) NOT NULL, "year" integer, "is_top" boolean NOT NULL DEFAULT false,"qualis" character varying(4), "professor_id" integer, "conference_id" integer, CONSTRAINT "PK_1ae3322891b0f0497fd84cf209d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "financier" ("id" SERIAL NOT NULL, "acronym" character varying(10), "name" character varying(100), "code" character varying(100), CONSTRAINT "PK_bcfbe6740dfd460a1eebf7ee931" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "project_financier" ("id" SERIAL NOT NULL, "nature" character varying(50) NOT NULL, "project_id" integer, "financier_id" integer, CONSTRAINT "PK_7c7a8e841c01ca8df510f321984" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "project" ("id" SERIAL NOT NULL, "year" integer NOT NULL, "name" character varying(300) NOT NULL, "period_flag" character varying(15) NOT NULL, "professor_id" integer, CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "professor" ("id" SERIAL NOT NULL, "identifier" character varying(32), "name" character varying(100) NOT NULL, CONSTRAINT "UQ_8046e6fb490b365190dac78e8c6" UNIQUE ("identifier"), CONSTRAINT "PK_39a6c8f16280dc3bc3ffdc41e02" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "advisee" ("id" SERIAL NOT NULL, "type" character varying(255) NOT NULL, "degree" character varying(255) NOT NULL, "year_start" integer, "year_end" integer, "name" character varying(100) NOT NULL, "professor_id" integer, CONSTRAINT "PK_320c8ed3d2f909c90cf6dc24955" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "logs" ("id" SERIAL NOT NULL, "entity_type" character varying, "entity_id" integer, "message" text NOT NULL, "execution_context_host" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fb1b805f2f7795de79fa69340ba" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "journal" ADD CONSTRAINT "FK_5ea2c4a7844e321457a52d8dfd0" FOREIGN KEY ("derived_from_id") REFERENCES "journal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "conference" ADD CONSTRAINT "FK_2d809f506c3128612df446c40e9" FOREIGN KEY ("derived_from_id") REFERENCES "conference"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "journal_publication" ADD CONSTRAINT "FK_9c3f0fd2037da0572c6d0819d0d" FOREIGN KEY ("professor_id") REFERENCES "professor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "journal_publication" ADD CONSTRAINT "FK_d65a21f1756aca1b7b2fe946619" FOREIGN KEY ("journal_id") REFERENCES "journal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "conference_publication" ADD CONSTRAINT "FK_52f4f00c36e689a1b3e42804ca8" FOREIGN KEY ("professor_id") REFERENCES "professor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "conference_publication" ADD CONSTRAINT "FK_a7a19af453e9843f1e1dbd99c91" FOREIGN KEY ("conference_id") REFERENCES "conference"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_financier" ADD CONSTRAINT "FK_aa7b76370cd5b310a4a2769cfeb" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_financier" ADD CONSTRAINT "FK_7d1b6591047d40507ab553b87bb" FOREIGN KEY ("financier_id") REFERENCES "financier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_c564def4db838c143ec9ece5799" FOREIGN KEY ("professor_id") REFERENCES "professor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "advisee" ADD CONSTRAINT "FK_0ffcb8843391f18881f792bc7a7" FOREIGN KEY ("professor_id") REFERENCES "professor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "advisee" DROP CONSTRAINT "FK_0ffcb8843391f18881f792bc7a7"`);
    await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_c564def4db838c143ec9ece5799"`);
    await queryRunner.query(`ALTER TABLE "project_financier" DROP CONSTRAINT "FK_7d1b6591047d40507ab553b87bb"`);
    await queryRunner.query(`ALTER TABLE "project_financier" DROP CONSTRAINT "FK_aa7b76370cd5b310a4a2769cfeb"`);
    await queryRunner.query(`ALTER TABLE "conference_publication" DROP CONSTRAINT "FK_a7a19af453e9843f1e1dbd99c91"`);
    await queryRunner.query(`ALTER TABLE "conference_publication" DROP CONSTRAINT "FK_52f4f00c36e689a1b3e42804ca8"`);
    await queryRunner.query(`ALTER TABLE "journal_publication" DROP CONSTRAINT "FK_d65a21f1756aca1b7b2fe946619"`);
    await queryRunner.query(`ALTER TABLE "journal_publication" DROP CONSTRAINT "FK_9c3f0fd2037da0572c6d0819d0d"`);
    await queryRunner.query(`DROP TABLE "logs"`);
    await queryRunner.query(`DROP TABLE "advisee"`);
    await queryRunner.query(`DROP TABLE "professor"`);
    await queryRunner.query(`DROP TABLE "project"`);
    await queryRunner.query(`DROP TABLE "project_financier"`);
    await queryRunner.query(`DROP TABLE "financier"`);
    await queryRunner.query(`DROP TABLE "conference_publication"`);
    await queryRunner.query(`DROP TABLE "conference"`);
    await queryRunner.query(`DROP TABLE "journal_publication"`);
    await queryRunner.query(`DROP TABLE "journal"`);
  }
}

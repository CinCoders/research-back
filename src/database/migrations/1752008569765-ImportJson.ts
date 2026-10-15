import { MigrationInterface, QueryRunner } from "typeorm";

export class ImportJson1752008569765 implements MigrationInterface {
    name = 'ImportJson1752008569765'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "json_imports" ("id" character varying NOT NULL, "name" character varying(50) NOT NULL, "professor_name" character varying(100), "user" character varying(80) NOT NULL, "status" character varying NOT NULL, "stored_json" boolean NOT NULL, "included_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "started_at" TIMESTAMP WITH TIME ZONE, "finished_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_e3ff3132d473b0fa6b67badfb2d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "json_imports"`);
    }

}

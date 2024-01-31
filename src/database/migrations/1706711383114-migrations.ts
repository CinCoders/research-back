import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterPatentCategoryToNullable1706711383114
  implements MigrationInterface
{
  name = 'AlterPatentCategoryToNullable1706711383114';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patent" ALTER COLUMN "category" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patent" ALTER COLUMN "category" SET NOT NULL`,
    );
  }
}

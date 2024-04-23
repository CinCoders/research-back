import { QueryRunner } from 'typeorm';
import { Log } from './log.entity';
import { AppDataSource } from 'src/app.datasource';

const createLog = async (
  queryRunner: QueryRunner | undefined,
  entityType: string,
  message: string,
  entityId?: string,
  executionContextHost?: string,
) => {
  await AppDataSource.createQueryBuilder(queryRunner)
    .insert()
    .into(Log)
    .values({
      entityId: entityId,
      entityType: entityType,
      message: message,
      executionContextHost: executionContextHost,
    })
    .execute();
};

export default createLog;

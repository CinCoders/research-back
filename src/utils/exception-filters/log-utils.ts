import { Log } from './log.entity';
import { AppDataSource } from 'src/app.datasource';

const createLog = async (
  entityType: string,
  message: string,
  entityId?: string,
  executionContextHost?: string,
) => {
  await AppDataSource.createQueryBuilder()
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

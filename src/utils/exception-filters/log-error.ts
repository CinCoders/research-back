import { Log } from './log.entity';
import { AppDataSource } from 'src/app.datasource';

const logErrorToDatabase = async (
  err: unknown,
  entityType: string,
  entityId?: string,
) => {
  if (err instanceof Error) {
    await AppDataSource.createQueryBuilder()
      .insert()
      .into(Log)
      .values({
        entityId: entityId,
        entityType: entityType,
        message: err.message,
        executionContextHost: JSON.stringify(err),
      })
      .execute();
  } else {
    await AppDataSource.createQueryBuilder()
      .insert()
      .into(Log)
      .values({
        entityId: entityId,
        entityType: entityType,
        message: 'No error was thrown. Something went wrong.',
        executionContextHost: JSON.stringify(err),
      })
      .execute();
  }
};

export default logErrorToDatabase;

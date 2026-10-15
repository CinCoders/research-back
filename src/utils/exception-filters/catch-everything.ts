import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AppDataSource } from '../../app.datasource';
import { Log } from './log.entity';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    if (AppDataSource && AppDataSource.isInitialized) {
      try {
        const logsRepository = AppDataSource.getRepository(Log);
        let cache: any = [];

        const log: Log = logsRepository.create({
          entityId: '0',
          entityType: 'AllExceptions',
          message: JSON.stringify(exception),
          executionContextHost: JSON.stringify(host, (key, value) => {
            if (typeof value === 'object' && value !== null) {
              if (cache.includes(value)) return;

              cache.push(value);
            }
            return value;
          }),
        });
        cache = null;
        await logsRepository.save(log);
      } catch (err) {
        console.error('Failed to persist exception log:', err);
      }
    } else {
      console.warn('AppDataSource not initialized; skipping exception persistence.');
    }

    const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const response =
      exception instanceof HttpException ? exception.getResponse() : { message: 'Internal server error' };
    console.error('Exception caught by AllExceptionsFilter:', exception);

    const responseBody = {
      statusCode: httpStatus,
      response,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

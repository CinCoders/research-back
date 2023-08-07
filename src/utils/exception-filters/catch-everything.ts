import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { getRepository } from 'typeorm';
import { Log } from './log.entity';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const logsRepository = getRepository(Log);
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

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

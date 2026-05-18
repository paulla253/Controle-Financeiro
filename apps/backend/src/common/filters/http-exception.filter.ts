import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let error = 'InternalServerError';
    let details: unknown;

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
        error = exception.constructor.name;
      } else {
        const obj = res as Record<string, unknown>;
        error =
          typeof obj.error === 'string'
            ? obj.error
            : exception.constructor.name;
        if (Array.isArray(obj.message)) {
          message = 'Validation failed';
          details = obj.message;
        } else if (typeof obj.message === 'string') {
          message = obj.message;
        } else {
          message = exception.message;
        }
      }
    }

    this.logger.error(
      `${request.method} ${request.url} ${status}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const body: Record<string, unknown> = {
      statusCode: status,
      message,
      error,
    };
    if (details !== undefined) body.details = details;

    response.status(status).json(body);
  }
}

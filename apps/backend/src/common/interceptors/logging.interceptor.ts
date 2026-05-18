import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const { method, url } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = ctx.getResponse<Response>();
          const duration = Date.now() - start;
          this.logger.debug(`${method} ${url} ${res.statusCode} ${duration}ms`);
        },
        error: (err: unknown) => {
          const duration = Date.now() - start;
          const status = (err as { status?: number })?.status ?? 500;
          this.logger.debug(`${method} ${url} ${status} ${duration}ms`);
        },
      }),
    );
  }
}

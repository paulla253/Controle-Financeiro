import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { lastValueFrom } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

function buildContext(method = 'GET', url = '/api/v1/test', statusCode = 200) {
  const response = { statusCode };
  const request = { method, url };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext;
}

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    logSpy = jest
      .spyOn((interceptor as any).logger, 'debug')
      .mockImplementation(() => {});
  });

  it('passes through the observable value', async () => {
    const handler: CallHandler = { handle: () => of({ id: 1 }) };
    const result = await lastValueFrom(
      interceptor.intercept(buildContext(), handler),
    );
    expect(result).toEqual({ id: 1 });
  });

  it('logs method, route, status code and duration on success', async () => {
    const handler: CallHandler = { handle: () => of(null) };
    await lastValueFrom(
      interceptor.intercept(
        buildContext('POST', '/api/v1/categories', 201),
        handler,
      ),
    );

    expect(logSpy).toHaveBeenCalledTimes(1);
    const log: string = logSpy.mock.calls[0][0];
    expect(log).toContain('POST');
    expect(log).toContain('/api/v1/categories');
    expect(log).toContain('201');
    expect(log).toMatch(/\d+ms$/);
  });

  it('logs status 500 and re-throws on error', async () => {
    const err = new Error('boom');
    const handler: CallHandler = { handle: () => throwError(() => err) };

    await expect(
      lastValueFrom(
        interceptor.intercept(
          buildContext('DELETE', '/api/v1/expenses/1'),
          handler,
        ),
      ),
    ).rejects.toThrow('boom');

    expect(logSpy).toHaveBeenCalledTimes(1);
    const log: string = logSpy.mock.calls[0][0];
    expect(log).toContain('DELETE');
    expect(log).toContain('/api/v1/expenses/1');
    expect(log).toMatch(/\d+ms$/);
  });
});

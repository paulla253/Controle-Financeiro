import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

function buildHost(method = 'GET', url = '/test') {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const response = { status };
  const request = { method, url };
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    jest.spyOn((filter as any).logger, 'error').mockImplementation(() => {});
  });

  it('formats BadRequestException with array messages as validation payload', () => {
    const { host, status, json } = buildHost();
    filter.catch(new BadRequestException(['name must be a string']), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    const body = json.mock.calls[0][0];
    expect(body.statusCode).toBe(400);
    expect(body.message).toBe('Validation failed');
    expect(body.error).toBe('Bad Request');
    expect(body.details).toEqual(['name must be a string']);
  });

  it('formats ConflictException with string message', () => {
    const { host, status, json } = buildHost();
    filter.catch(new ConflictException('Category has expenses'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    const body = json.mock.calls[0][0];
    expect(body.statusCode).toBe(409);
    expect(body.message).toBe('Category has expenses');
    expect(body.error).toBe('Conflict');
    expect(body.details).toBeUndefined();
  });

  it('formats NotFoundException with string message', () => {
    const { host, status, json } = buildHost();
    filter.catch(new NotFoundException('Resource not found'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    const body = json.mock.calls[0][0];
    expect(body.statusCode).toBe(404);
    expect(body.message).toBe('Resource not found');
    expect(body.error).toBe('Not Found');
  });

  it('formats generic non-HTTP error as 500 InternalServerError', () => {
    const { host, status, json } = buildHost();
    filter.catch(new Error('Unexpected failure'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    const body = json.mock.calls[0][0];
    expect(body.statusCode).toBe(500);
    expect(body.message).toBe('Internal server error');
    expect(body.error).toBe('InternalServerError');
    expect(body.details).toBeUndefined();
  });
});

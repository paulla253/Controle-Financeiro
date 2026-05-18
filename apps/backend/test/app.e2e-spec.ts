import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import request from 'supertest';
import { App } from 'supertest/types';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { Init1746576000000 } from '../src/database/migrations/1746576000000-init';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [],
          migrations: [Init1746576000000],
          migrationsRun: true,
          synchronize: false,
          autoLoadEntities: true,
        }),
      ],
      providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 404 with standardized payload for unknown /api/v1 route', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/non-existent-route')
      .expect(404);

    expect(res.body).toMatchObject({
      statusCode: 404,
      message: expect.any(String),
      error: expect.any(String),
    });
    expect(res.body.details).toBeUndefined();
  });
});

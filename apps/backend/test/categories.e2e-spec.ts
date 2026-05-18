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
import { CategoriesModule } from '../src/categories/categories.module';
import { HAS_EXPENSES_PORT } from '../src/categories/ports/has-expenses.port';
import { Init1746576000000 } from '../src/database/migrations/1746576000000-init';

const hasExpensesPortMock = {
  categoryHasExpenses: jest.fn().mockResolvedValue(false),
};

describe('Categories (e2e)', () => {
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
        CategoriesModule,
      ],
      providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
    })
      .overrideProvider(HAS_EXPENSES_PORT)
      .useValue(hasExpensesPortMock)
      .compile();

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

  beforeEach(() => {
    hasExpensesPortMock.categoryHasExpenses.mockResolvedValue(false);
  });

  describe('POST /api/v1/categories (RF-001)', () => {
    it('creates a category and returns 201 with id and createdAt', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'Alimentação' })
        .expect(201);

      expect(res.body).toMatchObject({
        id: expect.any(Number),
        name: 'Alimentação',
        createdAt: expect.any(String),
      });
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({})
        .expect(400);

      expect(res.body).toMatchObject({ statusCode: 400 });
    });

    it('returns 400 when name is empty string', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: '' })
        .expect(400);

      expect(res.body).toMatchObject({ statusCode: 400 });
    });

    it('returns 400 when name exceeds 50 characters', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'A'.repeat(51) })
        .expect(400);

      expect(res.body).toMatchObject({ statusCode: 400 });
    });

    it('returns 409 on duplicate name (RF-003 via UNIQUE)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'Transporte' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'Transporte' })
        .expect(409);

      expect(res.body).toMatchObject({ statusCode: 409 });
    });

    it('returns 409 on duplicate name case-insensitive (NOCASE)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'Saúde' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'saúde' })
        .expect(409);

      expect(res.body).toMatchObject({ statusCode: 409 });
    });
  });

  describe('GET /api/v1/categories (RF-004)', () => {
    it('returns 200 with an array of categories', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/categories')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        createdAt: expect.any(String),
      });
    });
  });

  describe('DELETE /api/v1/categories/:id (RF-002, RF-003)', () => {
    it('returns 204 when category exists and has no expenses', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'Lazer' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/categories/${created.body.id}`)
        .expect(204);
    });

    it('returns 409 when category has associated expenses (RF-003)', async () => {
      hasExpensesPortMock.categoryHasExpenses.mockResolvedValue(true);

      const created = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'Educação' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .delete(`/api/v1/categories/${created.body.id}`)
        .expect(409);

      expect(res.body).toMatchObject({
        statusCode: 409,
        message: expect.any(String),
      });
    });

    it('returns 404 when category does not exist', async () => {
      const res = await request(app.getHttpServer())
        .delete('/api/v1/categories/99999')
        .expect(404);

      expect(res.body).toMatchObject({ statusCode: 404 });
    });

    it('returns 400 when id is not a number', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/categories/abc')
        .expect(400);
    });
  });
});

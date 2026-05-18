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
import { ExpensesModule } from '../src/expenses/expenses.module';
import { Init1746576000000 } from '../src/database/migrations/1746576000000-init';

describe('Expenses (e2e)', () => {
  let app: INestApplication<App>;
  let categoryId: number;

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
        ExpensesModule,
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

    const catRes = await request(app.getHttpServer())
      .post('/api/v1/categories')
      .send({ name: 'Alimentação' })
      .expect(201);
    categoryId = catRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/expenses (RF-005, RF-006, RF-007)', () => {
    it('creates an expense and returns 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/expenses')
        .send({ date: '15/01/2024', categoryId, amount: 150.5 })
        .expect(201);

      expect(res.body).toMatchObject({
        id: expect.any(Number),
        date: '2024-01-15',
        amount: expect.any(Number),
        categoryId,
        createdAt: expect.any(String),
      });
    });

    it('returns 400 when date format is invalid (RF-005)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/expenses')
        .send({ date: '2024-01-15', categoryId, amount: 100 })
        .expect(400);
    });

    it('returns 400 when amount is zero (RF-006)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/expenses')
        .send({ date: '15/01/2024', categoryId, amount: 0 })
        .expect(400);
    });

    it('returns 400 when amount is negative (RF-006)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/expenses')
        .send({ date: '15/01/2024', categoryId, amount: -50 })
        .expect(400);
    });

    it('returns 400 when categoryId does not exist (RF-007)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/expenses')
        .send({ date: '15/01/2024', categoryId: 99999, amount: 100 })
        .expect(400);

      expect(res.body).toMatchObject({ statusCode: 400 });
    });

    it('handles timezone edge case 01/01/2024', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/expenses')
        .send({ date: '01/01/2024', categoryId, amount: 10 })
        .expect(201);

      expect(res.body.date).toBe('2024-01-01');
    });

    it('handles timezone edge case 31/12/2024', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/expenses')
        .send({ date: '31/12/2024', categoryId, amount: 10 })
        .expect(201);

      expect(res.body.date).toBe('2024-12-31');
    });
  });

  describe('GET /api/v1/expenses (RF-009, RF-010)', () => {
    it('returns 200 with array ordered by date desc', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/expenses')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toMatchObject({
        id: expect.any(Number),
        date: expect.any(String),
        amount: expect.any(Number),
        categoryId: expect.any(Number),
      });

      for (let i = 1; i < res.body.length; i++) {
        expect(res.body[i - 1].date >= res.body[i].date).toBe(true);
      }
    });

    it('filters by year', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/expenses?year=2024')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((e: { date: string }) => {
        expect(e.date.startsWith('2024')).toBe(true);
      });
    });

    it('filters by month', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/expenses?month=1')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('filters by categoryId', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/expenses?categoryId=${categoryId}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((e: { categoryId: number }) => {
        expect(e.categoryId).toBe(categoryId);
      });
    });

    it('applies combined filters (year + month + categoryId)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/expenses?year=2024&month=1&categoryId=${categoryId}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('returns 400 for invalid month filter', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/expenses?month=13')
        .expect(400);
    });
  });

  describe('DELETE /api/v1/expenses/:id (RF-008)', () => {
    it('deletes an expense and returns 204', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/expenses')
        .send({ date: '10/06/2024', categoryId, amount: 50 })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/expenses/${created.body.id}`)
        .expect(204);
    });

    it('returns 404 when expense does not exist', async () => {
      const res = await request(app.getHttpServer())
        .delete('/api/v1/expenses/99999')
        .expect(404);

      expect(res.body).toMatchObject({ statusCode: 404 });
    });

    it('returns 400 when id is not a number', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/expenses/abc')
        .expect(400);
    });
  });

  describe('GET /api/v1/expenses/annual-summary (RF-017, RF-018)', () => {
    it('returns exactly 12 buckets for given year', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/expenses/annual-summary?year=2024')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(12);
    });

    it('buckets have month 1..12 in order', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/expenses/annual-summary?year=2024')
        .expect(200);

      res.body.forEach(
        (bucket: { month: number; total: number }, i: number) => {
          expect(bucket.month).toBe(i + 1);
          expect(typeof bucket.total).toBe('number');
        },
      );
    });

    it('fills zero for months with no expenses', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/expenses/annual-summary?year=2099')
        .expect(200);

      expect(res.body).toHaveLength(12);
      res.body.forEach((bucket: { total: number }) => {
        expect(bucket.total).toBe(0);
      });
    });

    it('returns 400 when year is missing', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/expenses/annual-summary')
        .expect(400);
    });
  });

  describe('GET /api/v1/expenses/current-month-summary (RF-019, RF-020)', () => {
    it('returns an array (RF-019)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/expenses/current-month-summary')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('each item has category, total and percentage', async () => {
      const secondCatRes = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'SummaryCat' })
        .expect(201);
      const secondCatId = secondCatRes.body.id;

      const now = new Date();
      const day = String(now.getUTCDate()).padStart(2, '0');
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const year = String(now.getUTCFullYear());
      const todayBR = `${day}/${month}/${year}`;

      await request(app.getHttpServer())
        .post('/api/v1/expenses')
        .send({ date: todayBR, categoryId: secondCatId, amount: 300 })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/v1/expenses/current-month-summary')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const entry = res.body.find(
        (e: { category: string }) => e.category === 'SummaryCat',
      );
      expect(entry).toBeDefined();
      expect(entry).toMatchObject({
        category: expect.any(String),
        total: expect.any(Number),
        percentage: expect.any(Number),
      });
    });
  });

  describe('Categories regression: 409 with real expenses (RF-003)', () => {
    it('returns 409 when trying to delete a category that has expenses', async () => {
      const catRes = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'WithExpense' })
        .expect(201);
      const catWithExpenseId = catRes.body.id;

      await request(app.getHttpServer())
        .post('/api/v1/expenses')
        .send({ date: '15/06/2024', categoryId: catWithExpenseId, amount: 100 })
        .expect(201);

      const res = await request(app.getHttpServer())
        .delete(`/api/v1/categories/${catWithExpenseId}`)
        .expect(409);

      expect(res.body).toMatchObject({ statusCode: 409 });
    });

    it('allows deleting a category with no expenses', async () => {
      const catRes = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'EmptyCat' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/categories/${catRes.body.id}`)
        .expect(204);
    });
  });
});

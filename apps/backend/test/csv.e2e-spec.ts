import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { CategoriesModule } from '../src/categories/categories.module';
import { ExpensesModule } from '../src/expenses/expenses.module';
import { CsvModule } from '../src/csv/csv.module';
import { Expense } from '../src/expenses/expense.entity';
import { Init1746576000000 } from '../src/database/migrations/1746576000000-init';

const BOM = '﻿';

function csvBuffer(content: string, withBom = false): Buffer {
  return Buffer.from((withBom ? BOM : '') + content, 'utf-8');
}

describe('CSV (e2e)', () => {
  let app: INestApplication<App>;
  let expenseRepository: Repository<Expense>;

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
        CsvModule,
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

    expenseRepository = moduleFixture.get<Repository<Expense>>(
      getRepositoryToken(Expense),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/csv/import (RF-011..014)', () => {
    it('happy path: imports valid CSV with comma delimiter', async () => {
      const csv = csvBuffer(
        'Data,Categoria,Valor\n01/01/2024,Alimentação,150.00\n15/06/2024,Transporte,200.50',
      );

      const res = await request(app.getHttpServer())
        .post('/api/v1/csv/import')
        .attach('file', csv, {
          filename: 'import.csv',
          contentType: 'text/csv',
        })
        .expect(200);

      expect(res.body).toEqual({ imported: 2 });
      const count = await expenseRepository.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    it('happy path: imports valid CSV with semicolon delimiter', async () => {
      const before = await expenseRepository.count();
      const csv = csvBuffer('Data;Categoria;Valor\n10/03/2024;Lazer;99,90');

      const res = await request(app.getHttpServer())
        .post('/api/v1/csv/import')
        .attach('file', csv, {
          filename: 'import.csv',
          contentType: 'text/csv',
        })
        .expect(200);

      expect(res.body).toEqual({ imported: 1 });
      const after = await expenseRepository.count();
      expect(after).toBe(before + 1);
    });

    it('happy path: accepts CSV with BOM', async () => {
      const before = await expenseRepository.count();
      const csv = csvBuffer(
        'Data,Categoria,Valor\n25/12/2024,Educação,500.00',
        true,
      );

      const res = await request(app.getHttpServer())
        .post('/api/v1/csv/import')
        .attach('file', csv, {
          filename: 'import.csv',
          contentType: 'text/csv',
        })
        .expect(200);

      expect(res.body).toEqual({ imported: 1 });
      const after = await expenseRepository.count();
      expect(after).toBe(before + 1);
    });

    it('auto-creates category when it does not exist (RF-012)', async () => {
      const uniqueName = `AutoCat_${Date.now()}`;
      const csv = csvBuffer(
        `Data,Categoria,Valor\n01/02/2024,${uniqueName},75.00`,
      );

      const res = await request(app.getHttpServer())
        .post('/api/v1/csv/import')
        .attach('file', csv, {
          filename: 'import.csv',
          contentType: 'text/csv',
        })
        .expect(200);

      expect(res.body).toEqual({ imported: 1 });

      const catRes = await request(app.getHttpServer())
        .get('/api/v1/categories')
        .expect(200);
      const names = catRes.body.map((c: { name: string }) => c.name);
      expect(names).toContain(uniqueName);
    });

    it('aborts import on invalid date (first line) — 0 inserts (RF-013)', async () => {
      const before = await expenseRepository.count();
      const csv = csvBuffer(
        'Data,Categoria,Valor\n32/01/2024,Alimentação,100,00\n01/01/2024,Alimentação,50,00',
      );

      const res = await request(app.getHttpServer())
        .post('/api/v1/csv/import')
        .attach('file', csv, {
          filename: 'import.csv',
          contentType: 'text/csv',
        })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      const after = await expenseRepository.count();
      expect(after).toBe(before);
    });

    it('aborts import on invalid date (middle line) — 0 inserts (RF-013)', async () => {
      const before = await expenseRepository.count();
      const csv = csvBuffer(
        'Data,Categoria,Valor\n01/01/2024,Alimentação,100,00\nNOT-A-DATE,Alimentação,200,00\n10/05/2024,Alimentação,50,00',
      );

      const res = await request(app.getHttpServer())
        .post('/api/v1/csv/import')
        .attach('file', csv, {
          filename: 'import.csv',
          contentType: 'text/csv',
        })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      const after = await expenseRepository.count();
      expect(after).toBe(before);
    });

    it('aborts import on invalid date (last line) — 0 inserts (RF-013)', async () => {
      const before = await expenseRepository.count();
      const csv = csvBuffer(
        'Data,Categoria,Valor\n01/01/2024,Alimentação,100,00\n10/05/2024,Alimentação,50,00\nBAD,Alimentação,75,00',
      );

      const res = await request(app.getHttpServer())
        .post('/api/v1/csv/import')
        .attach('file', csv, {
          filename: 'import.csv',
          contentType: 'text/csv',
        })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      const after = await expenseRepository.count();
      expect(after).toBe(before);
    });

    it('aborts import on invalid amount — 0 inserts', async () => {
      const before = await expenseRepository.count();
      const csv = csvBuffer(
        'Data,Categoria,Valor\n01/01/2024,Alimentação,0.00',
      );

      await request(app.getHttpServer())
        .post('/api/v1/csv/import')
        .attach('file', csv, {
          filename: 'import.csv',
          contentType: 'text/csv',
        })
        .expect(400);

      const after = await expenseRepository.count();
      expect(after).toBe(before);
    });

    it('returns 400 when no file is sent', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/csv/import')
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });

    it('returns 200 with imported count confirmation (RF-014)', async () => {
      const csv = csvBuffer(
        'Data,Categoria,Valor\n05/05/2024,Saúde,300.00\n06/05/2024,Saúde,150.00\n07/05/2024,Saúde,75.00',
      );

      const res = await request(app.getHttpServer())
        .post('/api/v1/csv/import')
        .attach('file', csv, {
          filename: 'import.csv',
          contentType: 'text/csv',
        })
        .expect(200);

      expect(res.body).toEqual({ imported: 3 });
    });
  });

  describe('GET /api/v1/csv/export (RF-015)', () => {
    it('returns text/csv with BOM as first bytes', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/csv/export')
        .expect(200);

      expect(res.headers['content-type']).toMatch(/text\/csv/);
      expect(res.headers['content-disposition']).toMatch(/attachment/);

      const body: Buffer = res.body as Buffer;
      const buf = Buffer.isBuffer(body)
        ? body
        : Buffer.from(res.text ?? '', 'utf-8');
      expect(buf[0]).toBe(0xef);
      expect(buf[1]).toBe(0xbb);
      expect(buf[2]).toBe(0xbf);
    });

    it('returns CSV with correct headers', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/csv/export')
        .buffer(true)
        .parse((res, callback) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => callback(null, Buffer.concat(chunks)));
        });

      const content = (res.body as Buffer).toString('utf-8').replace(BOM, '');
      const firstLine = content.split('\n')[0];
      expect(firstLine).toContain('Data');
      expect(firstLine).toContain('Categoria');
      expect(firstLine).toContain('Valor');
    });

    it('returns dates in DD/MM/AAAA format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/csv/import')
        .attach(
          'file',
          csvBuffer('Data,Categoria,Valor\n15/06/2024,ExportTestCat,777.00'),
          { filename: 'imp.csv', contentType: 'text/csv' },
        )
        .expect(200);

      const res = await request(app.getHttpServer())
        .get('/api/v1/csv/export')
        .buffer(true)
        .parse((res, callback) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => callback(null, Buffer.concat(chunks)));
        });

      const content = (res.body as Buffer).toString('utf-8');
      expect(content).toContain('15/06/2024');
    });

    it('returns amounts in pt-BR format', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/csv/export')
        .buffer(true)
        .parse((res, callback) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => callback(null, Buffer.concat(chunks)));
        });

      const content = (res.body as Buffer).toString('utf-8');
      expect(content).toMatch(/\d{1,3}(\.?\d{3})*,\d{2}/);
    });
  });
});

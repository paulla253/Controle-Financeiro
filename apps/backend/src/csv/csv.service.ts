import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { Category } from '../categories/category.entity';
import { Expense } from '../expenses/expense.entity';
import { parseBRDate, formatBRDate } from '../expenses/utils/date';

const BOM = '﻿';

interface CsvRow {
  Data: string;
  Categoria: string;
  Valor: string;
}

function detectDelimiter(content: string): string {
  const firstLine = content.split('\n')[0];
  return firstLine.includes(';') ? ';' : ',';
}

function parseBRAmount(raw: string): number {
  const trimmed = raw.trim();
  if (trimmed.includes(',')) {
    // BR format: 1.234,56 or 150,00
    const normalized = trimmed.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized);
  }
  // US/plain format: 1234.56 or 150.00 or 150
  return parseFloat(trimmed);
}

function formatBRAmount(amount: number): string {
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function isValidIsoDate(isoDate: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;
  const d = new Date(isoDate + 'T00:00:00Z');
  return !isNaN(d.getTime());
}

@Injectable()
export class CsvService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    private readonly dataSource: DataSource,
  ) {}

  async import(buffer: Buffer): Promise<{ imported: number }> {
    let rows: CsvRow[];
    try {
      const content = buffer.toString('utf-8');
      const delimiter = detectDelimiter(
        content.startsWith('﻿') ? content.slice(1) : content,
      );
      rows = parse(buffer, {
        bom: true,
        delimiter,
        columns: true,
        trim: true,
        skip_empty_lines: true,
      });
    } catch {
      throw new BadRequestException({
        message: 'Failed to parse CSV file',
        line: 0,
        reason: 'Invalid CSV format',
      });
    }

    if (rows.length === 0) {
      return { imported: 0 };
    }

    const validatedRows: {
      isoDate: string;
      amount: number;
      categoria: string;
    }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const lineNumber = i + 2;
      const row = rows[i];

      const dataRaw = row['Data'] ?? row['data'] ?? '';
      const categoriaRaw = row['Categoria'] ?? row['categoria'] ?? '';
      const valorRaw = row['Valor'] ?? row['valor'] ?? '';

      if (!dataRaw) {
        throw new BadRequestException({
          message: `Line ${lineNumber}: missing Data column`,
          line: lineNumber,
          reason: 'Missing Data column',
        });
      }

      if (!categoriaRaw) {
        throw new BadRequestException({
          message: `Line ${lineNumber}: missing Categoria column`,
          line: lineNumber,
          reason: 'Missing Categoria column',
        });
      }

      if (!valorRaw) {
        throw new BadRequestException({
          message: `Line ${lineNumber}: missing Valor column`,
          line: lineNumber,
          reason: 'Missing Valor column',
        });
      }

      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dataRaw.trim())) {
        throw new BadRequestException({
          message: `Line ${lineNumber}: invalid date format "${dataRaw}"`,
          line: lineNumber,
          reason: 'Date must be in DD/MM/AAAA format',
        });
      }

      const isoDate = parseBRDate(dataRaw.trim());
      if (!isValidIsoDate(isoDate)) {
        throw new BadRequestException({
          message: `Line ${lineNumber}: invalid date "${dataRaw}"`,
          line: lineNumber,
          reason: 'Date is not a valid calendar date',
        });
      }

      const amount = parseBRAmount(valorRaw);
      if (isNaN(amount) || amount <= 0) {
        throw new BadRequestException({
          message: `Line ${lineNumber}: invalid amount "${valorRaw}"`,
          line: lineNumber,
          reason: 'Amount must be a positive number',
        });
      }

      validatedRows.push({ isoDate, amount, categoria: categoriaRaw.trim() });
    }

    await this.dataSource.transaction(async (manager) => {
      const categoryRepo = manager.getRepository(Category);
      const expenseRepo = manager.getRepository(Expense);

      const categoryCache = new Map<string, number>();

      for (const row of validatedRows) {
        const lowerName = row.categoria.toLowerCase();

        if (!categoryCache.has(lowerName)) {
          await categoryRepo
            .createQueryBuilder()
            .insert()
            .into(Category)
            .values({ name: row.categoria })
            .orIgnore()
            .execute();

          const found = await categoryRepo
            .createQueryBuilder('c')
            .where('LOWER(c.name) = LOWER(:name)', { name: row.categoria })
            .getOne();

          if (!found) {
            throw new BadRequestException({
              message: `Failed to resolve category "${row.categoria}"`,
              line: 0,
              reason: 'Category resolution failed',
            });
          }

          categoryCache.set(lowerName, found.id);
        }

        const categoryId = categoryCache.get(lowerName)!;
        const expense = expenseRepo.create({
          date: row.isoDate,
          amount: row.amount,
          categoryId,
        });
        await expenseRepo.save(expense);
      }
    });

    return { imported: validatedRows.length };
  }

  async export(): Promise<Buffer> {
    const expenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.category', 'category')
      .orderBy('expense.date', 'ASC')
      .addOrderBy('expense.id', 'ASC')
      .getMany();

    const records = expenses.map((e) => ({
      Data: formatBRDate(e.date),
      Categoria: e.category?.name ?? '',
      Valor: formatBRAmount(Number(e.amount)),
    }));

    const csv = stringify(records, {
      header: true,
      columns: ['Data', 'Categoria', 'Valor'],
    });

    return Buffer.from(BOM + csv, 'utf-8');
  }
}

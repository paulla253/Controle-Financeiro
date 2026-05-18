import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './expense.entity';
import { Category } from '../categories/category.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { QueryExpensesDto } from './dto/query-expenses.dto';
import { parseBRDate } from './utils/date';

export interface MonthSummaryDto {
  month: number;
  total: number;
}

export interface CategorySummaryDto {
  category: string;
  total: number;
  percentage: number;
}

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateExpenseDto): Promise<Expense> {
    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new BadRequestException(
        `Category with id ${dto.categoryId} not found`,
      );
    }
    const isoDate = parseBRDate(dto.date);
    const expense = this.expenseRepository.create({
      date: isoDate,
      amount: dto.amount,
      categoryId: dto.categoryId,
    });
    return this.expenseRepository.save(expense);
  }

  async findAll(filters: QueryExpensesDto): Promise<Expense[]> {
    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.category', 'category')
      .orderBy('expense.date', 'DESC')
      .addOrderBy('expense.id', 'DESC');

    if (filters.year !== undefined) {
      query.andWhere(`strftime('%Y', expense.date) = :year`, {
        year: String(filters.year),
      });
    }

    if (filters.month !== undefined) {
      query.andWhere(`strftime('%m', expense.date) = :month`, {
        month: String(filters.month).padStart(2, '0'),
      });
    }

    if (filters.categoryId !== undefined) {
      query.andWhere('expense.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    return query.getMany();
  }

  async remove(id: number): Promise<void> {
    const expense = await this.expenseRepository.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException(`Expense with id ${id} not found`);
    }
    await this.expenseRepository.delete(id);
  }

  async annualSummary(year: number): Promise<MonthSummaryDto[]> {
    const rows = await this.expenseRepository
      .createQueryBuilder('expense')
      .select(`CAST(strftime('%m', expense.date) AS INTEGER)`, 'month')
      .addSelect('SUM(expense.amount)', 'total')
      .where(`strftime('%Y', expense.date) = :year`, { year: String(year) })
      .groupBy(`strftime('%m', expense.date)`)
      .getRawMany<{ month: number; total: string }>();

    const map = new Map<number, number>();
    for (const row of rows) {
      map.set(Number(row.month), Number(row.total));
    }

    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: Number((map.get(i + 1) ?? 0).toFixed(2)),
    }));
  }

  async currentMonthSummary(): Promise<CategorySummaryDto[]> {
    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');

    const rows = await this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoin('expense.category', 'category')
      .select('category.name', 'category')
      .addSelect('SUM(expense.amount)', 'total')
      .where(`strftime('%Y', expense.date) = :year`, { year })
      .andWhere(`strftime('%m', expense.date) = :month`, { month })
      .groupBy('expense.categoryId')
      .getRawMany<{ category: string; total: string }>();

    if (rows.length === 0) return [];

    const grandTotal = rows.reduce((sum, r) => sum + Number(r.total), 0);

    return rows.map((r) => ({
      category: r.category,
      total: Number(Number(r.total).toFixed(2)),
      percentage: Number(((Number(r.total) / grandTotal) * 100).toFixed(2)),
    }));
  }
}

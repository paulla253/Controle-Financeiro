import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Expense } from './expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';
import { Category } from '../categories/category.entity';
import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private dataSource: DataSource,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const { categoryId, ...expenseData } = createExpenseDto;
    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    const expense = this.expenseRepository.create({
      ...expenseData,
      category,
      date: new Date(),
    });

    return this.expenseRepository.save(expense);
  }

  async findAll(filterDto: FilterExpenseDto): Promise<Expense[]> {
    const { from, to, categoryId } = filterDto;
    const where: any = {};

    if (from && to) {
      where.date = Between(new Date(from), new Date(to));
    } else if (from) {
      where.date = MoreThanOrEqual(new Date(from));
    } else if (to) {
      where.date = LessThanOrEqual(new Date(to));
    }

    if (categoryId) {
      where.category = { id: parseInt(categoryId, 10) };
    }

    return this.expenseRepository.find({
      where,
      relations: ['category'],
    });
  }

  async exportExpenses(): Promise<string> {
    const expenses = await this.findAll({});

    const data = expenses.map(expense => ({
      Data: expense.date.toLocaleDateString('pt-BR'),
      Categoria: expense.category.name,
      Valor: expense.amount,
    }));

    const columns = ['Data', 'Categoria', 'Valor'];

    return stringify(data, { header: true, columns });
  }

  async importExpenses(csvContent: string): Promise<void> {
    await this.dataSource.transaction(async transactionalEntityManager => {
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      if (!records || records.length === 0) {
        throw new BadRequestException('CSV content is empty or invalid.');
      }

      const expensesToCreate: Expense[] = [];

      for (const record of records) {
        const dateStr = record['Data'];
        const categoryName = record['Categoria'];
        const amountStr = record['Valor'];

        // 1. Validate Data
        if (!dateStr || !categoryName || !amountStr) {
          throw new BadRequestException(
            `Missing data in row: Data="${dateStr}", Categoria="${categoryName}", Valor="${amountStr}"`,
          );
        }

        const [day, month, year] = dateStr.split('/').map(Number);
        if (isNaN(day) || isNaN(month) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31) {
            throw new BadRequestException(`Invalid date format (DD/MM/YYYY) in row for date: ${dateStr}`);
        }
        const date = new Date(year, month - 1, day);
        if (isNaN(date.getTime())) { // Check if date is valid
            throw new BadRequestException(`Invalid date: ${dateStr}`);
        }

        const amount = parseFloat(amountStr.replace(',', '.'));
        if (isNaN(amount) || amount <= 0) {
          throw new BadRequestException(`Invalid amount in row for amount: ${amountStr}`);
        }

        // 2. Find or Create Category
        let category = await transactionalEntityManager.findOne(Category, { where: { name: categoryName } });
        if (!category) {
          category = transactionalEntityManager.create(Category, { name: categoryName });
          await transactionalEntityManager.save(category);
        }

        // 3. Create Expense
        const expense = transactionalEntityManager.create(Expense, {
          date: date,
          amount: amount,
          category: category,
        });
        expensesToCreate.push(expense);
      }
      await transactionalEntityManager.save(expensesToCreate);
    });
  }
}

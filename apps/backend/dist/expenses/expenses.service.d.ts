import { Repository, DataSource } from 'typeorm';
import { Expense } from './expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';
import { Category } from '../categories/category.entity';
export declare class ExpensesService {
    private readonly expenseRepository;
    private readonly categoryRepository;
    private dataSource;
    constructor(expenseRepository: Repository<Expense>, categoryRepository: Repository<Category>, dataSource: DataSource);
    create(createExpenseDto: CreateExpenseDto): Promise<Expense>;
    findAll(filterDto: FilterExpenseDto): Promise<Expense[]>;
    exportExpenses(): Promise<string>;
    importExpenses(csvContent: string): Promise<void>;
}

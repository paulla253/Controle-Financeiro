import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';
import { Expense } from './expense.entity';
import { Response } from 'express';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    create(createExpenseDto: CreateExpenseDto): Promise<Expense>;
    findAll(filterDto: FilterExpenseDto): Promise<Expense[]>;
    export(res: Response): Promise<void>;
    import(file: Express.Multer.File): Promise<{
        message: string;
    }>;
}

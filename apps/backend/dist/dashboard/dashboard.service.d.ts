import { Repository } from 'typeorm';
import { Expense } from '../expenses/expense.entity';
import { DashboardDataDto, AnnualSpendingDto } from './dto/dashboard-data.dto';
export declare class DashboardService {
    private readonly expenseRepository;
    constructor(expenseRepository: Repository<Expense>);
    getDashboardData(month?: number, year?: number): Promise<DashboardDataDto>;
    getAnnualSpending(year: number): Promise<AnnualSpendingDto[]>;
}

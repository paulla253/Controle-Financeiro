import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Raw } from 'typeorm';
import { Expense } from '../expenses/expense.entity';
import { DashboardDataDto, SpendingByCategory, AnnualSpendingDto } from './dto/dashboard-data.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async getDashboardData(month?: number, year?: number): Promise<DashboardDataDto> {
    const now = new Date();
    const targetMonth = month !== undefined ? month - 1 : now.getMonth(); // Month is 0-indexed in Date object
    const targetYear = year || now.getFullYear();

    const firstDay = new Date(targetYear, targetMonth, 1);
    const lastDay = new Date(targetYear, targetMonth + 1, 0);

    const expenses = await this.expenseRepository.find({
      where: {
        date: Between(firstDay, lastDay),
      },
      relations: ['category'],
    });

    const totalSpentThisMonth = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const spendingByCategoryMap = new Map<number, SpendingByCategory>();

    for (const expense of expenses) {
      if (!expense.category) continue;

      const categoryId = expense.category.id;
      if (!spendingByCategoryMap.has(categoryId)) {
        spendingByCategoryMap.set(categoryId, {
          categoryId: categoryId,
          categoryName: expense.category.name,
          total: 0,
        });
      }
      const categorySpending = spendingByCategoryMap.get(categoryId);
      categorySpending.total += expense.amount;
    }

    const spendingByCategory = Array.from(spendingByCategoryMap.values());

    return {
      totalSpentThisMonth,
      spendingByCategory,
    };
  }

  async getAnnualSpending(year: number): Promise<AnnualSpendingDto[]> {
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const annualSpending = [];
    for (let i = 0; i < 12; i++) {
      annualSpending.push({ month: monthNames[i], total: 0 });
    }

    const expenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('CAST(strftime("%m", expense.date) AS INTEGER)', 'month')
      .addSelect('SUM(expense.amount)', 'total')
      .where('CAST(strftime("%Y", expense.date) AS INTEGER) = :year', { year })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    expenses.forEach((expense) => {
      const monthIndex = expense.month - 1;
      if (annualSpending[monthIndex]) {
        annualSpending[monthIndex].total = parseFloat(expense.total);
      }
    });

    return annualSpending;
  }
}

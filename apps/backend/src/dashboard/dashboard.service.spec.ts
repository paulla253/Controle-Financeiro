import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DashboardService } from './dashboard.service';
import { Expense } from '../expenses/expense.entity';

describe('DashboardService', () => {
  let service: DashboardService;
  let expenseRepository: Repository<Expense>;

  const mockExpenseRepository = {
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(Expense),
          useValue: mockExpenseRepository,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    expenseRepository = module.get<Repository<Expense>>(getRepositoryToken(Expense));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardData', () => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-indexed
    const currentYear = now.getFullYear();

    it('should calculate dashboard data correctly for the current month by default', async () => {
      const category1 = { id: 1, name: 'Food' };
      const category2 = { id: 2, name: 'Transport' };
      const expenses = [
        { id: 1, description: 'Lunch', amount: 20, category: category1, date: new Date(currentYear, currentMonth, 15) },
        { id: 2, description: 'Bus', amount: 5, category: category2, date: new Date(currentYear, currentMonth, 10) },
        { id: 3, description: 'Dinner', amount: 30, category: category1, date: new Date(currentYear, currentMonth, 20) },
      ];

      mockExpenseRepository.find.mockResolvedValue(expenses);

      const result = await service.getDashboardData();

      expect(mockExpenseRepository.find).toHaveBeenCalledWith({
        where: {
          date: Between(new Date(currentYear, currentMonth, 1), new Date(currentYear, currentMonth + 1, 0)),
        },
        relations: ['category'],
      });
      expect(result.totalSpentThisMonth).toBe(55);
      expect(result.spendingByCategory).toHaveLength(2);
    });

    it('should return zero values when there are no expenses for the current month by default', async () => {
      mockExpenseRepository.find.mockResolvedValue([]);

      const result = await service.getDashboardData();

      expect(result.totalSpentThisMonth).toBe(0);
      expect(result.spendingByCategory).toHaveLength(0);
    });

    it('should calculate dashboard data correctly for a specific month and year', async () => {
      const targetMonth = 5; // May (1-indexed)
      const targetYear = 2023;
      const category1 = { id: 1, name: 'Food' };
      const expenses = [
        { id: 4, description: 'Groceries', amount: 150, category: category1, date: new Date(targetYear, targetMonth - 1, 10) },
      ];

      mockExpenseRepository.find.mockResolvedValue(expenses);

      const result = await service.getDashboardData(targetMonth, targetYear);

      expect(mockExpenseRepository.find).toHaveBeenCalledWith({
        where: {
          date: Between(new Date(targetYear, targetMonth - 1, 1), new Date(targetYear, targetMonth, 0)),
        },
        relations: ['category'],
      });
      expect(result.totalSpentThisMonth).toBe(150);
      expect(result.spendingByCategory).toHaveLength(1);
    });

    it('should return zero values when no expenses for a specific month and year', async () => {
      mockExpenseRepository.find.mockResolvedValue([]);

      const result = await service.getDashboardData(7, 2022); // July 2022

      expect(result.totalSpentThisMonth).toBe(0);
      expect(result.spendingByCategory).toHaveLength(0);
    });

    it('should use current year if only month is provided', async () => {
      const targetMonth = 6; // June (1-indexed)
      const expenses = [
        { id: 5, description: 'Utilities', amount: 80, category: { id: 3, name: 'Bills' }, date: new Date(currentYear, targetMonth - 1, 5) },
      ];

      mockExpenseRepository.find.mockResolvedValue(expenses);

      await service.getDashboardData(targetMonth);

      expect(mockExpenseRepository.find).toHaveBeenCalledWith({
        where: {
          date: Between(new Date(currentYear, targetMonth - 1, 1), new Date(currentYear, targetMonth, 0)),
        },
        relations: ['category'],
      });
    });

    it('should use current month if only year is provided', async () => {
      const targetYear = 2021;
      const expenses = [
        { id: 6, description: 'Rent', amount: 1000, category: { id: 4, name: 'Housing' }, date: new Date(targetYear, currentMonth, 1) },
      ];

      mockExpenseRepository.find.mockResolvedValue(expenses);

      await service.getDashboardData(undefined, targetYear);

      expect(mockExpenseRepository.find).toHaveBeenCalledWith({
        where: {
          date: Between(new Date(targetYear, currentMonth, 1), new Date(targetYear, currentMonth + 1, 0)),
        },
        relations: ['category'],
      });
    });
  });

  describe('getAnnualSpending', () => {
    it('should return annual spending data correctly', async () => {
      const mockRawData = [
        { month: 1, total: '100.50' },
        { month: 3, total: '200.00' },
        { month: 12, total: '50.75' },
      ];

      jest.spyOn(mockExpenseRepository, 'createQueryBuilder').mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValueOnce(mockRawData),
      } as any); // Cast to any to satisfy TypeScript for chained methods

      const result = await service.getAnnualSpending();

      expect(result).toHaveLength(12);
      expect(result[0]).toEqual({ month: 1, total: 100.50 });
      expect(result[1]).toEqual({ month: 2, total: 0 });
      expect(result[2]).toEqual({ month: 3, total: 200.00 });
      expect(result[11]).toEqual({ month: 12, total: 50.75 });
    });

    it('should return zero for all months if no expenses are found', async () => {
      jest.spyOn(mockExpenseRepository, 'createQueryBuilder').mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValueOnce([]),
      } as any);

      const result = await service.getAnnualSpending();

      expect(result).toHaveLength(12);
      result.forEach(monthData => {
        expect(monthData.total).toBe(0);
      });
    });
  });
});

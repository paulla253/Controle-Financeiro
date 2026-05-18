import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { Expense } from './expense.entity';
import { Category } from '../categories/category.entity';

const mockExpense = {
  id: 1,
  date: '2024-01-15',
  amount: 150.5,
  categoryId: 1,
  createdAt: new Date(),
  category: { id: 1, name: 'Alimentação', createdAt: new Date() },
};

const mockCategory = { id: 1, name: 'Alimentação', createdAt: new Date() };

const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  leftJoin: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  addOrderBy: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
  getRawMany: jest.fn(),
};

const mockExpenseRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

const mockCategoryRepo = {
  findOne: jest.fn(),
};

describe('ExpensesService', () => {
  let service: ExpensesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockExpenseRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: getRepositoryToken(Expense), useValue: mockExpenseRepo },
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
  });

  describe('create', () => {
    it('creates and returns an expense', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockExpenseRepo.create.mockReturnValue(mockExpense);
      mockExpenseRepo.save.mockResolvedValue(mockExpense);

      const result = await service.create({
        date: '15/01/2024',
        categoryId: 1,
        amount: 150.5,
      });

      expect(mockCategoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockExpenseRepo.create).toHaveBeenCalledWith({
        date: '2024-01-15',
        amount: 150.5,
        categoryId: 1,
      });
      expect(result).toEqual(mockExpense);
    });

    it('throws BadRequestException when categoryId does not exist', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create({ date: '15/01/2024', categoryId: 999, amount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('converts BR date to ISO before saving', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockExpenseRepo.create.mockReturnValue({});
      mockExpenseRepo.save.mockResolvedValue(mockExpense);

      await service.create({ date: '01/01/2024', categoryId: 1, amount: 50 });

      expect(mockExpenseRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ date: '2024-01-01' }),
      );
    });

    it('converts 31/12/2024 to 2024-12-31 (timezone edge)', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockExpenseRepo.create.mockReturnValue({});
      mockExpenseRepo.save.mockResolvedValue(mockExpense);

      await service.create({ date: '31/12/2024', categoryId: 1, amount: 50 });

      expect(mockExpenseRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ date: '2024-12-31' }),
      );
    });
  });

  describe('findAll', () => {
    it('returns all expenses without filters', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockExpense]);

      const result = await service.findAll({});

      expect(mockExpenseRepo.createQueryBuilder).toHaveBeenCalledWith(
        'expense',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalled();
      expect(result).toEqual([mockExpense]);
    });

    it('applies year filter', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll({ year: 2024 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('strftime'),
        expect.objectContaining({ year: '2024' }),
      );
    });

    it('applies month filter with zero-padding', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll({ month: 3 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('strftime'),
        expect.objectContaining({ month: '03' }),
      );
    });

    it('applies categoryId filter', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll({ categoryId: 2 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('categoryId'),
        expect.objectContaining({ categoryId: 2 }),
      );
    });

    it('applies combined filters', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll({ year: 2024, month: 1, categoryId: 1 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
    });
  });

  describe('remove', () => {
    it('deletes expense when it exists', async () => {
      mockExpenseRepo.findOne.mockResolvedValue(mockExpense);
      mockExpenseRepo.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockExpenseRepo.delete).toHaveBeenCalledWith(1);
    });

    it('throws NotFoundException when expense does not exist', async () => {
      mockExpenseRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockExpenseRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('annualSummary', () => {
    it('returns 12 buckets for the year', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { month: 1, total: '200.00' },
        { month: 6, total: '350.50' },
      ]);

      const result = await service.annualSummary(2024);

      expect(result).toHaveLength(12);
      expect(result[0]).toEqual({ month: 1, total: 200 });
      expect(result[5]).toEqual({ month: 6, total: 350.5 });
    });

    it('fills empty months with zero', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.annualSummary(2024);

      expect(result).toHaveLength(12);
      result.forEach((bucket) => {
        expect(bucket.total).toBe(0);
      });
    });

    it('returns months 1 through 12 in order', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.annualSummary(2024);

      result.forEach((bucket, i) => {
        expect(bucket.month).toBe(i + 1);
      });
    });

    it('queries with year as string', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await service.annualSummary(2024);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        expect.stringContaining("'%Y'"),
        expect.objectContaining({ year: '2024' }),
      );
    });
  });

  describe('currentMonthSummary', () => {
    it('returns empty array when no data', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.currentMonthSummary();

      expect(result).toEqual([]);
    });

    it('returns correct percentages', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { category: 'Alimentação', total: '300.00' },
        { category: 'Transporte', total: '100.00' },
      ]);

      const result = await service.currentMonthSummary();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        category: 'Alimentação',
        total: 300,
        percentage: 75,
      });
      expect(result[1]).toMatchObject({
        category: 'Transporte',
        total: 100,
        percentage: 25,
      });
    });

    it('percentages sum to 100 with single category', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { category: 'Lazer', total: '500.00' },
      ]);

      const result = await service.currentMonthSummary();

      expect(result[0].percentage).toBe(100);
    });

    it('rounds percentages to 2 decimal places', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { category: 'A', total: '1.00' },
        { category: 'B', total: '2.00' },
      ]);

      const result = await service.currentMonthSummary();

      expect(result[0].percentage).toBe(33.33);
      expect(result[1].percentage).toBe(66.67);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

const mockExpense = {
  id: 1,
  date: '2024-01-15',
  amount: 150.5,
  categoryId: 1,
  createdAt: new Date(),
  category: { id: 1, name: 'Alimentação', createdAt: new Date() },
};

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  remove: jest.fn(),
  annualSummary: jest.fn(),
  currentMonthSummary: jest.fn(),
};

describe('ExpensesController', () => {
  let controller: ExpensesController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [{ provide: ExpensesService, useValue: mockService }],
    }).compile();

    controller = module.get<ExpensesController>(ExpensesController);
  });

  describe('create', () => {
    it('delegates to service and returns created expense', async () => {
      mockService.create.mockResolvedValue(mockExpense);

      const dto = { date: '15/01/2024', categoryId: 1, amount: 150.5 };
      const result = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockExpense);
    });

    it('propagates BadRequestException from service when category not found', async () => {
      mockService.create.mockRejectedValue(
        new BadRequestException('Category with id 999 not found'),
      );

      await expect(
        controller.create({ date: '15/01/2024', categoryId: 999, amount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('delegates filters to service and returns list', async () => {
      const expenses = [mockExpense];
      mockService.findAll.mockResolvedValue(expenses);

      const result = await controller.findAll({ year: 2024, month: 1 });

      expect(mockService.findAll).toHaveBeenCalledWith({
        year: 2024,
        month: 1,
      });
      expect(result).toEqual(expenses);
    });

    it('returns empty array when no expenses match', async () => {
      mockService.findAll.mockResolvedValue([]);

      const result = await controller.findAll({});

      expect(result).toEqual([]);
    });
  });

  describe('remove', () => {
    it('delegates delete to service', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(mockService.remove).toHaveBeenCalledWith(1);
    });

    it('propagates NotFoundException when expense not found', async () => {
      mockService.remove.mockRejectedValue(
        new NotFoundException('Expense with id 999 not found'),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('annualSummary', () => {
    it('delegates to service and returns 12 buckets', async () => {
      const summary = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        total: 0,
      }));
      mockService.annualSummary.mockResolvedValue(summary);

      const result = await controller.annualSummary(2024);

      expect(mockService.annualSummary).toHaveBeenCalledWith(2024);
      expect(result).toHaveLength(12);
    });
  });

  describe('currentMonthSummary', () => {
    it('returns distribution from service', async () => {
      const summary = [
        { category: 'Alimentação', total: 300, percentage: 100 },
      ];
      mockService.currentMonthSummary.mockResolvedValue(summary);

      const result = await controller.currentMonthSummary();

      expect(mockService.currentMonthSummary).toHaveBeenCalled();
      expect(result).toEqual(summary);
    });

    it('returns empty array when no data', async () => {
      mockService.currentMonthSummary.mockResolvedValue([]);

      const result = await controller.currentMonthSummary();

      expect(result).toEqual([]);
    });
  });
});

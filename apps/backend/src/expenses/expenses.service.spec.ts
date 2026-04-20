import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ExpensesService } from './expenses.service';
import { Expense } from './expense.entity';
import { Category } from '../categories/category.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';

jest.mock('csv-parse/sync', () => ({
  parse: jest.fn(),
}));

describe('ExpensesService', () => {
  let service: ExpensesService;
  let expenseRepository: Repository<Expense>;
  let categoryRepository: Repository<Category>;
  let dataSource: DataSource;

  const mockExpenseRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockCategoryRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn((cb) => cb({
      // Mock transactionalEntityManager
      findOne: mockCategoryRepository.findOne,
      create: (entity, plainObject) => {
        if (entity === Category) return mockCategoryRepository.create(plainObject);
        if (entity === Expense) return mockExpenseRepository.create(plainObject);
      },
      save: (entity) => {
        if (Array.isArray(entity)) return mockExpenseRepository.save(entity);
        if (entity.name) return mockCategoryRepository.save(entity);
      },
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: getRepositoryToken(Expense),
          useValue: mockExpenseRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    expenseRepository = module.get<Repository<Expense>>(getRepositoryToken(Expense));
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
    dataSource = module.get<DataSource>(DataSource);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return an expense', async () => {
      const dto = { description: 'Coffee', amount: 3, categoryId: 'some-uuid' };
      const category = { id: 'some-uuid', name: 'Food' };
      const expense = { id: 'expense-uuid', ...dto, category, date: new Date() };

      mockCategoryRepository.findOne.mockResolvedValue(category);
      mockExpenseRepository.create.mockReturnValue(expense);
      mockExpenseRepository.save.mockResolvedValue(expense);

      const result = await service.create(dto);
      expect(result).toEqual(expense);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({ where: { id: dto.categoryId } });
      expect(mockExpenseRepository.create).toHaveBeenCalled();
      expect(mockExpenseRepository.save).toHaveBeenCalledWith(expense);
    });

    it('should throw NotFoundException if category does not exist', async () => {
      const dto = { description: 'Coffee', amount: 3, categoryId: 'non-existent-uuid' };
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findCurrentMonthExpenses', () => {
    it('should return an array of expenses for the current month', async () => {
      const expenses = [{ id: '1', description: 'Lunch', amount: 15, date: new Date() }];
      mockExpenseRepository.find.mockResolvedValue(expenses);

      const result = await service.findCurrentMonthExpenses();
      expect(result).toEqual(expenses);
      expect(mockExpenseRepository.find).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all expenses', async () => {
      const expenses = [{ id: '1', description: 'Lunch', amount: 15, date: new Date(), category: { id: 'cat1', name: 'Food' } }];
      mockExpenseRepository.find.mockResolvedValue(expenses);

      const result = await service.findAll();
      expect(result).toEqual(expenses);
      expect(mockExpenseRepository.find).toHaveBeenCalledWith({ relations: ['category'] });
    });
  });

  describe('exportExpenses', () => {
    it('should return a CSV string of all expenses', async () => {
      const category = { id: 'cat1', name: 'Food' };
      const expenses = [
        { id: 'exp1', description: 'Lunch', amount: 15.50, date: new Date('2023-01-15T12:00:00.000Z'), category },
        { id: 'exp2', description: 'Dinner', amount: 30.00, date: new Date('2023-01-16T19:00:00.000Z'), category },
      ];

      // Mock findAll to return our predefined expenses
      jest.spyOn(service, 'findAll').mockResolvedValue(expenses);

      const expectedCsv = stringify([
        { Data: new Date('2023-01-15T12:00:00.000Z').toLocaleDateString('pt-BR'), Categoria: 'Food', Valor: 15.50 },
        { Data: new Date('2023-01-16T19:00:00.000Z').toLocaleDateString('pt-BR'), Categoria: 'Food', Valor: 30.00 },
      ], { header: true, columns: ['Data', 'Categoria', 'Valor'] });

      const result = await service.exportExpenses();
      expect(result).toEqual(expectedCsv);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('importExpenses', () => {
    const mockCategoryFood = { id: 'food-cat-id', name: 'Food' };
    const mockCategoryTransport = { id: 'transport-cat-id', name: 'Transport' };

    it('should import expenses from a valid CSV string, creating new categories if necessary', async () => {
      const csvContent = `Data,Categoria,Valor\n15/01/2023,Food,15.50\n16/01/2023,Transport,30.00\n17/01/2023,NewCategory,50.00`;
      
      (parse as jest.Mock).mockReturnValue([
        { Data: '15/01/2023', Categoria: 'Food', Valor: '15.50' },
        { Data: '16/01/2023', Categoria: 'Transport', Valor: '30.00' },
        { Data: '17/01/2023', Categoria: 'NewCategory', Valor: '50.00' },
      ]);

      mockCategoryRepository.findOne
        .mockResolvedValueOnce(mockCategoryFood) // For 'Food'
        .mockResolvedValueOnce(mockCategoryTransport) // For 'Transport'
        .mockResolvedValueOnce(null); // For 'NewCategory'

      mockCategoryRepository.create.mockReturnValue({ id: 'new-cat-id', name: 'NewCategory' });
      mockCategoryRepository.save.mockResolvedValue({ id: 'new-cat-id', name: 'NewCategory' });

      mockExpenseRepository.create.mockImplementation((dto) => dto); // Return the created expense directly
      mockExpenseRepository.save.mockResolvedValue(true); // Simulate successful save

      await service.importExpenses(csvContent);

      expect(parse).toHaveBeenCalledWith(csvContent, expect.any(Object));
      expect(mockDataSource.transaction).toHaveBeenCalled();

      // Check category creation/finding
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({ where: { name: 'Food' } });
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({ where: { name: 'Transport' } });
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({ where: { name: 'NewCategory' } });
      expect(mockCategoryRepository.create).toHaveBeenCalledWith({ name: 'NewCategory' });
      expect(mockCategoryRepository.save).toHaveBeenCalledWith({ id: 'new-cat-id', name: 'NewCategory' });

      // Check expense creation and saving
      expect(mockExpenseRepository.create).toHaveBeenCalledTimes(3);
      expect(mockExpenseRepository.save).toHaveBeenCalledTimes(1); // All expenses saved in one call
      expect(mockExpenseRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ amount: 15.50, category: mockCategoryFood }),
          expect.objectContaining({ amount: 30.00, category: mockCategoryTransport }),
          expect.objectContaining({ amount: 50.00, category: { id: 'new-cat-id', name: 'NewCategory' } }),
        ]),
      );
    });

    it('should throw BadRequestException for empty CSV content', async () => {
      const csvContent = ``;
      (parse as jest.Mock).mockReturnValue([]);

      await expect(service.importExpenses(csvContent)).rejects.toThrow(BadRequestException);
      expect(parse).toHaveBeenCalledWith(csvContent, expect.any(Object));
      expect(mockDataSource.transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid date format', async () => {
      const csvContent = `Data,Categoria,Valor\nInvalidDate,Food,10.00`;
      (parse as jest.Mock).mockReturnValue([
        { Data: 'InvalidDate', Categoria: 'Food', Valor: '10.00' },
      ]);

      await expect(service.importExpenses(csvContent)).rejects.toThrow(BadRequestException);
      expect(mockDataSource.transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid amount format', async () => {
      const csvContent = `Data,Categoria,Valor\n15/01/2023,Food,abc`;
      (parse as jest.Mock).mockReturnValue([
        { Data: '15/01/2023', Categoria: 'Food', Valor: 'abc' },
      ]);

      await expect(service.importExpenses(csvContent)).rejects.toThrow(BadRequestException);
      expect(mockDataSource.transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if transactionalEntityManager.save fails', async () => {
      const csvContent = `Data,Categoria,Valor\n15/01/2023,Food,15.50`;
      (parse as jest.Mock).mockReturnValue([
        { Data: '15/01/2023', Categoria: 'Food', Valor: '15.50' },
      ]);

      mockCategoryRepository.findOne.mockResolvedValue(mockCategoryFood);
      mockExpenseRepository.create.mockImplementation((dto) => dto);
      mockExpenseRepository.save.mockRejectedValue(new Error('Database error')); // Simulate save failure

      await expect(service.importExpenses(csvContent)).rejects.toThrow(Error);
      expect(mockDataSource.transaction).toHaveBeenCalled();
      // Ensure that create and save for category were not called if it was a new category or that rollback happened
      expect(mockExpenseRepository.save).toHaveBeenCalled();
    });
  });
});

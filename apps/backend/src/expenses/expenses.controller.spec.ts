import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, BadRequestException } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from '../categories/category.entity';
import { Expense } from './expense.entity';
import { ExpensesService } from './expenses.service'; // Import the service

describe('ExpensesController (integration)', () => {
  let app: INestApplication;
  let categoryRepository: Repository<Category>;
  let expenseRepository: Repository<Expense>;
  let expensesService: ExpensesService; // Declare the service

  const mockExpensesService = {
    create: jest.fn(),
    findCurrentMonthExpenses: jest.fn(),
    exportExpenses: jest.fn(),
    importExpenses: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ExpensesService) // Override the real service
      .useValue(mockExpensesService) // Provide the mock service
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    
    categoryRepository = moduleFixture.get<Repository<Category>>(getRepositoryToken(Category));
    expenseRepository = moduleFixture.get<Repository<Expense>>(getRepositoryToken(Expense));
    expensesService = moduleFixture.get<ExpensesService>(ExpensesService); // Get the mock service
  });

  beforeEach(async () => {
    // Clear mocks before each test
    jest.clearAllMocks();
    // Clean slate and create a category for expenses to be associated with
    // (This part might need adjustment if mock service doesn't interact with actual DB)
    // For now, focusing on controller interaction with the mocked service.
    // await expenseRepository.clear();
    // await categoryRepository.clear();
    // const testCategory = await categoryRepository.save({ name: 'Test Food' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should POST a new expense', async () => {
    const dto = { description: 'My Lunch', amount: 25.50, categoryId: 'some-category-id' };
    mockExpensesService.create.mockResolvedValue({ id: 'some-id', ...dto, date: new Date() });

    return request(app.getHttpServer())
      .post('/api/expenses')
      .send(dto)
      .expect(201)
      .then(res => {
         expect(res.body.description).toBe('My Lunch');
         expect(mockExpensesService.create).toHaveBeenCalledWith(dto);
      });
  });

  it('should GET all expenses for the month', async () => {
    const expenses = [{ id: '1', description: 'Lunch', amount: 15, date: new Date() }];
    mockExpensesService.findCurrentMonthExpenses.mockResolvedValue(expenses);
    
    return request(app.getHttpServer())
      .get('/api/expenses')
      .expect(200)
      .then(res => {
        expect(res.body.length).toBe(1);
        expect(res.body[0].description).toBe('Lunch');
        expect(mockExpensesService.findCurrentMonthExpenses).toHaveBeenCalled();
      });
  });

  it('should fail to POST with an invalid categoryId (handled by service)', async () => {
    const dto = { description: 'Invalid Expense', amount: 10, categoryId: '999' };
    mockExpensesService.create.mockRejectedValue(new NotFoundException('Category not found'));

    return request(app.getHttpServer())
      .post('/api/expenses')
      .send(dto)
      .expect(404); // Not Found
  });

  describe('GET /api/expenses/export', () => {
    it('should export expenses to a CSV file', async () => {
      const mockCsvContent = 'Data,Categoria,Valor\n15/01/2023,Food,10.00';
      mockExpensesService.exportExpenses.mockResolvedValue(mockCsvContent);

      return request(app.getHttpServer())
        .get('/api/expenses/export')
        .expect(200)
        .expect('Content-Type', 'text/csv; charset=utf-8')
        .expect('Content-Disposition', 'attachment; filename="expenses.csv"')
        .then(res => {
          expect(res.text).toBe(mockCsvContent);
          expect(mockExpensesService.exportExpenses).toHaveBeenCalled();
        });
    });
  });

  describe('POST /api/expenses/import', () => {
    it('should import expenses from a valid CSV file', async () => {
      const csvContent = 'Data,Categoria,Valor\n15/01/2023,Food,10.00';
      mockExpensesService.importExpenses.mockResolvedValue(undefined); // No return value for success

      return request(app.getHttpServer())
        .post('/api/expenses/import')
        .attach('file', Buffer.from(csvContent), { filename: 'test.csv', contentType: 'text/csv' })
        .expect(200)
        .then(res => {
          expect(res.body.message).toBe('Expenses imported successfully.');
          expect(mockExpensesService.importExpenses).toHaveBeenCalledWith(csvContent);
        });
    });

    it('should return 400 if no file is provided', () => {
      return request(app.getHttpServer())
        .post('/api/expenses/import')
        .expect(400); // Bad Request (file validation)
    });

    it('should return 400 if the file is not a CSV', async () => {
      const invalidContent = '<h1>Not a CSV</h1>';
      return request(app.getHttpServer())
        .post('/api/expenses/import')
        .attach('file', Buffer.from(invalidContent), { filename: 'test.txt', contentType: 'text/plain' })
        .expect(400); // Bad Request (file validation)
    });

    it('should return 400 if expensesService.importExpenses throws BadRequestException', async () => {
      const csvContent = 'Data,Categoria,Valor\nInvalidDate,Food,10.00';
      mockExpensesService.importExpenses.mockRejectedValue(new BadRequestException('Invalid date format in row for date: InvalidDate'));

      return request(app.getHttpServer())
        .post('/api/expenses/import')
        .attach('file', Buffer.from(csvContent), { filename: 'test.csv', contentType: 'text/csv' })
        .expect(400)
        .then(res => {
          expect(res.body.message).toContain('CSV Import Error: Invalid date format');
          expect(mockExpensesService.importExpenses).toHaveBeenCalledWith(csvContent);
        });
    });

    it('should return 500 for other unexpected errors during import', async () => {
      const csvContent = 'Data,Categoria,Valor\n15/01/2023,Food,10.00';
      mockExpensesService.importExpenses.mockRejectedValue(new Error('Unexpected service error'));

      return request(app.getHttpServer())
        .post('/api/expenses/import')
        .attach('file', Buffer.from(csvContent), { filename: 'test.csv', contentType: 'text/csv' })
        .expect(500); // Internal Server Error
    });
  });
});

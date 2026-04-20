import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from '../categories/category.entity';
import { Expense } from '../expenses/expense.entity';

describe('DashboardController (integration)', () => {
  let app: INestApplication;
  let categoryRepository: Repository<Category>;
  let expenseRepository: Repository<Expense>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    categoryRepository = moduleFixture.get<Repository<Category>>(getRepositoryToken(Category));
    expenseRepository = moduleFixture.get<Repository<Expense>>(getRepositoryToken(Expense));
  });

  beforeEach(async () => {
    await expenseRepository.clear();
    await categoryRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return aggregated dashboard data', async () => {
    // 1. Create categories
    const cat1 = await categoryRepository.save({ name: 'Groceries' });
    const cat2 = await categoryRepository.save({ name: 'Entertainment' });

    // 2. Create expenses
    await expenseRepository.save([
      { description: 'Milk', amount: 5, category: cat1, date: new Date() },
      { description: 'Bread', amount: 3, category: cat1, date: new Date() },
      { description: 'Movie Ticket', amount: 15, category: cat2, date: new Date() },
    ]);

    // 3. Call dashboard endpoint
    return request(app.getHttpServer())
      .get('/api/dashboard')
      .expect(200)
      .then((res) => {
        expect(res.body.totalSpentThisMonth).toBe(23);
        expect(res.body.spendingByCategory).toHaveLength(2);
        
        const groceries = res.body.spendingByCategory.find(s => s.categoryName === 'Groceries');
        expect(groceries.total).toBe(8);

        const entertainment = res.body.spendingByCategory.find(s => s.categoryName === 'Entertainment');
        expect(entertainment.total).toBe(15);
      });
  });

  it('should return empty/zero data when no expenses exist', () => {
      return request(app.getHttpServer())
      .get('/api/dashboard')
      .expect(200)
      .expect((res) => {
          expect(res.body.totalSpentThisMonth).toBe(0);
          expect(res.body.spendingByCategory).toEqual([]);
      });
  })
});

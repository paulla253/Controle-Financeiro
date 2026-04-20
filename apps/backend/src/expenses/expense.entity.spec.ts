import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './expense.entity';
import { Category } from '../categories/category.entity';

describe('Expense Entity', () => {
  let expenseRepo: Repository<Expense>;
  let categoryRepo: Repository<Category>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Expense, Category],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Expense, Category]),
      ],
    }).compile();

    expenseRepo = module.get('ExpenseRepository');
    categoryRepo = module.get('CategoryRepository');
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be able to create and retrieve an expense with a category', async () => {
    const category = await categoryRepo.save(categoryRepo.create({ name: 'Groceries' }));
    
    const expenseData = {
      description: 'Weekly shopping',
      amount: 150.75,
      date: new Date(),
      category: category,
    };

    const expense = expenseRepo.create(expenseData);
    await expenseRepo.save(expense);

    const foundExpense = await expenseRepo.findOne({
      where: { id: expense.id },
      relations: ['category'],
    });

    expect(foundExpense).toBeDefined();
    expect(foundExpense.description).toEqual(expenseData.description);
    expect(foundExpense.amount).toEqual(expenseData.amount);
    expect(foundExpense.category).toBeDefined();
    expect(foundExpense.category.name).toEqual(category.name);
  });
});

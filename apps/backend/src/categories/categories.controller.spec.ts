import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { Expense } from '../expenses/expense.entity'; // Import Expense entity

describe('CategoriesController (integration)', () => {
  let app: INestApplication;
  let categoryRepository: Repository<Category>;
  let expenseRepository: Repository<Expense>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    categoryRepository = moduleFixture.get<Repository<Category>>(getRepositoryToken(Category));
    expenseRepository = moduleFixture.get<Repository<Expense>>(getRepositoryToken(Expense)); // Get ExpenseRepository
  });

  beforeEach(async () => {
    await expenseRepository.clear(); // Clear expenses before each test
    await categoryRepository.clear(); // Clear categories before each test
  });

  afterAll(async () => {
    await app.close();
  });

  it('should POST a new category', async () => {
    const dto = { name: 'Rent' };
    return request(app.getHttpServer())
      .post('/api/categories')
      .send(dto)
      .expect(201)
      .then((res) => {
        expect(res.body).toEqual({
          id: expect.any(Number),
          name: dto.name,
        });
      });
  });

  it('should GET all categories', async () => {
    await categoryRepository.save({ name: 'Test Cat' });
    return request(app.getHttpServer())
      .get('/api/categories')
      .expect(200)
      .then((res) => {
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(1);
      });
  });

  it('should GET a category by ID', async () => {
    const category = await categoryRepository.save({ name: 'Groceries' });
    return request(app.getHttpServer())
      .get(`/api/categories/${category.id}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          id: category.id,
          name: category.name,
        });
      });
  });

  it('should return 404 when getting a non-existent category', () => {
    return request(app.getHttpServer())
      .get('/api/categories/9999')
      .expect(404);
  });

  it('should UPDATE a category', async () => {
    const category = await categoryRepository.save({ name: 'Old Name' });
    const updateDto = { name: 'New Name' };

    return request(app.getHttpServer())
      .patch(`/api/categories/${category.id}`)
      .send(updateDto)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          id: category.id,
          name: updateDto.name,
        });
      });
  });

  it('should return 404 when updating a non-existent category', () => {
    const updateDto = { name: 'New Name' };
    return request(app.getHttpServer())
      .patch('/api/categories/9999')
      .send(updateDto)
      .expect(404);
  });

  it('should return 400 when updating with invalid data', async () => {
    const category = await categoryRepository.save({ name: 'Valid' });
    const invalidUpdateDto = { name: '' };
    return request(app.getHttpServer())
      .patch(`/api/categories/${category.id}`)
      .send(invalidUpdateDto)
      .expect(400);
  });

  it('should DELETE a category and reassign associated expenses to "Uncategorized"', async () => {
    const categoryToDelete = await categoryRepository.save({ name: 'Category A' });
    const uncategorized = await categoryRepository.save({ name: 'Uncategorized' });
    const expense = await expenseRepository.save({
      description: 'Test Expense',
      amount: 100,
      date: new Date(),
      category: categoryToDelete,
    });

    await request(app.getHttpServer())
      .delete(`/api/categories/${categoryToDelete.id}`)
      .expect(200);

    const deletedCategory = await categoryRepository.findOneBy({ id: categoryToDelete.id });
    expect(deletedCategory).toBeNull();

    const updatedExpense = await expenseRepository.findOne({
      where: { id: expense.id },
      relations: ['category'],
    });
    expect(updatedExpense.category.name).toEqual('Uncategorized');
  });

  it('should DELETE a category and create "Uncategorized" if it does not exist', async () => {
    const categoryToDelete = await categoryRepository.save({ name: 'Category B' });
    const expense = await expenseRepository.save({
      description: 'Another Test Expense',
      amount: 50,
      date: new Date(),
      category: categoryToDelete,
    });

    await request(app.getHttpServer())
      .delete(`/api/categories/${categoryToDelete.id}`)
      .expect(200);

    const deletedCategory = await categoryRepository.findOneBy({ id: categoryToDelete.id });
    expect(deletedCategory).toBeNull();

    const uncategorizedCategory = await categoryRepository.findOne({ where: { name: 'Uncategorized' } });
    expect(uncategorizedCategory).toBeDefined();

    const updatedExpense = await expenseRepository.findOne({
      where: { id: expense.id },
      relations: ['category'],
    });
    expect(updatedExpense.category.name).toEqual('Uncategorized');
  });

  it('should return 404 when deleting a non-existent category', () => {
    return request(app.getHttpServer())
      .delete('/api/categories/9999')
      .expect(404);
  });

  it('should fail to POST with invalid data', () => {
    const invalidDto = { name: '' }; // Empty name
    return request(app.getHttpServer())
      .post('/api/categories')
      .send(invalidDto)
      .expect(400);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profile } from './profile/profile.entity';
import { Category } from './categories/category.entity';
import { Expense } from './expenses/expense.entity';
import { Repository } from 'typeorm';

describe('AppModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
    // We need to override the database connection to use an in-memory instance for testing
    .overrideProvider(getRepositoryToken(Profile))
    .useValue({})
    .overrideProvider(getRepositoryToken(Category))
    .useValue({})
    .overrideProvider(getRepositoryToken(Expense))
    .useValue({})
    .compile();
  });

  it('should compile the module', async () => {
    expect(module).toBeDefined();
  });

  // These tests are more of an integration style test and will be covered in the module-specific tests
  // For now, we just check if the module compiles
});

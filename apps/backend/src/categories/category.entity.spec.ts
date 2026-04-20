import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

describe('Category Entity', () => {
  let repository: Repository<Category>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Category],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Category]),
      ],
    }).compile();

    repository = module.get('CategoryRepository');
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be able to create and retrieve a category', async () => {
    const categoryData = { name: 'Food' };
    const category = repository.create(categoryData);
    await repository.save(category);

    const foundCategory = await repository.findOne({ where: { id: category.id } });

    expect(foundCategory).toBeDefined();
    expect(foundCategory.name).toEqual(categoryData.name);
  });

  it('should enforce unique constraint on name', async () => {
    const categoryData = { name: 'Unique' };
    await repository.save(repository.create(categoryData));

    let error;
    try {
      await repository.save(repository.create(categoryData));
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.message).toContain('SQLITE_CONSTRAINT: UNIQUE constraint failed: category.name');
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';
import { Expense } from '../expenses/expense.entity'; // Import Expense entity

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryRepository: Repository<Category>;
  let expenseRepository: Repository<Expense>;

  const mockCategoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(), // Added for the remove method logic
  };

  const mockExpenseRepository = {
    update: jest.fn(),
    find: jest.fn(), // Added for the remove method logic
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
        {
          provide: getRepositoryToken(Expense),
          useValue: mockExpenseRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
    expenseRepository = module.get<Repository<Expense>>(getRepositoryToken(Expense));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a category', async () => {
      const dto = { name: 'Groceries' };
      const category = { id: 1, ...dto };

      mockCategoryRepository.create.mockReturnValue(category);
      mockCategoryRepository.save.mockResolvedValue(category);

      expect(await service.create(dto)).toEqual(category);
      expect(mockCategoryRepository.create).toHaveBeenCalledWith(dto);
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(category);
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const categories = [{ id: 1, name: 'Groceries' }];
      mockCategoryRepository.find.mockResolvedValue(categories);

      expect(await service.findAll()).toEqual(categories);
    });
  });

  describe('findOne', () => {
    it('should return a category if found', async () => {
      const category = { id: 1, name: 'Groceries' };
      mockCategoryRepository.findOneBy.mockResolvedValue(category);

      expect(await service.findOne(1)).toEqual(category);
      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return undefined if category not found', async () => {
      mockCategoryRepository.findOneBy.mockResolvedValue(undefined);

      expect(await service.findOne(999)).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update a category and return it', async () => {
      const dto = { name: 'New Name' };
      const existingCategory = { id: 1, name: 'Old Name' };
      const updatedCategory = { id: 1, name: 'New Name' };

      mockCategoryRepository.update.mockResolvedValue({ affected: 1 });
      mockCategoryRepository.findOneBy.mockResolvedValue(updatedCategory);

      expect(await service.update(1, dto)).toEqual(updatedCategory);
      expect(mockCategoryRepository.update).toHaveBeenCalledWith(1, dto);
      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('remove', () => {
    const categoryToDelete = { id: 1, name: 'Old Category' };
    const uncategorizedCategory = { id: 2, name: 'Uncategorized' };
    const expenses = [{ id: 1, description: 'test', amount: 10, date: new Date(), category: categoryToDelete }];

    beforeEach(() => {
      mockCategoryRepository.findOneBy.mockReset();
      mockCategoryRepository.findOne.mockReset();
      mockCategoryRepository.create.mockReset();
      mockCategoryRepository.save.mockReset();
      mockCategoryRepository.delete.mockReset();
      mockExpenseRepository.update.mockReset();
    });

    it('should reassign expenses to "Uncategorized" and delete the category', async () => {
      mockCategoryRepository.findOneBy.mockResolvedValue(categoryToDelete);
      mockCategoryRepository.findOne.mockResolvedValue(uncategorizedCategory); // 'Uncategorized' category already exists
      // mockExpenseRepository.find.mockResolvedValue(expenses); // Not needed since update directly queries based on relation

      await service.remove(categoryToDelete.id);

      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({ id: categoryToDelete.id });
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({ where: { name: 'Uncategorized' } });
      expect(mockExpenseRepository.update).toHaveBeenCalledWith(
        { category: categoryToDelete },
        { category: uncategorizedCategory },
      );
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith(categoryToDelete.id);
    });

    it('should create "Uncategorized" category if it does not exist', async () => {
      mockCategoryRepository.findOneBy.mockResolvedValue(categoryToDelete);
      mockCategoryRepository.findOne.mockResolvedValue(undefined); // 'Uncategorized' does not exist
      mockCategoryRepository.create.mockReturnValue(uncategorizedCategory);
      mockCategoryRepository.save.mockResolvedValue(uncategorizedCategory);

      await service.remove(categoryToDelete.id);

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({ where: { name: 'Uncategorized' } });
      expect(mockCategoryRepository.create).toHaveBeenCalledWith({ name: 'Uncategorized' });
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(uncategorizedCategory);
      expect(mockExpenseRepository.update).toHaveBeenCalledWith(
        { category: categoryToDelete },
        { category: uncategorizedCategory },
      );
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith(categoryToDelete.id);
    });

    it('should throw NotFoundException if category to delete does not exist', async () => {
      mockCategoryRepository.findOneBy.mockResolvedValue(undefined); // Category not found

      await expect(service.remove(999)).rejects.toThrow('Category with ID 999 not found');
      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
      expect(mockExpenseRepository.update).not.toHaveBeenCalled();
    });
  });
});

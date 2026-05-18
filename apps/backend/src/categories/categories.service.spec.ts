import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';
import { HAS_EXPENSES_PORT } from './ports/has-expenses.port';

const mockCategory = { id: 1, name: 'Alimentação', createdAt: new Date() };

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
};

const mockHasExpensesPort = {
  categoryHasExpenses: jest.fn(),
};

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getRepositoryToken(Category), useValue: mockRepo },
        { provide: HAS_EXPENSES_PORT, useValue: mockHasExpensesPort },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  describe('create', () => {
    it('creates and returns a category', async () => {
      mockRepo.create.mockReturnValue(mockCategory);
      mockRepo.save.mockResolvedValue(mockCategory);

      const result = await service.create({ name: 'Alimentação' });

      expect(mockRepo.create).toHaveBeenCalledWith({ name: 'Alimentação' });
      expect(mockRepo.save).toHaveBeenCalledWith(mockCategory);
      expect(result).toEqual(mockCategory);
    });

    it('throws ConflictException on duplicate name', async () => {
      mockRepo.create.mockReturnValue(mockCategory);
      mockRepo.save.mockRejectedValue(
        new Error('UNIQUE constraint failed: categories.name'),
      );

      await expect(service.create({ name: 'Alimentação' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('rethrows unexpected errors', async () => {
      mockRepo.create.mockReturnValue(mockCategory);
      mockRepo.save.mockRejectedValue(new Error('DB connection lost'));

      await expect(service.create({ name: 'Alimentação' })).rejects.toThrow(
        'DB connection lost',
      );
    });
  });

  describe('findAll', () => {
    it('returns all categories ordered by name', async () => {
      const categories = [mockCategory];
      mockRepo.find.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
      expect(result).toEqual(categories);
    });
  });

  describe('findByName', () => {
    it('returns a category when found', async () => {
      mockRepo.findOne.mockResolvedValue(mockCategory);

      const result = await service.findByName('Alimentação');

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { name: 'Alimentação' },
      });
      expect(result).toEqual(mockCategory);
    });

    it('returns null when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.findByName('Inexistente');

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('deletes category when no expenses associated', async () => {
      mockRepo.findOne.mockResolvedValue(mockCategory);
      mockHasExpensesPort.categoryHasExpenses.mockResolvedValue(false);
      mockRepo.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockHasExpensesPort.categoryHasExpenses).toHaveBeenCalledWith(1);
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('throws ConflictException when category has expenses', async () => {
      mockRepo.findOne.mockResolvedValue(mockCategory);
      mockHasExpensesPort.categoryHasExpenses.mockResolvedValue(true);

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when category does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockHasExpensesPort.categoryHasExpenses).not.toHaveBeenCalled();
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });
});

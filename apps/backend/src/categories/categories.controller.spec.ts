import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';

const mockCategory: Category = {
  id: 1,
  name: 'Alimentação',
  createdAt: new Date('2024-01-01'),
};

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  remove: jest.fn(),
};

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: mockService }],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  describe('create', () => {
    it('delegates to service and returns created category', async () => {
      mockService.create.mockResolvedValue(mockCategory);

      const result = await controller.create({ name: 'Alimentação' });

      expect(mockService.create).toHaveBeenCalledWith({ name: 'Alimentação' });
      expect(result).toEqual(mockCategory);
    });

    it('propagates ConflictException from service on duplicate', async () => {
      mockService.create.mockRejectedValue(
        new ConflictException('A category with this name already exists'),
      );

      await expect(controller.create({ name: 'Alimentação' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('delegates to service and returns list', async () => {
      const categories = [mockCategory];
      mockService.findAll.mockResolvedValue(categories);

      const result = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toEqual(categories);
    });

    it('returns empty array when no categories', async () => {
      mockService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('remove', () => {
    it('delegates delete to service', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(mockService.remove).toHaveBeenCalledWith(1);
    });

    it('propagates NotFoundException when category not found', async () => {
      mockService.remove.mockRejectedValue(
        new NotFoundException('Category with id 999 not found'),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('propagates ConflictException when category has expenses', async () => {
      mockService.remove.mockRejectedValue(
        new ConflictException(
          'Cannot delete category: it has associated expenses',
        ),
      );

      await expect(controller.remove(1)).rejects.toThrow(ConflictException);
    });
  });
});

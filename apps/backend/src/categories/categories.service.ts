import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Expense } from '../expenses/expense.entity'; // Import Expense entity

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>, // Inject ExpenseRepository
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException(`Category with name "${createCategoryDto.name}" already exists.`);
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  findAll(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  findOne(id: number): Promise<Category> {
    return this.categoryRepository.findOneBy({ id });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    await this.categoryRepository.update(id, updateCategoryDto);
    return this.categoryRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    const categoryToRemove = await this.categoryRepository.findOneBy({ id });

    if (!categoryToRemove) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Find or create 'Uncategorized' category
    let uncategorized = await this.categoryRepository.findOne({ where: { name: 'Uncategorized' } });

    if (!uncategorized) {
      uncategorized = this.categoryRepository.create({ name: 'Uncategorized' });
      await this.categoryRepository.save(uncategorized);
    }

    // Reassign expenses
    await this.expenseRepository.update(
      { category: categoryToRemove },
      { category: uncategorized },
    );

    await this.categoryRepository.delete(id);
  }
}

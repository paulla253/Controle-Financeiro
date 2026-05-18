import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { HAS_EXPENSES_PORT } from './ports/has-expenses.port';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @Inject(HAS_EXPENSES_PORT)
    private readonly hasExpensesPort: {
      categoryHasExpenses(categoryId: number): Promise<boolean>;
    },
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(dto);
    try {
      return await this.categoryRepository.save(category);
    } catch (e: any) {
      if (e?.message?.includes('UNIQUE constraint failed')) {
        throw new ConflictException('A category with this name already exists');
      }
      throw e;
    }
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ order: { name: 'ASC' } });
  }

  async findByName(name: string): Promise<Category | null> {
    return this.categoryRepository.findOne({ where: { name } });
  }

  async remove(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    const hasExpenses = await this.hasExpensesPort.categoryHasExpenses(id);
    if (hasExpenses) {
      throw new ConflictException(
        'Não é possível excluir a categoria: ela possui despesas associadas',
      );
    }
    await this.categoryRepository.delete(id);
  }
}

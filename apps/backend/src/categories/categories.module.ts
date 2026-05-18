import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { Expense } from '../expenses/expense.entity';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { HAS_EXPENSES_PORT } from './ports/has-expenses.port';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Expense])],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    {
      provide: HAS_EXPENSES_PORT,
      useFactory: (expenseRepo: Repository<Expense>) => ({
        categoryHasExpenses: async (categoryId: number) => {
          const count = await expenseRepo.count({ where: { categoryId } });
          return count > 0;
        },
      }),
      inject: [getRepositoryToken(Expense)],
    },
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}

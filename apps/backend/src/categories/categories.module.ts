import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Expense } from '../expenses/expense.entity'; // Import Expense entity

@Module({
  imports: [TypeOrmModule.forFeature([Category, Expense])], // Add Expense to forFeature
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}

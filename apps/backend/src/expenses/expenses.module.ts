import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './expense.entity';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { Category } from '../categories/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, Category])],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}

import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { memoryStorage } from 'multer';
import { CategoriesModule } from '../categories/categories.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { Category } from '../categories/category.entity';
import { Expense } from '../expenses/expense.entity';
import { CsvService } from './csv.service';
import { CsvController } from './csv.controller';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
    TypeOrmModule.forFeature([Category, Expense]),
    CategoriesModule,
    ExpensesModule,
  ],
  controllers: [CsvController],
  providers: [CsvService],
})
export class CsvModule {}

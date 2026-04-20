import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Profile } from './profile/profile.entity';
import { Category } from './categories/category.entity';
import { Expense } from './expenses/expense.entity';
import { ProfileModule } from './profile/profile.module';
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'sqlite',
        database:
          process.env.NODE_ENV === 'test'
            ? ':memory:'
            : 'data/database.sqlite',
        entities: [Profile, Category, Expense],
        synchronize: true,
      }),
    }),
    ProfileModule,
    CategoriesModule,
    ExpensesModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

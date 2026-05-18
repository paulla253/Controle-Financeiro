import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { CsvModule } from './csv/csv.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const dbPath = configService.get<string>(
          'DATABASE_PATH',
          './data/control.sqlite',
        );
        return {
          type: 'better-sqlite3' as const,
          database: dbPath,
          entities: [],
          migrations: [join(__dirname, 'database', 'migrations', '*{.ts,.js}')],
          migrationsRun: true,
          synchronize: false,
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
    CategoriesModule,
    ExpensesModule,
    CsvModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (reflector: Reflector) =>
        new ClassSerializerInterceptor(reflector),
      inject: [Reflector],
    },
  ],
})
export class AppModule {}

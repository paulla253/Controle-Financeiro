import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { QueryExpensesDto } from './dto/query-expenses.dto';
import { Expense } from './expense.entity';
import { ExpensesService } from './expenses.service';

@ApiTags('expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new expense (RF-005, RF-006, RF-007)' })
  @ApiResponse({ status: 201, description: 'Expense created', type: Expense })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or category not found',
  })
  create(@Body() dto: CreateExpenseDto): Promise<Expense> {
    return this.expensesService.create(dto);
  }

  @Get('annual-summary')
  @ApiOperation({ summary: 'Annual summary by month (RF-017, RF-018)' })
  @ApiQuery({ name: 'year', type: Number, required: true })
  @ApiResponse({
    status: 200,
    description: '12 monthly buckets for the given year',
  })
  annualSummary(@Query('year', ParseIntPipe) year: number) {
    return this.expensesService.annualSummary(year);
  }

  @Get('current-month-summary')
  @ApiOperation({
    summary: 'Current month distribution by category (RF-019, RF-020)',
  })
  @ApiResponse({
    status: 200,
    description: 'Category distribution for current month',
  })
  currentMonthSummary() {
    return this.expensesService.currentMonthSummary();
  }

  @Get()
  @ApiOperation({
    summary: 'List expenses with optional filters (RF-009, RF-010)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of expenses',
    type: [Expense],
  })
  findAll(@Query() filters: QueryExpensesDto): Promise<Expense[]> {
    return this.expensesService.findAll(filters);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an expense (RF-008)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Expense deleted' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.expensesService.remove(id);
  }
}

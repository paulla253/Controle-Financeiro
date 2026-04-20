import { Controller, Get, Post, Body, UsePipes, ValidationPipe, Res, Header, HttpStatus, UseInterceptors, UploadedFile, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator, BadRequestException, Query } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';
import { Expense } from './expense.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('expenses')
@Controller('api/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({ status: 201, description: 'The expense has been successfully created.', type: Expense })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Body() createExpenseDto: CreateExpenseDto): Promise<Expense> {
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  @ApiOperation({ summary: 'List expenses with optional filtering by date range and category' })
  @ApiQuery({ name: 'from', required: false, type: String, example: '2024-01-01' })
  @ApiQuery({ name: 'to', required: false, type: String, example: '2024-12-31' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Return filtered expenses.', type: [Expense] })
  findAll(@Query(new ValidationPipe({ transform: true, whitelist: true })) filterDto: FilterExpenseDto): Promise<Expense[]> {
    return this.expensesService.findAll(filterDto);
  }

  @Get('export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="expenses.csv"')
  @ApiOperation({ summary: 'Export all expenses to a CSV file' })
  @ApiResponse({ status: 200, description: 'CSV file with all expenses.', type: String })
  async export(@Res() res: Response): Promise<void> {
    const csv = await this.expensesService.exportExpenses();
    res.status(HttpStatus.OK).send(csv);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Import expenses from a CSV file' })
  @ApiResponse({ status: 200, description: 'Expenses have been successfully imported.' })
  @ApiResponse({ status: 400, description: 'Invalid CSV file or content.' })
  async import(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new FileTypeValidator({ fileType: 'text/csv' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const csvContent = file.buffer.toString('utf-8');
      await this.expensesService.importExpenses(csvContent);
      return { message: 'Expenses imported successfully.' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(`CSV Import Error: ${error.message}`);
      }
      throw error;
    }
  }
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsNumberString } from 'class-validator';

export class FilterExpenseDto {
  @ApiPropertyOptional({
    description: 'Start date for filtering expenses (YYYY-MM-DD)',
    type: String,
    format: 'date',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering expenses (YYYY-MM-DD)',
    type: String,
    format: 'date',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    description: 'Category ID for filtering expenses',
    type: String, // Query parameters are always strings initially
    example: 1,
  })
  @IsOptional()
  @IsNumberString()
  categoryId?: string;
}

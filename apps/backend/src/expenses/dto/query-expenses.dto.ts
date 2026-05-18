import { IsInt, IsOptional, IsPositive, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryExpensesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  @ApiPropertyOptional({ example: 1, description: 'Month (1-12)' })
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @ApiPropertyOptional({ example: 2024 })
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @ApiPropertyOptional({ example: 1 })
  categoryId?: number;
}

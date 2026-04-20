import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsInt,
} from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({ example: 'Almoço' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 25.5 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  categoryId: number;
}

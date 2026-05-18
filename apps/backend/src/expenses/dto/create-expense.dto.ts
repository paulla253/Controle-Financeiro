import { IsInt, IsNumber, IsPositive, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseDto {
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'date must be in DD/MM/YYYY format',
  })
  @ApiProperty({
    example: '15/01/2024',
    description: 'Date in DD/MM/YYYY format',
  })
  date!: string;

  @IsInt()
  @IsPositive()
  @ApiProperty({ example: 1 })
  categoryId!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @ApiProperty({ example: 150.5 })
  amount!: number;
}

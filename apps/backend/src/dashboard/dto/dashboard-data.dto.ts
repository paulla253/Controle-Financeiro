import { ApiProperty } from '@nestjs/swagger';

export class SpendingByCategory {
  @ApiProperty({ example: 1 })
  categoryId: number;
  @ApiProperty({ example: 'Lazer' })
  categoryName: string;
  @ApiProperty({ example: 250.5 })
  total: number;
}

export class DashboardDataDto {
  @ApiProperty({ example: 1250.75 })
  totalSpentThisMonth: number;
  @ApiProperty({ type: () => [SpendingByCategory] })
  spendingByCategory: SpendingByCategory[];
  // Historical data can be added here later
}

export class AnnualSpendingDto {
  @ApiProperty({ example: "Janeiro" })
  month: string;

  @ApiProperty({ example: 1230.50 })
  total: number;
}

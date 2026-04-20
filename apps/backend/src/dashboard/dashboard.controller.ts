import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardDataDto, AnnualSpendingDto, SpendingByCategory } from './dto/dashboard-data.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard data for current month' })
  @ApiResponse({ status: 200, description: 'Return dashboard data.', type: DashboardDataDto })
  getDashboardData(): Promise<DashboardDataDto> {
    return this.dashboardService.getDashboardData();
  }

  @Get('annual')
  @ApiOperation({ summary: 'Get annual spending data by month' })
  @ApiResponse({ status: 200, description: 'Return annual spending data.', type: [AnnualSpendingDto] })
  getAnnualSpending(@Query('year', new ParseIntPipe()) year: number): Promise<AnnualSpendingDto[]> {
    return this.dashboardService.getAnnualSpending(year);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get dashboard data for a specific month or current month if not specified' })
  @ApiQuery({ name: 'month', required: false, type: Number, description: 'Month (1-12)' })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Year (e.g., 2023)' })
  @ApiResponse({ status: 200, description: 'Return monthly dashboard data.', type: [SpendingByCategory] })
  async getMonthlyDashboardData(
    @Query('month', new ParseIntPipe({ optional: true })) month?: number,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
  ): Promise<SpendingByCategory[]> {
    const dashboardData = await this.dashboardService.getDashboardData(month, year);
    return dashboardData.spendingByCategory;
  }
}

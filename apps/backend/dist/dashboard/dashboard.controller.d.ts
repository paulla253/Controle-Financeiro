import { DashboardService } from './dashboard.service';
import { DashboardDataDto, AnnualSpendingDto, SpendingByCategory } from './dto/dashboard-data.dto';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboardData(): Promise<DashboardDataDto>;
    getAnnualSpending(year: number): Promise<AnnualSpendingDto[]>;
    getMonthlyDashboardData(month?: number, year?: number): Promise<SpendingByCategory[]>;
}

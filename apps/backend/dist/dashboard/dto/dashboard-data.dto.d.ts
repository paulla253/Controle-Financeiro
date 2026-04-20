export declare class SpendingByCategory {
    categoryId: number;
    categoryName: string;
    total: number;
}
export declare class DashboardDataDto {
    totalSpentThisMonth: number;
    spendingByCategory: SpendingByCategory[];
}
export declare class AnnualSpendingDto {
    month: string;
    total: number;
}

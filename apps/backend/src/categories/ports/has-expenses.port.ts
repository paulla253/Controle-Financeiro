export const HAS_EXPENSES_PORT = 'HAS_EXPENSES_PORT';

export interface HasExpensesPort {
  categoryHasExpenses(categoryId: number): Promise<boolean>;
}

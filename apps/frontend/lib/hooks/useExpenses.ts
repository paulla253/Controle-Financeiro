import { useQuery } from '@tanstack/react-query';
import { getExpenses, ExpenseFilter, Expense } from '../api';

export function useExpenses(filters?: ExpenseFilter) {
  return useQuery<Expense[]>({
    queryKey: ['expenses', filters],
    queryFn: () => getExpenses(filters),
  });
}

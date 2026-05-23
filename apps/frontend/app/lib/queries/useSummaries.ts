import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

export interface MonthSummary {
  month: number;
  total: number;
}

export interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
}

export function useAnnualSummary(year: number) {
  return useQuery<MonthSummary[]>({
    queryKey: ['annual-summary', year],
    queryFn: () =>
      apiClient.get<MonthSummary[]>(`/expenses/annual-summary?year=${year}`),
  });
}

export function useExpenseYears() {
  return useQuery<number[]>({
    queryKey: ['expense-years'],
    queryFn: () => apiClient.get<number[]>('/expenses/years'),
  });
}

export function useCurrentMonthSummary() {
  return useQuery<CategorySummary[]>({
    queryKey: ['current-month-summary'],
    queryFn: () =>
      apiClient.get<CategorySummary[]>('/expenses/current-month-summary'),
  });
}

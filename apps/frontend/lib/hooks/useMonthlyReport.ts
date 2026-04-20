import { useQuery } from '@tanstack/react-query';
import { getMonthlyReport, MonthlyReportEntry } from '../api';

export function useMonthlyReport(year: number, month: number) {
  return useQuery<MonthlyReportEntry[]>({
    queryKey: ['monthlyReport', year, month],
    queryFn: () => getMonthlyReport(year, month),
  });
}

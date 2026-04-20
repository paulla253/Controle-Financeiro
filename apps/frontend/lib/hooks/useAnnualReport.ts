import { useQuery } from '@tanstack/react-query';
import { getAnnualReport, AnnualReportEntry } from '../api';

export function useAnnualReport(year: number) {
  return useQuery<AnnualReportEntry[]>({
    queryKey: ['annualReport', year],
    queryFn: () => getAnnualReport(year),
  });
}

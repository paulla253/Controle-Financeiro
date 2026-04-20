import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importExpenses, ImportExpenseResult } from '../api';

export function useImportExpenses() {
  const queryClient = useQueryClient();
  return useMutation<ImportExpenseResult, Error, File>({
    mutationFn: importExpenses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      // Invalidate annual and monthly reports as well, as expenses data has changed
      queryClient.invalidateQueries({ queryKey: ['annualReport'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyReport'] });
    },
  });
}

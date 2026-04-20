import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createExpense, CreateExpenseData } from '../api';

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseData) => createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

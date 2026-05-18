import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import { toast } from '../../components/Toast';

export interface Expense {
  id: number;
  date: string; // YYYY-MM-DD
  amount: number;
  description?: string | null;
  categoryId: number;
  category: { id: number; name: string };
  createdAt: string;
}

export interface ExpenseFilters {
  month?: number;
  year?: number;
  categoryId?: number;
}

export interface CreateExpenseInput {
  date: string; // DD/MM/YYYY
  categoryId: number;
  amount: number;
}

export function useExpenses(filters: ExpenseFilters = {}) {
  return useQuery<Expense[]>({
    queryKey: ['expenses', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.month != null) params.set('month', String(filters.month));
      if (filters.year != null) params.set('year', String(filters.year));
      if (filters.categoryId != null) params.set('categoryId', String(filters.categoryId));
      const qs = params.toString();
      return apiClient.get<Expense[]>(`/expenses${qs ? `?${qs}` : ''}`);
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseInput) =>
      apiClient.post<Expense>('/expenses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Despesa criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/expenses/${id}`),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['expenses'] });
      const previousData = queryClient.getQueriesData<Expense[]>({
        queryKey: ['expenses'],
      });
      queryClient.setQueriesData<Expense[]>(
        { queryKey: ['expenses'] },
        (old) => old?.filter((e) => e.id !== id),
      );
      return { previousData };
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Despesa excluída com sucesso!');
    },
  });
}

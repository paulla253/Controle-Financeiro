import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '../api-client';
import { toast } from '../../components/Toast';

export function useImportCsv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.postForm<{ imported: number }>('/csv/import', formData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success(`${data.imported} despesa(s) importada(s) com sucesso!`);
    },
    onError: (error: Error) => {
      if (error instanceof ApiError && error.details && typeof error.details === 'object') {
        const d = error.details as { line?: number; reason?: string };
        if (d.line != null && d.reason) {
          toast.error(`Erro na linha ${d.line}: ${d.reason}`);
          return;
        }
      }
      toast.error(error.message);
    },
  });
}

export function useExportCsv() {
  return useMutation({
    mutationFn: async () => {
      const blob = await apiClient.getBlob('/csv/export');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'despesas.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success('Exportação concluída!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

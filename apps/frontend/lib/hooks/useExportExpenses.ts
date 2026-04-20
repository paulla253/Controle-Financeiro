import { useMutation } from '@tanstack/react-query';
import { exportExpenses } from '../api';

export function useExportExpenses() {
  return useMutation({
    mutationFn: exportExpenses,
    onSuccess: (data: Blob) => {
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'expenses.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

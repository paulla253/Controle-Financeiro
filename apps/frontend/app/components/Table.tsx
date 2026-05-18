'use client';

import { Trash2 } from 'lucide-react';
import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface TableProps<T extends { id: number }> {
  data: T[];
  columns: Column<T>[];
  onDelete?: (id: number) => void;
  getDeleteLabel?: (row: T) => string;
  emptyMessage?: string;
}

export function Table<T extends { id: number }>({
  data,
  columns,
  onDelete,
  getDeleteLabel,
  emptyMessage = 'Nenhum item encontrado.',
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-16 text-center text-on-surface-variant">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-4 text-sm font-semibold tracking-wide ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
            {onDelete && (
              <th className="w-32 px-4 py-4 text-right text-sm font-semibold tracking-wide">
                Ações
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {data.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-surface-container-low">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-4 text-sm text-on-surface ${col.className ?? ''}`}
                >
                  {col.render(row)}
                </td>
              ))}
              {onDelete && (
                <td className="px-4 py-4 text-right">
                  <button
                    onClick={() => onDelete(row.id)}
                    aria-label={
                      getDeleteLabel
                        ? getDeleteLabel(row)
                        : `Excluir item ${row.id}`
                    }
                    className="rounded-lg p-2 text-error transition-all hover:bg-error-container/20"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

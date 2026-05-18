'use client';

import { CirclePlus, Download, FileUp } from 'lucide-react';
import { useRef, useState } from 'react';
import { useCategories } from '../lib/queries/useCategories';
import {
  useExpenses,
  useDeleteExpense,
  type Expense,
  type ExpenseFilters,
} from '../lib/queries/useExpenses';
import { useImportCsv, useExportCsv } from '../lib/queries/useCsv';
import { Table, type Column } from '../components/Table';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { formatDateBR, formatCurrencyBRL } from '../lib/format';

const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

const EXPENSE_COLUMNS: Column<Expense>[] = [
  {
    key: 'date',
    header: 'Data',
    render: (row) => formatDateBR(row.date),
  },
  {
    key: 'category',
    header: 'Categoria',
    render: (row) => row.category.name,
  },
  {
    key: 'amount',
    header: 'Valor',
    render: (row) => formatCurrencyBRL(row.amount),
    className: 'text-right',
  },
];

export default function ExpensesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilters>({});

  const { data: categories } = useCategories();
  const { data: expenses, isLoading, isError } = useExpenses(filters);
  const { mutate: deleteExpense } = useDeleteExpense();
  const { mutate: importCsv, isPending: isImporting } = useImportCsv();
  const { mutate: exportCsv, isPending: isExporting } = useExportCsv();

  function handleFilterChange(key: keyof ExpenseFilters, value: string) {
    setFilters((prev) => ({
      ...prev,
      [key]: value ? Number(value) : undefined,
    }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      importCsv(file);
      e.target.value = '';
    }
  }

  const count = expenses?.length ?? 0;

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Despesas</h1>
            <span className="text-sm text-on-surface-variant">
              {count}{' '}
              {count === 1 ? 'despesa encontrada' : 'despesas encontradas'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
            >
              <CirclePlus size={20} />
              Nova Despesa
            </button>
            <input
              data-testid="import-file-input"
              type="file"
              accept=".csv"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm font-semibold text-on-surface shadow-sm transition-all hover:bg-surface-container-low disabled:opacity-50"
            >
              <FileUp size={20} />
              {isImporting ? 'Importando…' : 'Importar'}
            </button>
            <button
              onClick={() => exportCsv()}
              disabled={isExporting || count === 0}
              className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm font-semibold text-on-surface shadow-sm transition-all hover:bg-surface-container-low disabled:opacity-50"
            >
              <Download size={20} />
              {isExporting ? 'Exportando…' : 'Exportar'}
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <select
            aria-label="Filtrar por mês"
            value={filters.month ?? ''}
            onChange={(e) => handleFilterChange('month', e.target.value)}
            className="h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
          >
            <option value="">Todos os meses</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            aria-label="Filtrar por ano"
            placeholder="Ano (ex: 2024)"
            value={filters.year ?? ''}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="h-10 w-36 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
          />

          <select
            aria-label="Filtrar por categoria"
            value={filters.categoryId ?? ''}
            onChange={(e) => handleFilterChange('categoryId', e.target.value)}
            className="h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
          >
            <option value="">Todas as categorias</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <span className="text-on-surface-variant">Carregando despesas…</span>
          </div>
        )}

        {isError && (
          <div className="py-8 text-center text-error">
            Erro ao carregar despesas.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <Table
              data={expenses ?? []}
              columns={EXPENSE_COLUMNS}
              onDelete={deleteExpense}
              getDeleteLabel={(row) =>
                `Excluir despesa de ${row.category.name}`
              }
              emptyMessage="Nenhuma despesa encontrada."
            />
          </div>
        )}
      </div>

      {isModalOpen && (
        <AddExpenseModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}

'use client';

import { FormEvent, useEffect, useState } from 'react';
import { CircleX } from 'lucide-react';
import { useCategories } from '../lib/queries/useCategories';
import { useCreateExpense } from '../lib/queries/useExpenses';
import { formatDateBR } from '../lib/format';

interface Props {
  onClose: () => void;
}

export function AddExpenseModal({ onClose }: Props) {
  const { data: categories } = useCategories();
  const { mutate, isPending } = useCreateExpense();

  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<{
    date?: string;
    categoryId?: string;
    amount?: string;
  }>({});

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  function validate() {
    const next: typeof errors = {};
    if (!date) next.date = 'Informe a data';
    if (!categoryId) next.categoryId = 'Selecione uma categoria';
    const parsed = parseFloat(amount.replace(',', '.'));
    if (!amount || isNaN(parsed) || parsed <= 0)
      next.amount = 'Valor deve ser maior que zero';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const parsed = parseFloat(amount.replace(',', '.'));
    mutate(
      { date: formatDateBR(date), categoryId: Number(categoryId), amount: parsed },
      { onSuccess: () => onClose() },
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="mx-4 w-full max-w-lg overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl">
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-5">
          <h2 id="modal-title" className="text-xl font-bold text-on-surface">
            Nova Despesa
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-error transition-colors hover:text-on-error-container"
          >
            <CircleX size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 p-6">
            <div className="space-y-1">
              <label
                htmlFor="expense_date"
                className="block text-sm font-semibold text-on-surface"
              >
                Data
              </label>
              <input
                id="expense_date"
                type="date"
                autoFocus
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
              />
              {errors.date && (
                <p className="text-xs text-error">{errors.date}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="expense_category"
                className="block text-sm font-semibold text-on-surface"
              >
                Categoria
              </label>
              <select
                id="expense_category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
              >
                <option value="">Selecione uma categoria</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-error">{errors.categoryId}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="expense_amount"
                className="block text-sm font-semibold text-on-surface"
              >
                Valor (R$)
              </label>
              <input
                id="expense_amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
              />
              {errors.amount && (
                <p className="text-xs text-error">{errors.amount}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:opacity-90 active:opacity-80 disabled:opacity-50"
            >
              {isPending ? 'Salvando…' : 'Salvar Despesa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

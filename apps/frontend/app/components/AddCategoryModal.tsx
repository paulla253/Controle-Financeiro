'use client';

import { FormEvent, useEffect, useRef } from 'react';
import { CircleX } from 'lucide-react';
import { useCreateCategory } from '../lib/queries/useCategories';

interface Props {
  onClose: () => void;
}

export function AddCategoryModal({ onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useCreateCategory();

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = inputRef.current?.value.trim() ?? '';
    if (!name) return;
    mutate(name, { onSuccess: () => onClose() });
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
            Nova Categoria
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
            <div className="space-y-2">
              <label
                htmlFor="category_name"
                className="block text-sm font-semibold text-on-surface"
              >
                Nome
              </label>
              <input
                id="category_name"
                ref={inputRef}
                type="text"
                placeholder="Ex: Mercado, Aluguel, Lazer"
                required
                className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
              />
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
              {isPending ? 'Salvando…' : 'Salvar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

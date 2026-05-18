'use client';

import { CirclePlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AddCategoryModal } from '../components/AddCategoryModal';
import { useCategories, useDeleteCategory } from '../lib/queries/useCategories';

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: categories, isLoading, isError } = useCategories();
  const { mutate: deleteCategory } = useDeleteCategory();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-on-surface-variant">Carregando categorias…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-error">
        Erro ao carregar categorias.
      </div>
    );
  }

  const count = categories?.length ?? 0;

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">
              Categorias Existentes
            </h1>
            <span className="text-sm text-on-surface-variant">
              {count} {count === 1 ? 'categoria encontrada' : 'categorias encontradas'}
            </span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
          >
            <CirclePlus size={20} />
            Nova Categoria
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          {count === 0 ? (
            <div className="py-16 text-center text-on-surface-variant">
              Nenhuma categoria cadastrada.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-4 text-sm font-semibold tracking-wide">
                      Nome da Categoria
                    </th>
                    <th className="w-32 px-4 py-4 text-right text-sm font-semibold tracking-wide">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {categories?.map((category) => (
                    <tr
                      key={category.id}
                      className="transition-colors hover:bg-surface-container-low"
                    >
                      <td className="px-4 py-4 text-sm font-medium text-on-surface">
                        {category.name}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => deleteCategory(category.id)}
                          title="Excluir"
                          aria-label={`Excluir ${category.name}`}
                          className="rounded-lg p-2 text-error transition-all hover:bg-error-container/20"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <AddCategoryModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}

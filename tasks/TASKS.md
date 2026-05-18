# Tarefas — Adequacao ao Layout Proposto

Referencia: `LAYOUT_PLAN.md` e pasta `layout/`.

---

## Ordem de execucao

```
#1 Tailwind config  ──┬──> #4 Header
#2 Inter + Symbols  ──┤──> #7 Substituir classes
#3 Container main      ──> #5 Cards sumario
                       ──> #8 Modais
#6 Coluna Descricao  (independente)
```

---

## Checklist

- [x] **#1 — Configurar tokens do design system no Tailwind config**
  - Arquivo: `apps/frontend/app/globals.css` (Tailwind v4 usa CSS-first config via `@theme`)
  - Cores Material 3 (primary, surface-*, on-surface, outline, error, secondary, tertiary)
  - Espacamento: xs=4px, base=8px, md=16px, lg=24px, xl=32px
  - fontFamily: Inter como sans padrao via `--font-sans: var(--font-inter)`

- [x] **#2 — Importar fonte Inter e Material Symbols no layout raiz**
  - Arquivo: `apps/frontend/app/layout.tsx`
  - Inter via `next/font/google` (ja existia, mantida)
  - Material Symbols Outlined via link no `<head>` com axis completo
  - body com `bg-background`

- [x] **#3 — Ajustar container principal para max-w-7xl**
  - Arquivo: `apps/frontend/app/layout.tsx`
  - `max-w-7xl mx-auto px-8`
  - `pt-24` para compensar header fixo

- [x] **#4 — Atualizar Header** _(requer #1 e #2)_
  - Arquivo: `apps/frontend/app/components/Header.tsx`
  - `max-w-7xl` e `px-8`
  - Active state: `border-b-2 border-primary text-primary`
  - Logo: `text-lg font-bold`
  - Botao de tema com icone `light_mode`

- [x] **#5 — Adicionar cards de sumario mensal no Dashboard** _(requer #1)_
  - Arquivo: `apps/frontend/app/page.tsx`
  - Card "Total Gasto no Mes" com variacao percentual (`text-error` + icone `trending_up`)
  - Card "Gasto do Mes Anterior" com label "Fechado em [mes]"
  - `grid-cols-1 md:grid-cols-2 gap-lg`
  - Total atual = soma de `useCurrentMonthSummary`; anterior = `useAnnualSummary(year)`

- [x] **#6 — Adicionar coluna Descricao na tabela de despesas**
  - Arquivos: `apps/frontend/app/page.tsx` e `apps/frontend/app/expenses/page.tsx`
  - Campo `description?: string | null` adicionado ao tipo `Expense` (backend nao tem o campo ainda — exibe `—` ate ser adicionado)
  - Coluna inserida entre Categoria e Valor

- [x] **#7 — Substituir classes genericas pelos tokens semanticos** _(requer #1)_
  - Todos os componentes e pages atualizados:
    - `bg-white` → `bg-surface-container-lowest`
    - `text-gray-900` → `text-on-surface`
    - `border-gray-200` → `border-outline-variant`
    - `text-blue-700` → `text-primary`
    - `gap-6 / p-6 / px-6` → `gap-lg / p-lg / px-lg`
    - `py-4` → `py-md`
  - Arquivos: Header, Table, PieChart, AnnualBarChart, AddExpenseModal, AddCategoryModal, pages

- [x] **#8 — Adequar modais ao layout proposto** _(requer #1 e #2)_
  - Arquivos: `AddExpenseModal.tsx`, `AddCategoryModal.tsx`
  - Input: `border-outline`, foco com `border-primary` e `ring-primary/20`
  - Botao primario: `bg-primary text-on-primary` com icone `save` 18px
  - Botao cancelar: `bg-surface-container text-on-surface`
  - Footer do modal: `bg-surface-container`

---

## Referencias visuais

| Tela | HTML | Screenshot |
|---|---|---|
| Dashboard | `layout/dashboard/code.html` | `layout/dashboard/screen.png` |
| Despesas | `layout/gerenciamento_de_despesas/code.html` | `layout/gerenciamento_de_despesas/screen.png` |
| Categorias | `layout/gerenciamento_de_categorias/code.html` | `layout/gerenciamento_de_categorias/screen.png` |
| Modal Despesa | `layout/modal_adicionar_despesa/code.html` | `layout/modal_adicionar_despesa/screen.png` |
| Modal Categoria | `layout/modal_cadastro_de_categoria/code.html` | `layout/modal_cadastro_de_categoria/screen.png` |

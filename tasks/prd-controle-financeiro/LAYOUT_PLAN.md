# Plano de Adequação ao Layout Proposto

Referência: pasta `layout/` com HTMLs de referência e `layout/DESIGN.md`.

---

## Contexto

O design system **FinTrack Professional** está definido na pasta `layout/` com telas para:
- `dashboard/`
- `gerenciamento_de_despesas/`
- `gerenciamento_de_categorias/`
- `modal_adicionar_despesa/`
- `modal_cadastro_de_categoria/`

A implementação atual usa classes genéricas do Tailwind (`gray-*`, `blue-*`) em vez dos tokens semânticos do design system (Material 3).

---

## Etapas

### 1. Tailwind config — tokens do design system

**Arquivo:** `apps/frontend/tailwind.config.ts`

Adicionar ao `theme.extend`:

**Cores (Material 3):**
```
primary: '#005da7'
on-primary: '#ffffff'
primary-container: '#2976c7'
on-primary-container: '#fdfcff'
secondary: '#006e1c'
on-secondary: '#ffffff'
secondary-container: '#91f78e'
on-secondary-container: '#00731e'
tertiary: '#7f5300'
on-tertiary: '#ffffff'
error: '#ba1a1a'
on-error: '#ffffff'
error-container: '#ffdad6'
on-error-container: '#93000a'
background: '#f8f9ff'
on-background: '#191c21'
surface: '#f8f9ff'
surface-dim: '#d8dae1'
surface-bright: '#f8f9ff'
surface-container-lowest: '#ffffff'
surface-container-low: '#f2f3fb'
surface-container: '#ecedf5'
surface-container-high: '#e6e8ef'
surface-container-highest: '#e1e2e9'
on-surface: '#191c21'
on-surface-variant: '#414751'
outline: '#717783'
outline-variant: '#c1c7d3'
inverse-surface: '#2e3036'
inverse-on-surface: '#eff0f8'
inverse-primary: '#a4c9ff'
surface-tint: '#0060ac'
```

**Tipografia customizada (`fontSize`):**
```
h1:  ['24px', { lineHeight: '32px', fontWeight: '700' }]
h2:  ['18px', { lineHeight: '24px', fontWeight: '600' }]
body: ['14px', { lineHeight: '20px', fontWeight: '400' }]
button: ['14px', { lineHeight: '14px', fontWeight: '600' }]
small: ['12px', { lineHeight: '16px', fontWeight: '400' }]
```

**Espaçamento (base-8):**
```
xs: '4px'
base: '8px'   (usar gap-base, p-base, etc.)
sm: '8px'
md: '16px'
lg: '24px'
xl: '32px'
container-padding: '16px'
```

**Fonte padrão:** Inter (já importada ou adicionar em `fontFamily.sans`).

---

### 2. Fonte Inter + Material Symbols

**Arquivo:** `apps/frontend/app/layout.tsx`

- Importar Inter via `next/font/google`
- Adicionar link do Material Symbols Outlined no `<head>`

```html
<link
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
  rel="stylesheet"
/>
```

---

### 3. Header

**Arquivo:** `apps/frontend/app/components/Header.tsx`

| Aspecto | Atual | Esperado |
|---|---|---|
| `max-width` | `max-w-5xl` | `max-w-7xl` |
| `padding-x` | `px-4` | `px-8` |
| Estado ativo | `bg-blue-50 text-blue-700` | `border-b-2 border-blue-600 text-blue-600` |
| Botão de tema | ausente | ícone `light_mode` (Material Symbols) |
| Logo tamanho | `text-base font-semibold` | `text-lg font-bold` |

---

### 4. Layout raiz — container principal

**Arquivo:** `apps/frontend/app/layout.tsx` (ou wrapper da `<main>`)

- Container: `max-w-7xl mx-auto px-8`
- Padding-top: `pt-24` (compensa header fixo de 56px + folga)
- Background: `bg-background` (token)

---

### 5. Dashboard — cards de sumário mensal

**Arquivo:** `apps/frontend/app/page.tsx`

Adicionar acima dos gráficos dois cards:

**"Total Gasto no Mês"**
- Valor: soma do mês atual (já disponível via `useCurrentMonthSummary`)
- Indicador: variação percentual em vermelho (`text-error`) com ícone `trending_up`

**"Gasto do Mês Anterior"**
- Valor: soma do mês anterior (novo hook ou parâmetro em `useSummaries`)
- Label: "Fechado em [mês anterior]"

Grid: `grid-cols-1 md:grid-cols-2 gap-lg`

Estilo dos cards:
```
bg-surface-container-lowest border border-outline-variant p-lg rounded-xl
```

---

### 6. Tabela de despesas — coluna Descrição

**Arquivo:** `apps/frontend/app/page.tsx` (tabela de recentes) e `apps/frontend/app/expenses/page.tsx`

Adicionar coluna `Descrição` entre Categoria e Valor:
```tsx
<th>Descrição</th>
...
<td>{expense.description}</td>
```

Verificar se o campo `description` já existe no tipo retornado pela API.

---

### 7. Substituição de classes genéricas pelos tokens

Aplicar em todos os componentes após a etapa 1:

| Classe atual | Classe com token |
|---|---|
| `bg-white` | `bg-surface-container-lowest` |
| `bg-gray-50` | `bg-surface-container-low` |
| `text-gray-900` | `text-on-surface` |
| `text-gray-500` / `text-gray-400` | `text-on-surface-variant` |
| `border-gray-200` / `border-gray-100` | `border-outline-variant` |
| `text-blue-700` / `text-blue-600` | `text-primary` |
| `bg-blue-50` | `bg-primary-container/10` |
| `text-red-*` / `text-rose-*` | `text-error` |
| `rounded-xl` | manter (já é o token de cards) |
| `gap-6` | `gap-lg` |
| `p-6` | `p-lg` |
| `px-6` | `px-lg` |
| `py-3` / `py-4` | `py-md` |

Componentes afetados:
- `Header.tsx`
- `Table.tsx`
- `PieChart.tsx`
- `AnnualBarChart.tsx`
- `AddExpenseModal.tsx`
- `AddCategoryModal.tsx`
- `Toast.tsx`
- `page.tsx` (dashboard, expenses, categories)

---

### 8. Modais — adequação ao layout

**Arquivos:**
- `apps/frontend/app/components/AddExpenseModal.tsx`
- `apps/frontend/app/components/AddCategoryModal.tsx`

Referência: `layout/modal_adicionar_despesa/` e `layout/modal_cadastro_de_categoria/`

Pontos a verificar:
- Input com borda `outline` e foco `primary` com ring de 20% opacidade
- Botão primário: `bg-primary text-on-primary px-md py-base rounded font-button text-button`
- Botão cancelar: `bg-surface-container text-on-surface`
- Ícone no botão (18px) com `gap-xs`

---

## Ordem de execução recomendada

1. **Tailwind config** — sem isso as demais classes não funcionam
2. **Fonte Inter + Material Symbols** no `layout.tsx`
3. **Layout raiz** — `max-w-7xl`, `bg-background`, `pt-24`
4. **Header** — active state, max-width, botão de tema
5. **Dashboard** — cards de sumário, coluna descrição
6. **Substituição de classes** em todos os componentes
7. **Modais** — ajuste fino nos formulários

---

## Referências visuais

| Tela | HTML | Screenshot |
|---|---|---|
| Dashboard | `layout/dashboard/code.html` | `layout/dashboard/screen.png` |
| Despesas | `layout/gerenciamento_de_despesas/code.html` | `layout/gerenciamento_de_despesas/screen.png` |
| Categorias | `layout/gerenciamento_de_categorias/code.html` | `layout/gerenciamento_de_categorias/screen.png` |
| Modal Despesa | `layout/modal_adicionar_despesa/code.html` | `layout/modal_adicionar_despesa/screen.png` |
| Modal Categoria | `layout/modal_cadastro_de_categoria/code.html` | `layout/modal_cadastro_de_categoria/screen.png` |

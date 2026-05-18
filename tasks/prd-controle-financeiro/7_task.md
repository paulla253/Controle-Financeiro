# Tarefa 7.0: Tela Expenses

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Tela central do produto: tabela de despesas filtrável por mês/ano/categoria, botão "Adicionar Nova Despesa" que abre modal e botões "Importar" / "Exportar" CSV. Reutiliza hooks consumindo a API e o padrão de toast.

<requirements>
- RF-005 / RF-006 / RF-007: cadastrar despesa válida; rejeitar valor ≤ 0 e categoria não selecionada; rejeitar categoria inexistente (erro do backend).
- RF-008: excluir despesa (otimista com rollback em erro).
- RF-009 / RF-010: tabela ordenada por data desc, filtros mês/ano/categoria combináveis.
- RF-011..RF-014: import CSV; toast de sucesso `{ imported }` e toast de erro com `line`/`reason`.
- RF-015: export CSV (download via link gerado a partir do blob retornado).
- RF-021: toast em todas as mutations.
</requirements>

## Subtarefas

- [ ] 7.1 Hooks: `useExpenses(filters)`, `useCreateExpense`, `useDeleteExpense`, `useImportCsv`, `useExportCsv`.
- [ ] 7.2 Componente `Table.tsx` reutilizável (colunas configuráveis).
- [ ] 7.3 Componente `AddExpenseModal.tsx` (data, categoria via select preenchido por `useCategories`, valor; validação local pré-submit).
- [ ] 7.4 Página `app/expenses/page.tsx`: barra de filtros (mês/ano/categoria), botões `New / Import / Export`, tabela e exclusão otimista.
- [ ] 7.5 Implementar download de CSV (`exportCsv` retorna blob → criar URL temporária → click programático).
- [ ] 7.6 Tratamento de erro padronizado para import (toast com linha/motivo).
- [ ] 7.7 Specs de componente/integração com MSW.
- [ ] 7.8 Validação de build e execução completa dos testes.

## Detalhes de Implementação

Ver `techspec.md` → "Endpoints de API (expenses, csv)", "Visão Geral dos Componentes (Frontend)" e "Fluxo de dados".

## Critérios de Sucesso

- Acessar `/expenses` exibe tabela com despesas; aplicar filtros muda a query e atualiza a tabela.
- Modal cria despesa e fecha; tabela inclui o novo item sem reload.
- Botão exportar baixa arquivo CSV (assertível via spy do `URL.createObjectURL` no teste).
- Importar CSV inválido exibe toast com `line` e `reason` retornados pelo backend.
- `cd apps/frontend && npm run build && npm run lint && npm test` finaliza com sucesso.

## Testes da Tarefa

- [ ] Componente: `AddExpenseModal.test.tsx` — submissão válida, valor ≤ 0, categoria não selecionada.
- [ ] Componente: `Table.test.tsx` — render, ordenação por data, exclusão otimista.
- [ ] Integração: `expenses.page.test.tsx` (com MSW) — filtros propagam à query, fluxo de cadastro, fluxo de exclusão.
- [ ] Integração: `import-csv.test.tsx` — sucesso (toast com `imported`) e erro (toast com `line`/`reason`).
- [ ] Validação final: `cd apps/frontend && npm run build && npm run lint && npm test` finaliza com sucesso.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `apps/frontend/app/expenses/page.tsx`
- `apps/frontend/app/components/AddExpenseModal.tsx`
- `apps/frontend/app/components/Table.tsx`
- `apps/frontend/app/lib/queries/useExpenses.ts`
- `apps/frontend/app/lib/queries/useCsv.ts`
- `apps/frontend/app/__tests__/AddExpenseModal.test.tsx`
- `apps/frontend/app/__tests__/Table.test.tsx`
- `apps/frontend/app/__tests__/expenses.page.test.tsx`
- `apps/frontend/app/__tests__/import-csv.test.tsx`
- `apps/frontend/app/__tests__/mocks/handlers.ts` (handlers de expenses + csv)

# Tarefa 8.0: Dashboard

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Tela inicial (`/`) com o resumo financeiro: gráfico de pizza do mês corrente (RF-019), gráfico de barras anual com seletor de ano (RF-017 / RF-018), lista das últimas despesas e fallback "Não possui dados para ser mostrado" (RF-020). Consome `current-month-summary` e `annual-summary` via hooks.

<requirements>
- RF-016: rota raiz `/` é o dashboard.
- RF-017 / RF-018: gráfico de barras com 12 meses; seletor de ano (default ano corrente).
- RF-019: gráfico de pizza com distribuição percentual do mês corrente por categoria.
- RF-020: quando `currentMonthSummary` retorna vazio, exibir "Não possui dados para ser mostrado".
- Reaproveitar `chartjs-setup` (bundle mínimo).
- Lista das últimas despesas usa `useExpenses` (sem filtros) limitada às mais recentes.
</requirements>

## Subtarefas

- [x] 8.1 Hooks: `useAnnualSummary(year)` e `useCurrentMonthSummary`.
- [x] 8.2 Componentes: `PieChart.tsx` (mês corrente) e `AnnualBarChart.tsx` (com seletor de ano).
- [x] 8.3 Página `app/page.tsx`: layout com pizza, barras e lista; tratar empty state da pizza com mensagem RF-020.
- [x] 8.4 Garantir que troca de ano refaz a query sem reload e atualiza o gráfico.
- [x] 8.5 Specs de componente/integração com MSW.
- [x] 8.6 Validação de build e execução completa dos testes.

## Detalhes de Implementação

Ver `techspec.md` → "Endpoints de API (summaries)", "Pontos de Integração (chart.js)" e "Riscos Conhecidos (Bundle size de chart.js)".

## Critérios de Sucesso

- Acessar `/` carrega os gráficos com dados retornados pela API mockada.
- Trocar o ano no `AnnualBarChart` dispara nova request e re-renderiza o gráfico.
- Sem dados no mês corrente, a pizza é substituída pela mensagem "Não possui dados para ser mostrado".
- `cd apps/frontend && npm run build && npm run lint && npm test` finaliza com sucesso.

## Testes da Tarefa

- [x] Componente: `PieChart.test.tsx` — render com dados; render do fallback quando dados vazios.
- [x] Componente: `AnnualBarChart.test.tsx` — seletor de ano altera a query e re-renderiza dataset.
- [x] Integração: `dashboard.page.test.tsx` (com MSW) — fluxo completo com pizza, barras e lista de últimas despesas.
- [x] Validação final: `cd apps/frontend && npm run build && npm run lint && npm test` finaliza com sucesso.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `apps/frontend/app/page.tsx`
- `apps/frontend/app/components/PieChart.tsx`
- `apps/frontend/app/components/AnnualBarChart.tsx`
- `apps/frontend/app/lib/queries/useSummaries.ts`
- `apps/frontend/app/__tests__/PieChart.test.tsx`
- `apps/frontend/app/__tests__/AnnualBarChart.test.tsx`
- `apps/frontend/app/__tests__/dashboard.page.test.tsx`
- `apps/frontend/app/__tests__/mocks/handlers.ts` (handlers de summaries)

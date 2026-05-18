# Tarefa 3.0: Módulo Expenses

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementar o domínio central — despesas — com CRUD, filtros combináveis (mês/ano/categoria) e agregações usadas pelo dashboard (`annual-summary` e `current-month-summary`). Inclui helpers `parseBRDate`/`formatBRDate` para isolar a conversão `DD/MM/AAAA` ↔ `YYYY-MM-DD` ISO sem `new Date()` afetado por timezone. Após esta tarefa, `CategoriesService.remove` passa a consultar o repositório real de despesas.

<requirements>
- RF-005: cadastrar despesa com data (DD/MM/AAAA), categoria existente e valor.
- RF-006: aceitar apenas valores `> 0`.
- RF-007: rejeitar despesa com `categoryId` inexistente (4xx padronizado).
- RF-008: excluir despesa individual.
- RF-009: listar despesas ordenadas por data desc.
- RF-010: filtros combináveis `month`, `year`, `categoryId`.
- RF-017 / RF-018: `annual-summary` retorna 12 buckets (mês 1..12) para o ano consultado, preenchendo zero quando não há despesas no mês.
- RF-019 / RF-020: `current-month-summary` retorna distribuição por categoria (`total`, `percentage`).
- Helpers `parseBRDate`/`formatBRDate` cobertos por specs com edge cases (01/01 e 31/12).
- Tarefa de regressão: `CategoriesService.remove` passa a respeitar despesas reais sem quebrar specs anteriores.
</requirements>

## Subtarefas

- [ ] 3.1 Criar `expenses/expense.entity.ts` com FK `categoryId` ON DELETE RESTRICT.
- [ ] 3.2 Criar DTOs: `dto/create-expense.dto.ts` e `dto/query-expenses.dto.ts` conforme techspec.
- [ ] 3.3 Criar `expenses/utils/date.ts` com `parseBRDate` e `formatBRDate` puras (sem `new Date` em UTC nu); cobrir specs.
- [ ] 3.4 Criar `expenses.service.ts` implementando a interface da techspec. Em `annualSummary`, montar 12 buckets; em `currentMonthSummary`, calcular percentuais com 2 casas decimais.
- [ ] 3.5 Criar `expenses.controller.ts` com CRUD + `GET /annual-summary` (query `year`) + `GET /current-month-summary`. Decoradores Swagger.
- [ ] 3.6 Criar `expenses.module.ts` importando `TypeOrmModule.forFeature([Expense])` e exportando o service.
- [ ] 3.7 Registrar `ExpensesModule` em `app.module.ts`.
- [ ] 3.8 Conectar `CategoriesService.remove` ao `ExpensesRepository` real (substituindo a porta usada na Tarefa 2.0); revalidar specs antigas.
- [ ] 3.9 Specs de unidade do service (incluindo agregações), do controller e dos helpers de data.
- [ ] 3.10 Spec e2e `expenses.e2e-spec.ts` cobrindo todos os RFs da feature, incluindo edge cases de timezone (despesa em 01/01/2024 e 31/12/2024).
- [ ] 3.11 Validação de build e execução completa dos testes.

## Detalhes de Implementação

Ver `techspec.md` → "Modelos de Dados (Expense)", "Interfaces Principais (ExpensesService)", "Endpoints de API (expenses + summaries)", "Riscos Conhecidos (Conversão de datas pt-BR)" e "Conformidade com Padrões".

## Critérios de Sucesso

- Todos os endpoints de expenses respondem conforme techspec.
- `annual-summary` sempre retorna 12 entradas para o `year` informado.
- `current-month-summary` retorna `[{ category, total, percentage }]` (ou array vazio).
- Tentativa de criar despesa com `categoryId` inexistente retorna 4xx padronizado.
- Tentativa de excluir categoria com despesa existente continua retornando 409 (regressão da Tarefa 2.0).
- `cd apps/backend && npm run build` sem erros.
- `cd apps/backend && npm test` executa **todos** os testes (módulos anteriores + expenses) com sucesso.
- `cd apps/backend && npm run test:e2e` executa todos os e2e (categories + expenses) com sucesso.

## Testes da Tarefa

- [ ] Unidade: `expenses.service.spec.ts` — CRUD, filtros combinados, `annualSummary` com mês vazio, `currentMonthSummary` empty/edge percentages.
- [ ] Unidade: `expenses.controller.spec.ts` — validação de DTO (data inválida, valor zero/negativo), mapeamento de erros.
- [ ] Unidade: `utils/date.spec.ts` — `parseBRDate('01/01/2024')`, `parseBRDate('31/12/2024')`, valores inválidos.
- [ ] Integração e2e: `test/expenses.e2e-spec.ts` cobrindo criar (válido/inválido), listar com filtros, excluir, summaries vazios e populados.
- [ ] Regressão: `categories.e2e-spec.ts` continua verde após substituição da porta por repositório real.
- [ ] Validação final: `cd apps/backend && npm run build && npm test && npm run test:e2e` finaliza com sucesso.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `apps/backend/src/expenses/expense.entity.ts`
- `apps/backend/src/expenses/dto/create-expense.dto.ts`
- `apps/backend/src/expenses/dto/query-expenses.dto.ts`
- `apps/backend/src/expenses/utils/date.ts`
- `apps/backend/src/expenses/utils/date.spec.ts`
- `apps/backend/src/expenses/expenses.service.ts`
- `apps/backend/src/expenses/expenses.service.spec.ts`
- `apps/backend/src/expenses/expenses.controller.ts`
- `apps/backend/src/expenses/expenses.controller.spec.ts`
- `apps/backend/src/expenses/expenses.module.ts`
- `apps/backend/src/categories/categories.service.ts` (atualização da regra `remove`)
- `apps/backend/test/expenses.e2e-spec.ts`

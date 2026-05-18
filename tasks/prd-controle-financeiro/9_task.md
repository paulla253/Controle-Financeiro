# Tarefa 9.0: E2E Playwright (banco isolado e fluxos críticos)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Configurar a suíte e2e Playwright contra um banco isolado (`./data/control.e2e.sqlite`) e cobrir os fluxos críticos da aplicação após as telas estarem prontas. Inclui o script de reset do banco, integração no `globalSetup`, scripts npm e specs cobrindo os fluxos do PRD.

<requirements>
- Banco e2e isolado em `./data/control.e2e.sqlite` apontado por `DATABASE_PATH` no contexto e2e.
- `globalSetup` executa `reset-db.ts` (apaga arquivo, roda migrations, popula seed).
- Scripts em `apps/e2e/package.json`: `test`, `test:headed`, `test:ui`, `db:reset`.
- Specs cobrindo: criar categoria→despesa→ver no dashboard; CSV inválido aborta tudo; filtros mês/ano/categoria; troca de ano no gráfico de barras.
</requirements>

## Subtarefas

- [x] 9.1 Criar `apps/e2e/scripts/reset-db.ts` (apaga `control.e2e.sqlite`, instancia `DataSource` apontando para o backend e roda `migrationsRun()` + seed mínimo).
- [x] 9.2 Adicionar scripts em `apps/e2e/package.json` (`test`, `test:headed`, `test:ui`, `db:reset`).
- [x] 9.3 Configurar `playwright.config.ts` com `globalSetup`, `webServer` para subir backend e frontend (via `cwd` apontando para os apps), `baseURL`.
- [x] 9.4 Configurar `DATABASE_PATH=./data/control.e2e.sqlite` no `webServer.env` do backend.
- [x] 9.5 Spec `tests/categoria-despesa-dashboard.spec.ts` — fluxo completo.
- [x] 9.6 Spec `tests/csv-import-erro.spec.ts` — CSV inválido aborta sem alterar contagem.
- [x] 9.7 Spec `tests/filtros-tabela.spec.ts` — combinações mês/ano/categoria.
- [x] 9.8 Spec `tests/grafico-barras-ano.spec.ts` — troca de ano atualiza dataset.
- [x] 9.9 Atualizar `apps/docker-compose.yml` (se aplicável) para suportar volume e2e em dev local.
- [x] 9.10 Validação de build e execução completa dos testes em todos os apps (regressão).

## Detalhes de Implementação

Ver `techspec.md` → "Testes de Integração (E2E aplicação)", "Sequenciamento (passo 9)" e "Dependências Técnicas".

## Critérios de Sucesso

- `cd apps/e2e && npm test` sobe backend + frontend, executa o reset-db e roda **todas** as specs com sucesso.
- O arquivo `./data/control.e2e.sqlite` é recriado a cada run; o banco de dev (`control.sqlite`) **nunca** é tocado.
- Regressão dos demais apps continua verde:
  - `cd apps/backend && npm run build && npm test && npm run test:e2e` ✅
  - `cd apps/frontend && npm run build && npm run lint && npm test` ✅

## Testes da Tarefa

- [x] E2E: `categoria-despesa-dashboard.spec.ts`.
- [x] E2E: `csv-import-erro.spec.ts`.
- [x] E2E: `filtros-tabela.spec.ts`.
- [x] E2E: `grafico-barras-ano.spec.ts`.
- [x] Sanidade: rerun consecutivo passa (idempotência do reset-db).
- [x] Validação final: builds e testes de todos os apps continuam passando.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `apps/e2e/package.json`
- `apps/e2e/playwright.config.ts`
- `apps/e2e/scripts/reset-db.ts`
- `apps/e2e/tests/categoria-despesa-dashboard.spec.ts`
- `apps/e2e/tests/csv-import-erro.spec.ts`
- `apps/e2e/tests/filtros-tabela.spec.ts`
- `apps/e2e/tests/grafico-barras-ano.spec.ts`
- `apps/docker-compose.yml`

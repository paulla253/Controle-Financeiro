# Tarefa 10.0: Polimento UX e Conformidade Final

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Última passada antes da entrega: revisar estados de loading/erro, formatos pt-BR, responsividade básica, conformidade com regras `nestjs-best-practices` e qualidade do Swagger (especialmente do contrato CSV). Garantir que todos os pacotes do monorepo continuam buildando e que toda a suíte de testes (backend unit + e2e, frontend, e2e Playwright) executa com sucesso.

<requirements>
- Estados de loading/erro/empty em todas as telas (skeleton, spinner ou texto).
- Datas e moedas exibidas em pt-BR via helpers centralizados em `format.ts` em todos os componentes.
- Toasts visíveis e não bloqueantes (RF-021) em todas as mutations.
- Swagger documenta o formato esperado do CSV (header, separador, encoding) com exemplo legível.
- Conformidade com `arch-feature-modules`, `arch-single-responsibility`, `arch-use-repository-pattern`, `api-use-pipes`, `api-use-dto-serialization`, `error-throw-http-exceptions`, `error-use-exception-filters`, `db-use-migrations`, `db-use-transactions`, `security-validate-all-input`, `test-use-testing-module`, `test-e2e-supertest`, `devops-use-config-module`, `devops-use-logging`.
- Smoke run completo: build + testes em todos os apps.
</requirements>

## Subtarefas

- [ ] 10.1 Auditar páginas (`/`, `/expenses`, `/categories`) e adicionar estados de loading/empty/error onde faltarem.
- [ ] 10.2 Revisar formatação pt-BR — varredura por usos diretos de `Intl.NumberFormat`/`Intl.DateTimeFormat` e centralizar em `format.ts`.
- [ ] 10.3 Validar acessibilidade básica de modais (foco inicial, escape para fechar, label nos inputs).
- [ ] 10.4 Verificar responsividade mínima (breakpoint mobile não quebra layout).
- [ ] 10.5 Refinar Swagger do CSV: incluir exemplo de CSV válido e descrição dos erros possíveis.
- [ ] 10.6 Rodar checklist de conformidade contra `.agents/skills/nestjs-best-practices/rules/`, anotando ajustes feitos.
- [ ] 10.7 Validação de build e execução completa de TODOS os testes do monorepo.

## Detalhes de Implementação

Ver `techspec.md` → "Considerações Técnicas", "Conformidade com Padrões" e "Riscos Conhecidos".

## Critérios de Sucesso

- Páginas exibem estado de loading e estado vazio adequados.
- Toda formatação pt-BR passa pelos helpers em `format.ts` (sem chamadas avulsas a `Intl.*`).
- Swagger em `/api/docs` mostra contrato CSV com exemplo legível.
- Nenhum desvio aberto contra as regras listadas.
- Smoke completo:
  - `cd apps/backend && npm run build && npm test && npm run test:e2e` ✅
  - `cd apps/frontend && npm run build && npm run lint && npm test` ✅
  - `cd apps/e2e && npm test` ✅

## Testes da Tarefa

- [ ] Frontend: testes existentes verdes; adicionar specs de loading/empty onde houver mudanças.
- [ ] Backend: testes existentes verdes; e2e cobre o exemplo Swagger do CSV (seguindo o exemplo, importa com sucesso).
- [ ] E2E Playwright: suíte completa verde.
- [ ] Validação final: smoke run dos três apps finaliza sem erros.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `apps/frontend/app/**` (telas, componentes e helpers tocados)
- `apps/backend/src/csv/csv.controller.ts` (Swagger refinado)
- `apps/backend/src/main.ts` (Swagger config)
- `apps/e2e/tests/*.spec.ts`

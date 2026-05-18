# Tarefa 2.0: Módulo Categories

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementar o domínio de categorias de despesas: entidade, DTOs, service, controller e endpoints `POST/GET/DELETE /api/v1/categories`. Inclui a regra de negócio RF-003 (exclusão proibida quando há despesas associadas → `409 Conflict`). Como o módulo Expenses ainda não existe, a verificação de "categoria com despesas" é feita por uma porta interna que será conectada ao repositório real na Tarefa 3.0; um teste de regressão garante que essa troca não quebra a regra.

<requirements>
- RF-001: cadastrar categoria informando o nome.
- RF-002: excluir categoria existente.
- RF-003: bloquear exclusão de categoria com despesas (HTTP 409 padronizado).
- RF-004: listar todas as categorias.
- DTO `CreateCategoryDto` validado por `class-validator` (`@IsString @MinLength(1) @MaxLength(50)`).
- Entidade `Category` com `name UNIQUE COLLATE NOCASE`.
- Padrão controller→service→repository (`@InjectRepository`).
- Documentação Swagger via `@ApiProperty` / `@ApiResponse`.
</requirements>

## Subtarefas

- [x] 2.1 Criar `categories/category.entity.ts` com colunas conforme techspec.
- [x] 2.2 Criar `categories/dto/create-category.dto.ts`.
- [x] 2.3 Criar `categories/categories.service.ts` (interface da techspec). `remove` consulta a porta de "tem despesas" e lança `ConflictException` quando houver.
- [x] 2.4 Criar `categories/categories.controller.ts` com `POST /`, `GET /`, `DELETE /:id` e decoradores Swagger.
- [x] 2.5 Criar `categories/categories.module.ts` importando `TypeOrmModule.forFeature([Category])`.
- [x] 2.6 Registrar `CategoriesModule` em `app.module.ts`.
- [x] 2.7 Specs de unidade do service e do controller (mocks via `getRepositoryToken`).
- [x] 2.8 Spec e2e `categories.e2e-spec.ts` cobrindo todos os RFs da feature.
- [x] 2.9 Validação de build e execução completa dos testes.

## Detalhes de Implementação

Ver `techspec.md` → "Modelos de Dados (Category)", "Endpoints de API (categories)", "Interfaces Principais (CategoriesService)" e "Conformidade com Padrões".

## Critérios de Sucesso

- `POST /api/v1/categories` cria e retorna 201 com `id` e `createdAt`.
- `GET /api/v1/categories` retorna array de categorias.
- `DELETE /api/v1/categories/:id` retorna 204 quando não há despesas e 409 padronizado quando há.
- Nome duplicado (case-insensitive) retorna 409.
- Swagger documenta todos os endpoints.
- `cd apps/backend && npm run build` finaliza sem erros.
- `cd apps/backend && npm test` executa **todos** os testes presentes com sucesso.
- `cd apps/backend && npm run test:e2e` executa todos os specs e2e com sucesso.

## Testes da Tarefa

- [x] Unidade: `categories.service.spec.ts` — `create`, `findAll`, `findByName`, `remove` (com e sem despesas), erro de duplicidade.
- [x] Unidade: `categories.controller.spec.ts` — validação de DTO, mapeamento de erros (mock do service).
- [x] Integração e2e: `test/categories.e2e-spec.ts` com SQLite `:memory:` rodando migrations no `beforeAll`. Casos: criar, listar, excluir, conflito 409, nome duplicado.
- [x] Validação final: `cd apps/backend && npm run build && npm test && npm run test:e2e` finaliza com sucesso.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `apps/backend/src/categories/category.entity.ts`
- `apps/backend/src/categories/dto/create-category.dto.ts`
- `apps/backend/src/categories/categories.service.ts`
- `apps/backend/src/categories/categories.service.spec.ts`
- `apps/backend/src/categories/categories.controller.ts`
- `apps/backend/src/categories/categories.controller.spec.ts`
- `apps/backend/src/categories/categories.module.ts`
- `apps/backend/test/categories.e2e-spec.ts`
- `apps/backend/src/app.module.ts` (registrar módulo)

# Tech Spec — Controle Financeiro

## Resumo Executivo

A solução é um monorepo já provisionado em `apps/` com três sub-projetos: **backend** (NestJS 11), **frontend** (Next.js 16 + React 19 + Tailwind v4) e **e2e** (Playwright). O backend expõe uma API REST versionada (`/api/v1/...`) documentada via Swagger, persistindo dados em **SQLite** local através de **TypeORM** com driver `better-sqlite3` e migrations versionadas. O frontend é uma SPA client-side em App Router (rotas `/`, `/expenses`, `/categories`) consumindo a API com **TanStack Query** e renderizando gráficos com **react-chartjs-2** (wrapper oficial sobre chart.js).

A arquitetura privilegia simplicidade evolutiva e separação clara: três módulos de domínio no backend (`categories`, `expenses`, `csv`) seguindo padrão controller→service→repository do TypeORM; um cliente HTTP único e hooks de query no frontend; e bancos de dados isolados entre desenvolvimento e e2e via volume Docker. Validação é centralizada em `class-validator`/`class-transformer` por DTO; erros de regra de negócio (ex.: categoria com despesas, importação CSV inválida) são propagados como `HttpException` específicas e tratados por um `ExceptionFilter` global que padroniza o payload de erro consumido pelo frontend.

> **Convenção de idiomas neste documento**: todos os identificadores de código (módulos, classes, entidades, colunas, DTOs, métodos, rotas, hooks, componentes, variáveis de ambiente) são em **inglês**. Toda a prosa descritiva — explicações, justificativas, descrições de ações e comentários — é em **português**.

## Arquitetura do Sistema

### Visão Geral dos Componentes

**Backend (`apps/backend/src/`)** — novos módulos a criar:

- `app.module.ts` (modificar) — registrar `TypeOrmModule.forRoot`, `ConfigModule`, módulos de domínio e `APP_FILTER` global.
- `main.ts` (modificar) — habilitar `ValidationPipe` global, versionamento URI (`app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })`), Swagger em `/api/docs`, CORS para o frontend.
- `database/data-source.ts` (novo) — `DataSource` TypeORM exportado para CLI de migrations + bootstrap.
- `database/migrations/` (novo) — migrations versionadas (`*-init.ts` cria `categories` e `expenses`).
- `categories/` (novo) — `category.entity.ts`, `categories.module.ts`, `categories.controller.ts`, `categories.service.ts`, DTOs (`create-category.dto.ts`), specs.
- `expenses/` (novo) — `expense.entity.ts`, `expenses.module.ts`, `expenses.controller.ts`, `expenses.service.ts`, DTOs (`create-expense.dto.ts`, `query-expenses.dto.ts`), specs.
- `csv/` (novo) — `csv.module.ts`, `csv.controller.ts`, `csv.service.ts` (orquestra import/export, recebe `MulterModule` para upload). Depende de `CategoriesService` e `ExpensesService`.
- `common/filters/http-exception.filter.ts` (novo) — formata erros para o frontend.
- `common/interceptors/logging.interceptor.ts` (novo) — log de request/response em DEBUG.

**Frontend (`apps/frontend/`)** — novos arquivos:

- `app/layout.tsx` (modificar) — header fixo com nav (Dashboard/Expenses/Categories), `QueryClientProvider`, fontes Inter + Material Symbols, providers de toast.
- `app/page.tsx` (modificar) — Dashboard (gráficos pizza + barras + lista das últimas despesas).
- `app/expenses/page.tsx` (novo) — tabela filtrável + botões New/Import/Export.
- `app/categories/page.tsx` (novo) — listagem + botão New Category.
- `app/components/` (novo) — `Header.tsx`, `PieChart.tsx`, `AnnualBarChart.tsx`, `AddExpenseModal.tsx`, `AddCategoryModal.tsx`, `Toast.tsx`, `Table.tsx`.
- `app/lib/api-client.ts` (novo) — wrapper `fetch` com base URL e tratamento de erro padronizado.
- `app/lib/queries/` (novo) — hooks `useCategories`, `useExpenses`, `useAnnualSummary`, `useCurrentMonthSummary`, `useImportCsv`, `useExportCsv`.
- `app/lib/format.ts` (novo) — helpers `formatCurrencyBRL`, `formatDateBR`, `parseDateBR` (formatação regional pt-BR; identificadores em inglês).
- `app/__tests__/` (novo) — specs de componente/integração com MSW.

**Banco SQLite** — arquivo persistido em volume Docker (`./data/control.sqlite` montado em `/data` no container). Banco e2e isolado em `./data/control.e2e.sqlite` com migrations + seed dedicados.

**Fluxo de dados**: usuário interage com Client Component → hook TanStack Query → `api-client.ts` → REST `/api/v1/...` → controller (valida DTO) → service (regra de negócio + transação) → repository TypeORM → SQLite. Resposta segue o caminho inverso; `QueryClient` invalida caches relacionados após mutations e dispara toast de feedback (RF-021).

## Design de Implementação

### Interfaces Principais

```ts
// apps/backend/src/categories/categories.service.ts
export interface CategoriesService {
  create(dto: CreateCategoryDto): Promise<Category>;
  findAll(): Promise<Category[]>;
  findByName(name: string): Promise<Category | null>;
  remove(id: number): Promise<void>; // lança ConflictException se houver despesas
}

// apps/backend/src/expenses/expenses.service.ts
export interface ExpensesService {
  create(dto: CreateExpenseDto): Promise<Expense>;
  findAll(filters: QueryExpensesDto): Promise<Expense[]>;
  remove(id: number): Promise<void>;
  annualSummary(year: number): Promise<MonthSummaryDto[]>;        // 12 buckets, 0..N
  currentMonthSummary(): Promise<CategorySummaryDto[]>;            // soma por categoria
}

// apps/backend/src/csv/csv.service.ts
export interface CsvService {
  import(buffer: Buffer): Promise<{ imported: number }>; // tudo-ou-nada
  export(): Promise<Buffer>;
}
```

### Modelos de Dados

**Entidade `Category`** (tabela `categories`):

| Coluna | Tipo | Restrições |
|---|---|---|
| id | INTEGER | PK auto-increment |
| name | TEXT | NOT NULL, UNIQUE (case-insensitive via collation `NOCASE`) |
| createdAt | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP |

**Entidade `Expense`** (tabela `expenses`):

| Coluna | Tipo | Restrições |
|---|---|---|
| id | INTEGER | PK auto-increment |
| date | DATE | NOT NULL (`YYYY-MM-DD` ISO no DB) |
| amount | NUMERIC(12,2) | NOT NULL CHECK (amount > 0) |
| categoryId | INTEGER | NOT NULL FK→categories.id ON DELETE RESTRICT |
| createdAt | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP |

Índices: `idx_expenses_date` (consultas por mês/ano), `idx_expenses_category_id` (filtro + restrição de exclusão).

**DTOs de entrada (class-validator)**:

```ts
class CreateCategoryDto { @IsString() @MinLength(1) @MaxLength(50) name!: string; }

class CreateExpenseDto {
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/) date!: string;          // DD/MM/AAAA
  @IsInt() @IsPositive() categoryId!: number;
  @IsNumber({ maxDecimalPlaces: 2 }) @IsPositive() amount!: number;
}

class QueryExpensesDto {
  @IsOptional() @IsInt() @Min(1) @Max(12) month?: number;
  @IsOptional() @IsInt() @Min(2000) year?: number;
  @IsOptional() @IsInt() @IsPositive() categoryId?: number;
}
```

Conversão `DD/MM/AAAA` ↔ `Date` ISO ocorre no service (helpers `parseBRDate`/`formatBRDate`); a entidade armazena ISO.

### Endpoints de API

Base: `/api/v1`. Documentação Swagger em `/api/docs`.

| Método | Caminho | Descrição | Body / Query | Resposta |
|---|---|---|---|---|
| POST | `/categories` | Criar categoria (RF-001) | `CreateCategoryDto` | 201 `Category` |
| GET | `/categories` | Listar categorias (RF-004) | — | 200 `Category[]` |
| DELETE | `/categories/:id` | Excluir (RF-002, RF-003) | — | 204 / 409 se houver despesa |
| POST | `/expenses` | Criar despesa (RF-005..007) | `CreateExpenseDto` | 201 `Expense` |
| GET | `/expenses` | Listar com filtros (RF-009, RF-010) | `month`, `year`, `categoryId` | 200 `Expense[]` |
| DELETE | `/expenses/:id` | Excluir (RF-008) | — | 204 |
| GET | `/expenses/annual-summary` | Soma mês a mês de um ano (RF-017, RF-018) | `year` | 200 `[{month:1..12, total}]` |
| GET | `/expenses/current-month-summary` | Distribuição por categoria do mês corrente (RF-019, RF-020) | — | 200 `[{category, total, percentage}]` |
| POST | `/csv/import` | Upload `multipart/form-data` campo `file` (RF-011..014) | arquivo CSV | 200 `{ imported }` ou 400 com `errorLine` |
| GET | `/csv/export` | Download CSV de todas as despesas (RF-015) | — | 200 `text/csv; charset=utf-8` |

Formato de erro padrão (filter global): `{ statusCode, message, error, details? }`.

## Pontos de Integração

Não há serviços externos. Integrações internas:

- **Multer** (`@nestjs/platform-express` + `multer`): upload do CSV em memória (`memoryStorage`), limite 5 MB.
- **Swagger** (`@nestjs/swagger`): geração automática a partir dos DTOs e decoradores `@ApiProperty`/`@ApiResponse`.
- **CORS**: liberado para `http://localhost:3001` (origem do frontend).
- **chart.js + react-chartjs-2**: renderização cliente; registro explícito dos controllers (`BarController`, `DoughnutController`, etc.) em arquivo único de bootstrap (`app/lib/chartjs-setup.ts`).

Tratamento de erros do CSV: `csv-parse` em modo síncrono dentro de um `dataSource.transaction(async manager => { ... })`. Qualquer linha inválida lança `BadRequestException({ message, line, reason })` e a transação faz rollback automático (RF-013).

## Abordagem de Testes

### Testes Unidade

**Backend (Jest, `*.spec.ts`)** — todo provider/controller obrigatório:

- `CategoriesService` — criação, listagem, exclusão com/sem despesas associadas (mock de `Repository<Expense>` via `getRepositoryToken`).
- `ExpensesService` — filtros combinados, agregações `annualSummary` e `currentMonthSummary`, parsing de data BR.
- `CsvService` — happy path, linha inválida em qualquer posição (asserir 0 inserts), criação automática de categorias inexistentes durante import (RF-012).
- `Controllers` — validação de DTO, mapeamento de erros, contratos (mock dos services).
- Mocks limitados a serviços externos (FS, Multer); banco real não é exercitado em unit.

**Frontend (Jest + RTL + MSW, `__tests__/`)** — sem teste unitário puro; foco em componente/integração:

- `AddExpenseModal` — submissão válida, valor ≤ 0, categoria não selecionada.
- `Table` de despesas — filtros mês/ano/categoria propagam à query, exclusão otimista.
- `Dashboard` — render de pizza com dados, fallback "Não possui dados para ser mostrado" (RF-020), troca de ano no gráfico de barras.
- `ImportCsv` — toast de sucesso e erro com detalhe de linha.

### Testes de Integração

**Backend e2e (`apps/backend/test/*.e2e-spec.ts` com supertest)** — um spec por endpoint:

- Sobe `Test.createTestingModule` com `TypeOrmModule` apontando para SQLite em memória (`:memory:`) e roda migrations no `beforeAll`.
- Cobre todos os RFs: criar/listar/excluir categoria, conflito 409, criação/filtro/exclusão de despesa, resumo anual/mensal, import com sucesso e abortado, export com BOM UTF-8.

**E2E aplicação (`apps/e2e/tests/*.spec.ts` com Playwright)** — fluxos críticos:

- Criar categoria → criar despesa → ver no dashboard.
- Importar CSV inválido → mensagem de erro, nenhuma despesa criada.
- Filtrar tabela por mês/ano + categoria.
- Trocar ano no gráfico de barras.

E2E usa banco isolado `./data/control.e2e.sqlite`; um script `apps/e2e/scripts/reset-db.ts` apaga o arquivo, executa migrations e popula seed antes do `globalSetup` do Playwright.

## Sequenciamento de Desenvolvimento

### Ordem de Construção

1. **Infra backend**: instalar deps (`typeorm`, `better-sqlite3`, `@nestjs/typeorm`, `@nestjs/swagger`, `@nestjs/config`, `class-validator`, `class-transformer`, `csv-parse`, `csv-stringify`, `multer`, `@types/multer`); criar `data-source.ts`, primeira migration, `ValidationPipe` global, Swagger, exception filter. Sem isso nada compila.
2. **Módulo Categories** (sem dependências) — entidade, service, controller, DTOs, specs e e2e completos.
3. **Módulo Expenses** (depende de categories para FK e RF-007) — idem; inclui agregações para o dashboard.
4. **Módulo CSV** (depende dos dois anteriores) — import/export com transação tudo-ou-nada.
5. **Infra frontend**: instalar deps (`@tanstack/react-query`, `chart.js`, `react-chartjs-2`, `msw` em dev); `QueryClientProvider`, `api-client`, layout/header, helpers de formatação.
6. **Tela Categories** — caminho mais simples para validar fluxo client→backend.
7. **Tela Expenses** — tabela, filtros, modal de cadastro, importar/exportar.
8. **Dashboard** — gráficos consumindo `annual-summary` e `current-month-summary`, fallback vazio.
9. **E2E Playwright** — após telas completas; configurar reset do banco de e2e.
10. **Polimento UX** — toasts, estados de loading/erro, revisão de formatos pt-BR e responsividade básica.

### Dependências Técnicas

- Node 20 (Alpine nos Dockerfiles existentes).
- Volume Docker `./data:/data` no serviço backend (atualizar `apps/docker-compose.yml`).
- Variáveis `DATABASE_PATH` (default `/data/control.sqlite`) e `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:3000/api/v1`).

## Monitoramento e Observabilidade

Aplicação local single-user, sem stack Prometheus/Grafana. Observabilidade mínima:

- **Logger nativo do NestJS** com nível configurável via `LOG_LEVEL` (`log`, `debug`, `error`).
- `LoggingInterceptor` registra método, rota, status e duração de cada request.
- Erros tratados pelo `HttpExceptionFilter` são logados em `error` com stack; erros de import CSV incluem número da linha.
- Frontend: `console.error` em falhas de mutation + toast visual (RF-021); sem telemetria externa.

## Considerações Técnicas

### Decisões Principais

- **better-sqlite3 + migrations**: driver síncrono mais rápido e estável para SQLite; migrations versionadas evitam o risco de `synchronize:true` quando o schema evoluir.
- **`csv-parse`/`csv-stringify`**: parser maduro com modo síncrono adequado a transações curtas; suporta validação por linha o que se alinha ao requisito de abortar tudo (RF-013). Alternativa `fast-csv` foi descartada por ser mais opinativa em streaming.
- **TanStack Query 100% client-side**: mantém a UI reativa sem complexidade de Server Components/Route Handlers, simplifica testes com MSW e é suficiente para uso pessoal local.
- **react-chartjs-2** como wrapper oficial de chart.js: integra com hooks/props sem `useEffect` manual em `<canvas>`.
- **URI versioning (`/api/v1/...`)**: alinha com a regra `api-versioning` do skill `nestjs-best-practices` e protege contra quebras futuras.
- **Bancos SQLite separados** (dev vs e2e): impede que a suíte e2e corrompa dados pessoais.
- **Modais como Client Components**: evita over-engineering com Server Actions; toda interação de escrita passa por TanStack Query mutations.

### Riscos Conhecidos

- **Conversão de datas pt-BR ↔ ISO**: divergências de timezone podem mover datas em ±1 dia. Mitigação: tratar `date` como string pura `YYYY-MM-DD` no banco e nunca passar por `new Date()` sem fixar fuso `UTC`. Helpers centralizados (`parseBRDate`/`formatBRDate`) e specs cobrindo `01/01/2024` e `31/12/2024`.
- **Encoding CSV**: planilhas BR exportadas do Excel costumam vir em `windows-1252` com `;` como delimitador. Mitigação: aceitar BOM UTF-8 e detectar `;` vs `,` (auto-detect do `csv-parse`); documentar formato esperado no Swagger.
- **Race em import simultâneo de categorias**: `RF-012` cria categoria caso não exista; vários inserts paralelos do mesmo nome poderiam violar UNIQUE. Mitigação: import roda em transação serial e usa `ON CONFLICT DO NOTHING` + lookup pós-insert.
- **Volume Docker em ambiente dev local sem Docker**: usuário pode rodar `npm run start:dev` direto. Mitigação: `DATABASE_PATH` com fallback para `./data/control.sqlite` relativo ao backend.
- **Bundle size de chart.js**: importar apenas controllers necessários (`BarController`, `DoughnutController`, escalas e elementos) em `chartjs-setup.ts`.

### Conformidade com Padrões

`.claude/rules` não existe no repositório; aplicáveis as `rules` de `.agents/skills/nestjs-best-practices/rules/`:

- `arch-feature-modules.md` — módulos `categories`, `expenses`, `csv` por feature.
- `arch-single-responsibility.md` — controller só orquestra; service contém regra; repository = TypeORM.
- `arch-use-repository-pattern.md` — `@InjectRepository(Expense)` no service.
- `api-use-pipes.md` — `ValidationPipe` global com `whitelist: true, transform: true`.
- `api-use-dto-serialization.md` — DTOs de entrada e `@Expose` em entidades retornadas.
- `error-throw-http-exceptions.md` + `error-use-exception-filters.md` — `BadRequestException`, `ConflictException`, `NotFoundException` + filter global.
- `db-use-migrations.md` — migrations versionadas; sem `synchronize:true`.
- `db-use-transactions.md` — `dataSource.transaction` no import CSV.
- `security-validate-all-input.md` — class-validator em todos os DTOs.
- `test-use-testing-module.md` + `test-e2e-supertest.md` — `Test.createTestingModule` em unit e supertest em e2e.
- `devops-use-config-module.md` + `devops-use-logging.md` — `@nestjs/config` para `DATABASE_PATH`/`LOG_LEVEL`; logger nativo.

Sem desvios identificados.

### Arquivos relevantes e dependentes

- `apps/backend/src/main.ts`, `apps/backend/src/app.module.ts` — bootstrap e wiring.
- `apps/backend/src/database/data-source.ts`, `apps/backend/src/database/migrations/*.ts` — schema.
- `apps/backend/src/categories/**`, `apps/backend/src/expenses/**`, `apps/backend/src/csv/**` — domínio.
- `apps/backend/src/common/filters/http-exception.filter.ts`, `apps/backend/src/common/interceptors/logging.interceptor.ts` — cross-cutting.
- `apps/backend/test/*.e2e-spec.ts`, `apps/backend/test/jest-e2e.json` — e2e backend.
- `apps/backend/.env.example`, `apps/docker-compose.yml`, `apps/backend/Dockerfile` — infra.
- `apps/frontend/app/layout.tsx`, `apps/frontend/app/page.tsx`, `apps/frontend/app/expenses/page.tsx`, `apps/frontend/app/categories/page.tsx` — rotas.
- `apps/frontend/app/components/**`, `apps/frontend/app/lib/**`, `apps/frontend/app/__tests__/**` — UI, dados e testes.
- `apps/frontend/jest.config.ts`, `apps/frontend/jest.setup.ts` — config Jest + MSW (a criar).
- `apps/e2e/tests/*.spec.ts`, `apps/e2e/scripts/reset-db.ts`, `apps/e2e/playwright.config.ts` — e2e aplicação.
- `layout/DESIGN.md`, `layout/dashboard/code.html`, `layout/gerenciamento_de_despesas/code.html`, `layout/gerenciamento_de_categorias/code.html`, `layout/modal_adicionar_despesa/code.html`, `layout/modal_cadastro_de_categoria/code.html` — referências visuais (nomes de arquivos preservados como estão na pasta `layout/` existente).

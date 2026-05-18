# Tarefa 1.0: Infra Backend (TypeORM + SQLite + Swagger + Validation + Filters)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Estabelecer toda a fundação do backend NestJS antes de qualquer módulo de domínio: instalação de dependências, configuração do TypeORM com `better-sqlite3`, primeira migration que cria as tabelas `categories` e `expenses`, `ValidationPipe` global, versionamento de URI (`/api/v1/...`), Swagger em `/api/docs`, `HttpExceptionFilter` global e `LoggingInterceptor`. Sem este alicerce nenhum dos módulos seguintes compila.

<requirements>
- Backend deve subir com `npm run start:dev` sem erros e expor `/api/docs` (Swagger) e `/api/v1` (rotas).
- Migrations versionadas; `synchronize: true` proibido.
- `ValidationPipe` global com `whitelist: true, transform: true`.
- `HttpExceptionFilter` padroniza payload de erro como `{ statusCode, message, error, details? }`.
- `LoggingInterceptor` registra método, rota, status e duração de cada request.
- Banco SQLite persiste em arquivo apontado por `DATABASE_PATH` (default `./data/control.sqlite`); fallback funciona fora do Docker.
- CORS liberado para `http://localhost:3001`.
- Conformidade com as regras `db-use-migrations`, `api-use-pipes`, `error-use-exception-filters`, `devops-use-config-module`, `devops-use-logging`.
</requirements>

## Subtarefas

- [x] 1.1 Instalar dependências runtime: `@nestjs/typeorm`, `typeorm`, `better-sqlite3`, `@nestjs/swagger`, `@nestjs/config`, `class-validator`, `class-transformer`, `csv-parse`, `csv-stringify`, `multer`. Devs: `@types/multer`.
- [x] 1.2 Criar `src/database/data-source.ts` exportando `DataSource` para CLI de migrations e bootstrap (via `forRootAsync`). Ler `DATABASE_PATH` do `ConfigService`.
- [x] 1.3 Adicionar scripts de migration em `package.json`: `typeorm:run`, `typeorm:revert`, `migration:generate`.
- [x] 1.4 Criar a primeira migration (`*-init.ts`) que cria `categories` (com coluna `name UNIQUE COLLATE NOCASE`) e `expenses` (com FK ON DELETE RESTRICT, índices `idx_expenses_date` e `idx_expenses_category_id`).
- [x] 1.5 Modificar `app.module.ts` para registrar `ConfigModule.forRoot({ isGlobal: true })`, `TypeOrmModule.forRootAsync` apontando para o `data-source` e `APP_FILTER` global.
- [x] 1.6 Modificar `main.ts`: `ValidationPipe` global (`whitelist: true, transform: true`), `app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })`, `DocumentBuilder` + `SwaggerModule` em `/api/docs`, CORS para `http://localhost:3001`.
- [x] 1.7 Criar `common/filters/http-exception.filter.ts` que padroniza erros e loga em `error` com stack.
- [x] 1.8 Criar `common/interceptors/logging.interceptor.ts` registrando método/rota/status/duração.
- [x] 1.9 Criar `.env.example` com `DATABASE_PATH`, `LOG_LEVEL`, `PORT`.
- [x] 1.10 Atualizar `apps/docker-compose.yml` com volume `./data:/data` no serviço backend e env `DATABASE_PATH=/data/control.sqlite`.
- [x] 1.11 Specs de unidade do filter e do interceptor.
- [x] 1.12 Validação de build e execução completa dos testes (ver "Critérios de Sucesso").

## Detalhes de Implementação

Ver `techspec.md` → seções "Visão Geral dos Componentes (Backend)", "Modelos de Dados", "Pontos de Integração", "Decisões Principais" e "Conformidade com Padrões".

## Critérios de Sucesso

- `cd apps/backend && npm run build` finaliza sem erros TypeScript.
- `cd apps/backend && npm run start:dev` sobe a aplicação, executa as migrations e o arquivo SQLite é criado em `DATABASE_PATH`.
- Acesso a `http://localhost:3000/api/docs` abre o Swagger sem erros.
- `cd apps/backend && npm test` executa **todos** os testes presentes com sucesso.
- `cd apps/backend && npm run test:e2e` executa todos os specs e2e com sucesso.
- Erros lançados em rotas inexistentes seguem o formato `{ statusCode, message, error }`.

## Testes da Tarefa

- [x] Unidade: `http-exception.filter.spec.ts` — formata `BadRequestException`, `ConflictException` e erro genérico no payload padronizado.
- [x] Unidade: `logging.interceptor.spec.ts` — registra método/rota/status/duração simulando `Reflector` e `CallHandler`.
- [x] Integração: `app.e2e-spec.ts` (ou equivalente já existente) sobe `Test.createTestingModule` com SQLite `:memory:`, roda migrations no `beforeAll` e bate em uma rota inexistente sob `/api/v1` retornando 404 padronizado.
- [x] Validação final: `cd apps/backend && npm run build && npm test && npm run test:e2e` finaliza com sucesso.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `apps/backend/package.json`
- `apps/backend/src/main.ts`
- `apps/backend/src/app.module.ts`
- `apps/backend/src/database/data-source.ts`
- `apps/backend/src/database/migrations/*-init.ts`
- `apps/backend/src/common/filters/http-exception.filter.ts`
- `apps/backend/src/common/filters/http-exception.filter.spec.ts`
- `apps/backend/src/common/interceptors/logging.interceptor.ts`
- `apps/backend/src/common/interceptors/logging.interceptor.spec.ts`
- `apps/backend/.env.example`
- `apps/docker-compose.yml`

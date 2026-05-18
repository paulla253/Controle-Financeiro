# Tarefa 4.0: Módulo CSV (Import/Export)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementar import e export CSV em transação tudo-ou-nada, com auto-criação de categoria inexistente durante o import (RF-012) e detecção de erro com indicação da linha problemática (RF-013). O export gera CSV com BOM UTF-8 e colunas Data/Categoria/Valor (RF-015) no formato pt-BR.

<requirements>
- Upload `multipart/form-data` campo `file`, limite 5 MB, `memoryStorage`.
- Aceitar BOM UTF-8 e auto-detectar `;` ou `,` como delimitador via `csv-parse`.
- Import roda dentro de `dataSource.transaction(...)`; qualquer linha inválida lança `BadRequestException({ message, line, reason })` e nenhum dado é persistido.
- Categoria ausente é criada com `ON CONFLICT DO NOTHING` + lookup pós-insert (mitiga race em UNIQUE).
- Export retorna `text/csv; charset=utf-8` com BOM, datas em DD/MM/AAAA e valores no formato BR.
- Confirmação ao usuário com `{ imported: number }` (RF-014).
</requirements>

## Subtarefas

- [ ] 4.1 Criar `csv/csv.module.ts` com `MulterModule.register({ storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })`. Importar `CategoriesModule` e `ExpensesModule`.
- [ ] 4.2 Criar `csv/csv.service.ts` com `import(buffer)` e `export()`; toda escrita ocorre dentro de `dataSource.transaction`.
- [ ] 4.3 Implementar parsing síncrono via `csv-parse/sync` com `bom: true`, `delimiter: [',', ';']`, `columns: true`. Validar linha a linha e mapear erros para `BadRequestException` com `line` e `reason`.
- [ ] 4.4 Implementar criação automática de categoria com idempotência (`ON CONFLICT DO NOTHING` + `findByName`).
- [ ] 4.5 Implementar `export` com `csv-stringify/sync`, BOM `﻿`, headers `Data,Categoria,Valor`, datas e valores formatados pt-BR.
- [ ] 4.6 Criar `csv/csv.controller.ts` com `POST /csv/import` (`@UseInterceptors(FileInterceptor('file'))`) e `GET /csv/export` (`Response` com `Content-Type` e `Content-Disposition`).
- [ ] 4.7 Decoradores Swagger documentando o formato esperado do CSV (cabeçalho, separador, encoding) com exemplo.
- [ ] 4.8 Registrar `CsvModule` em `app.module.ts`.
- [ ] 4.9 Specs de unidade do service e do controller.
- [ ] 4.10 Spec e2e `csv.e2e-spec.ts` cobrindo happy path, linha inválida em diversas posições (asserir 0 inserts), BOM/`;`/`,`, export com BOM e datas formatadas.
- [ ] 4.11 Validação de build e execução completa dos testes.

## Detalhes de Implementação

Ver `techspec.md` → "CsvService", "Endpoints de API (csv)", "Pontos de Integração (Multer)", "Tratamento de erros do CSV", "Riscos Conhecidos (Encoding CSV, Race em import)".

## Critérios de Sucesso

- Import com CSV válido retorna 200 `{ imported: N }` e cria todas as despesas e categorias necessárias.
- Import com qualquer linha inválida retorna 400 `{ statusCode, message, error, details: { line, reason } }` e o banco permanece inalterado.
- Import respeita BOM UTF-8 e tanto `,` quanto `;`.
- Export retorna `text/csv; charset=utf-8`, primeiro byte é o BOM `0xEF 0xBB 0xBF`, datas em DD/MM/AAAA e valores em formato BR.
- `cd apps/backend && npm run build` sem erros.
- `cd apps/backend && npm test` executa **todos** os testes (módulos anteriores + csv) com sucesso.
- `cd apps/backend && npm run test:e2e` executa todos os e2e com sucesso.

## Testes da Tarefa

- [ ] Unidade: `csv.service.spec.ts` — happy path, linha inválida na primeira/no meio/última posição (asserir rollback), categoria criada automaticamente, BOM e `;`/`,` aceitos.
- [ ] Unidade: `csv.controller.spec.ts` — upload válido, ausência de arquivo, arquivo > 5 MB.
- [ ] Integração e2e: `test/csv.e2e-spec.ts` com SQLite `:memory:` — import válido, import abortado (verifica contagem zero pós-rollback), export com BOM e formato pt-BR.
- [ ] Validação final: `cd apps/backend && npm run build && npm test && npm run test:e2e` finaliza com sucesso.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `apps/backend/src/csv/csv.module.ts`
- `apps/backend/src/csv/csv.service.ts`
- `apps/backend/src/csv/csv.service.spec.ts`
- `apps/backend/src/csv/csv.controller.ts`
- `apps/backend/src/csv/csv.controller.spec.ts`
- `apps/backend/test/csv.e2e-spec.ts`
- `apps/backend/src/app.module.ts` (registrar módulo)

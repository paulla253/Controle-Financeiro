# Controle Financeiro

Aplicacao de controle financeiro pessoal, com backend em NestJS, frontend em Next.js e testes E2E com Playwright.

## Estrutura do Projeto

```
apps/
  backend/    # API REST com NestJS + SQLite
  frontend/   # Interface com Next.js + Tailwind CSS
  e2e/        # Testes end-to-end com Playwright
```

## Como Executar

### Pre-requisitos

- Docker
- Docker Compose

### Subir os servicos

Execute na pasta `apps/`:

```bash
docker-compose up --build
```

- Backend disponivel em `http://localhost:3000`
- Frontend disponivel em `http://localhost:3001`

### Testes E2E (Playwright)

O Playwright sobe o backend e o frontend automaticamente antes de rodar os testes.

```bash
cd apps/e2e

# Instale as dependencias (primeira vez)
npm install
npx playwright install chromium

# Reseta o banco isolado de e2e
npm run db:reset

# Executa os testes
npm test

# Opcoes adicionais
npm run test:headed   # abre o navegador visualmente
npm run test:ui       # abre a UI interativa do Playwright
npm run report        # abre o relatorio HTML na porta 9300
```

> O banco de dados utilizado nos testes E2E e isolado (`data/control.e2e.sqlite`) e zerado a cada execucao de `db:reset`.

---

## Fluxo de Desenvolvimento com Claude Code

O desenvolvimento deste projeto seguiu um fluxo estruturado orientado por documentos e comandos customizados.

### Prompt Inicial

O arquivo `prompt_inicial.md` na raiz do projeto foi utilizado para dar inicio ao desenvolvimento. Ele define:

- **Objetivo:** aplicacao monorepo de controle financeiro pessoal
- **Diretrizes de negocio:** gerenciamento de categorias e despesas, importacao/exportacao CSV, graficos de barras e pizza
- **Diretrizes tecnicas:** NestJS + TypeORM + SQLite no backend, Next.js + Chart.js no frontend, testes com Jest e Playwright
- **Layout:** referencias visuais na pasta `layout/` com telas e modais prontos
- **Fora do escopo:** multiplos usuarios, login, metas de investimento, testes de performance

### Templates

A pasta `templates/` contem os moldes utilizados pelo Claude Code para gerar os documentos de planejamento do projeto:

| Template               | Descricao                                |
| ---------------------- | ---------------------------------------- |
| `prd-template.md`      | Documento de Requisitos de Produto (PRD) |
| `techspec-template.md` | Especificacao Tecnica de implementacao   |
| `tasks-template.md`    | Lista resumida de tarefas de alto nivel  |
| `task-template.md`     | Detalhamento individual de cada tarefa   |

### Comandos (Slash Commands)

A pasta `commands/` contem instrucoes para os slash commands customizados do Claude Code, que guiam a geracao dos documentos de planejamento a partir dos templates:

| Comando           | O que faz                                                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `/criar-prd`      | Gera o PRD fazendo perguntas de clarificacao antes de produzir o documento                                                         |
| `/criar-techspec` | Gera a Tech Spec explorando o projeto e fazendo perguntas de clarificacao                                                          |
| `/criar-tasks`    | Gera a lista de tarefas a partir do PRD e da Tech Spec, exibindo uma lista de alto nivel para aprovacao antes de criar os arquivos |

Os documentos gerados ficam em `tasks/prd-controle-financeiro/` e sao referenciados pelas tasks individuais durante a implementacao.

---

## Skills Utilizadas

Este projeto foi desenvolvido com o auxilio das seguintes **Claude Code Skills**:

### nestjs-best-practices

**Fonte:** `kadajett/agent-nestjs-skills`

Guia de boas praticas e padroes de arquitetura para aplicacoes NestJS em producao. Utilizada para garantir:

- Organizacao por feature modules
- Injecao de dependencias via construtor
- Tratamento de erros com filtros e excecoes HTTP
- Validacao de entrada com `class-validator`
- Seguranca com guards de autenticacao e autorizacao
- Desempenho com caching e queries otimizadas

### nestjs-code-review

**Fonte:** `giuseppe-trisciuoglio/developer-kit`

Skill de code review estruturado para aplicacoes NestJS. Utilizada para:

- Revisao de controllers, services e modules
- Validacao de padroes de injecao de dependencias
- Verificacao de seguranca (guards, DTOs, pipes)
- Avaliacao de cobertura de testes
- Geracao de relatorio de revisao com severidade (Critical, Warning, Suggestion)

### playwright-best-practices

**Fonte:** `currents-dev/playwright-best-practices-skill`

Guia abrangente de boas praticas para testes com Playwright. Utilizada para:

- Estrutura de testes E2E com Page Object Model (POM)
- Uso de locators semanticos e estaveis
- Configuracao de fixtures e hooks
- Isolamento de estado entre testes
- Configuracao de CI/CD e execucao em Docker
- Depuracao de testes flakey

### rest-api-design

**Fonte:** `aj-geddes/useful-ai-prompts`

Guia de design de APIs RESTful seguindo boas praticas de mercado. Utilizada para:

- Modelagem de recursos com nomes no plural e substantivos
- Uso correto de metodos HTTP (GET, POST, PUT, DELETE)
- Retorno de status codes adequados
- Paginacao, filtros e ordenacao de colecoes
- Documentacao com OpenAPI/Swagger
- Versionamento de API

## Telas

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

### Gerenciamento de Despesas

![Despesas](docs/screenshots/despesas.png)

### Modal Nova Despesa

![Modal Nova Despesa](docs/screenshots/modal_adicionar_despesa.png)

### Gerenciamento de Categorias

![Categorias](docs/screenshots/categorias.png)

### Modal Nova Categoria

![Modal Nova Categoria](docs/screenshots/modal_nova_categoria.png)

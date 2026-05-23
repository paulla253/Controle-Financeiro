# Controle Financeiro

Este projeto consiste em uma aplicação de controle financeiro pessoal, com backend em NestJS, frontend em NextJS e testes E2E com Playwright, desenvolvida com o objetivo de explorar e documentar o uso de IA no desenvolvimento de software.

## Como a IA foi utilizada no Projeto

O desenvolvimento deste projeto foi inteiramente guiado por IA, utilizando o **Claude Code** como assistente principal. O fluxo adotado segue uma progressão deliberada: do levantamento de requisitos à execução de tarefas concretas, passando por etapas de clareza e especificação técnica.

### 1. Layout

Para a construção do layout, foi utilizado o [Stitch](https://stitch.withgoogle.com/) (em 28/04/2025), uma ferramenta útil para quem não tem tanta familiaridade com o Figma. As percepções obtidas foram:

- **Consumo de tokens:** O limite de 400 tokens diários superou minhas expectativas — foi possível desenvolver 5 telas completas utilizando apenas metade da cota disponível.
- **Design e layout:** A ferramenta apresenta uma tendência à padronização, seguindo uma estrutura base e variando apenas detalhes pontuais entre as telas.
- **Fluxo de trabalho:**
  - _Ponto positivo:_ Demonstra boa compreensão do escopo inicial, sugerindo melhorias coerentes com a proposta.
  - _Ponto negativo:_ Ocasionalmente sugere funcionalidades fora do escopo solicitado, como menus de relatórios e configurações.
  - _Aderência ao escopo:_ Houve dificuldade em restringir as ações da IA. Mesmo solicitando explicitamente que o fluxo de login fosse ignorado, a ferramenta insistiu em criar elementos como avatar de usuário e telas de autenticação.

### 2. Base do Projeto

Para o início do projeto, já estava definida uma base na pasta `apps/backend` com o NestJS instalado, na pasta `apps/frontend` com o Next.js, e na pasta `apps/e2e` com o Playwright para testes.

Essa decisão foi tomada porque, sem um projeto básico, a IA gastava tokens procurando versões compatíveis e perdia tempo configurando o Docker Compose para conectar os dois projetos. Entregar essa etapa pronta gerou ganho de produtividade.

### 3. Skills utilizadas

Este projeto foi desenvolvido com o auxílio das seguintes Skills:

#### nestjs-best-practices

**Fonte:** `kadajett/agent-nestjs-skills`

Guia de boas práticas e padrões de arquitetura para aplicações NestJS em produção. Utilizada para garantir:

- Organização por feature modules
- Injeção de dependências via construtor
- Tratamento de erros com filtros e exceções HTTP
- Validação de entrada com `class-validator`
- Segurança com guards de autenticação e autorização
- Desempenho com caching e queries otimizadas

#### nestjs-code-review

**Fonte:** `giuseppe-trisciuoglio/developer-kit`

Skill de code review estruturado para aplicações NestJS. Utilizada para:

- Revisão de controllers, services e modules
- Validação de padrões de injeção de dependências
- Verificação de segurança (guards, DTOs, pipes)
- Avaliação de cobertura de testes
- Geração de relatório de revisão com severidade (Critical, Warning, Suggestion)

#### playwright-best-practices

**Fonte:** `currents-dev/playwright-best-practices-skill`

Guia abrangente de boas práticas para testes com Playwright. Utilizada para:

- Estrutura de testes E2E com Page Object Model (POM)
- Uso de locators semânticos e estáveis
- Configuração de fixtures e hooks
- Isolamento de estado entre testes
- Configuração de CI/CD e execução em Docker
- Depuração de testes flaky

#### rest-api-design

**Fonte:** `aj-geddes/useful-ai-prompts`

Guia de design de APIs RESTful seguindo boas práticas de mercado. Utilizada para:

- Modelagem de recursos com nomes no plural e substantivos
- Uso correto de métodos HTTP (GET, POST, PUT, DELETE)
- Retorno de status codes adequados
- Paginação, filtros e ordenação de coleções
- Documentação com OpenAPI/Swagger
- Versionamento de API

### 4. Arquivo inicial

Tudo começa com o arquivo `prompt_inicial.md`, que concentra as principais informações do produto antes de qualquer linha de código ser escrita. Ele funciona como um briefing estruturado entregue à IA.

### 5. Criação do PRD (Product Requirements Document)

Com o prompt inicial como base, a IA gerou o PRD usando o template em `templates/prd-template.md`. Nessa etapa, a IA identificou pontos que não estavam completamente claros no briefing e fez perguntas objetivas para resolvê-los antes de prosseguir, como:

- Quais campos são obrigatórios no cadastro de despesas?
- O CSV de importação segue algum formato específico?
- Os gráficos devem refletir o mês atual ou um período configurável?

Esse ciclo de pergunta e resposta gerou um PRD completo e sem lacunas, que serviu como contrato de funcionalidades para as etapas seguintes.

### 6. Tech Spec (Especificação Técnica)

A partir do PRD aprovado, a IA produziu a especificação técnica com base no template `templates/techspec-template.md`. Essa etapa traduziu os requisitos de negócio em decisões de implementação:

- Modelagem do banco de dados (entidades, relacionamentos, migrações)
- Contrato da API REST (rotas, métodos HTTP, payloads e status codes)
- Estrutura de componentes do frontend e integração com a API
- Estratégia de testes: unitários com Jest no backend, E2E com Playwright
- Configuração do ambiente com Docker Compose

A tech spec funcionou como um plano de execução detalhado, reduzindo retrabalho e garantindo coerência entre backend e frontend.

### 7. Execução de Tarefas

Com PRD e tech spec em mãos, o desenvolvimento foi dividido em tarefas de alto nível (listadas em `tasks/prd-controle-financeiro`) e cada tarefa foi detalhada individualmente com o template `templates/task-template.md`. A IA executou as tarefas de forma sequencial. Cada tarefa entregue foi revisada antes de avançar para a próxima, mantendo o projeto alinhado com o que foi especificado desde o início.

No decorrer das tarefas, foi possível observar:

- Em alguns momentos a tarefa estava entregue, mas o projeto não compilava.
- A IA informava que havia concluído a tarefa, mas não marcava o check no arquivo — foi necessário solicitar revisão, e em alguns casos faltava parte do código.
- Antes de executar as tarefas de E2E, ao executar o projeto, verificou-se que algumas funcionalidades não estavam funcionando, o que reforçou a importância dos testes E2E.
- Nos testes E2E, sem uma skill dedicada, o custo em tokens era alto com pouca entrega.
- No E2E com SQLite, houve dificuldade para lidar com permissões do arquivo de banco.
- Mesmo com um layout fornecido, surgiram divergências significativas no frontend — foi necessário solicitar correções como adição de ícones e revisar o layout pelo arquivo `tasks/prd-controle-financeiro/LAYOUT_PLAN.md`.
- Após todas as correções, foi gerada uma task para criação do tema dark, disponível em `tasks/prd-controle-financeiro/task_template_dark.md`.

## Resultado do desenvolvimento com IA

O resultado do desenvolvimento foi o código da aplicação, que pode ser conferido nos repositórios de backend, frontend e testes E2E. A seguir, serão apresentando a estrutura do código, como realizar os testes e as telas geradas ao longo do processo.

### Estrutura do código

```
apps/
  backend/    # API REST com NestJS + SQLite
  frontend/   # Interface com Next.js + Tailwind CSS
  e2e/        # Testes end-to-end com Playwright
```

### Como Executar

#### Pré-requisitos

- Docker
- Docker Compose

#### Subir os serviços

Execute na pasta `apps/`:

```bash
docker-compose up --build
```

- Backend disponível em `http://localhost:3000`
- Frontend disponível em `http://localhost:3001`

#### Testes E2E (Playwright)

O Playwright sobe o backend e o frontend automaticamente antes de rodar os testes.

```bash
cd apps/e2e

# Instale as dependências (primeira vez)
npm install
npx playwright install chromium

# Reseta o banco isolado de e2e
npm run db:reset

# Executa os testes
npm test

# Opções adicionais
npm run test:headed   # abre o navegador visualmente
npm run test:ui       # abre a UI interativa do Playwright
npm run report        # abre o relatório HTML na porta 9300
```

> O banco de dados utilizado nos testes E2E é isolado (`data/control.e2e.sqlite`) e zerado a cada execução de `db:reset`.

---

### Capturas de Tela da Aplicação

#### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

#### Gerenciamento de Despesas

![Despesas](docs/screenshots/despesas.png)

#### Modal Nova Despesa

![Modal Nova Despesa](docs/screenshots/modal_adicionar_despesa.png)

#### Gerenciamento de Categorias

![Categorias](docs/screenshots/categorias.png)

#### Modal Nova Categoria

![Modal Nova Categoria](docs/screenshots/modal_nova_categoria.png)

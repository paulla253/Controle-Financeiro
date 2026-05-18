# Controle Financeiro v1

Este é o repositório do projeto Controle Financeiro v1.

## Estrutura do Projeto

- `backend/`: API desenvolvida com NestJS.
- `frontend/`: Interface desenvolvida com NextJs
- `e2e/`: Testes do projeto utilizando playwright

## Como Executar

### Pré-requisitos

- Docker
- Docker Compose

### Passos para rodar o projeto

Para subir todos os serviços, execute o comando abaixo na raiz do projeto:

```bash
docker-compose up --build
```

- A API (Backend) estará disponível em `http://localhost:3000`.
- O Frontend estará disponível em `http://localhost:3001`.

### Testes unitários locais

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

### Testes E2E (Playwright)

O Playwright gerencia o ciclo completo: sobe o backend e o frontend automaticamente antes de rodar os testes.

```bash
cd e2e

# 1. Instale as dependências (primeira vez)
npm install
npx playwright install chromium

# 2. Reseta o banco isolado de e2e
npm run db:reset

# 3. Executa os testes
npm test

# Opções adicionais
npm run test:headed   # abre o navegador visualmente
npm run test:ui       # abre a UI interativa do Playwright
npm run report        # abre o relatório HTML na porta 9300
```

> O banco de dados utilizado nos testes E2E é isolado: `data/control.e2e.sqlite`. Ele é zerado a cada execução de `db:reset`.

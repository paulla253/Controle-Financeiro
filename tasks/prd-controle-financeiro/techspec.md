# Especificação Técnica: Frontend Controle Financeiro

## Resumo Executivo

Esta especificação técnica detalha a arquitetura e a estratégia de implementação para o frontend da aplicação "Controle Financeiro". Construído com Next.js, o projeto utilizará **Shadcn/UI** para componentes de interface, **Tailwind CSS** para estilização, **TanStack Query (React Query)** para gerenciamento de estado do servidor e **Chart.js** para visualização de dados. A aplicação consumirá uma API NestJS existente, que será estendida para suportar funcionalidades de filtro e importação/exportação de dados. O gerenciamento de estado global será feito com a Context API do React para simplicidade.

## Arquitetura do Sistema

### Visão Geral dos Componentes

O frontend será estruturado em `apps/frontend` e organizado por funcionalidades.

- **`components/ui`**: Componentes base da biblioteca Shadcn/UI (Button, Input, Card, etc.).
- **`components/charts`**: Wrappers customizados para os gráficos (BarChart, PieChart) utilizando Chart.js.
- **`components/layout`**: Componente principal do layout da aplicação, incluindo header, sidebar e o seletor de tema (light/dark).
- **`app/page.tsx`**: Página principal (Dashboard), que exibirá os gráficos de visão geral.
- **`app/expenses/page.tsx`**: Página para listar, filtrar e cadastrar novas despesas.
- **`app/categories/page.tsx`**: Página para criar e listar as categorias de gastos.
- **`lib/api.ts`**: Módulo central para todas as chamadas à API backend, utilizando `fetch`.
- **`lib/hooks`**: Hooks customizados do React Query para encapsular a lógica de data fetching (ex: `useExpenses`, `useCategories`).
- **`contexts/theme-provider.tsx`**: Provedor de contexto para gerenciar o tema da aplicação (claro/escuro).

**Fluxo de Dados:**

1.  O usuário interage com um componente de UI (ex: clica em "Adicionar Despesa").
2.  O componente chama um hook do React Query (ex: `useAddExpense.mutate(...)`).
3.  O hook executa a chamada de API correspondente no `lib/api.ts`.
4.  O backend processa a requisição e retorna os dados.
5.  O React Query atualiza o cache local e re-renderiza os componentes relevantes com os novos dados.

## Design de Implementação

### Interfaces Principais

```typescript
// lib/api.ts

// Interface para o serviço de API de despesas
export interface IExpensesAPI {
  getExpenses(params: {
    from?: string;
    to?: string;
    categoryId?: string;
  }): Promise<Expense[]>;
  createExpense(data: {
    date: string;
    categoryId: string;
    amount: number;
  }): Promise<Expense>;
  exportExpenses(): Promise<Blob>;
  importExpenses(file: File): Promise<void>;
}

// Interface para o serviço de API de categorias
export interface ICategoriesAPI {
  getCategories(): Promise<Category[]>;
  createCategory(data: { name: string }): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
}

// Interface para o serviço de API do Dashboard
export interface IDashboardAPI {
  getAnnualReport(): Promise<AnnualReportData[]>;
  getMonthlyReport(): Promise<MonthlyReportData>;
}
```

### Modelos de Dados

```typescript
// Representa uma Despesa
type Expense = {
  id: string;
  date: string; // ISO 8601 format
  amount: number;
  category: Category;
};

// Representa uma Categoria
type Category = {
  id: string;
  name: string;
};

// Dados para o gráfico anual
type AnnualReportData = {
  month: string;
  total: number;
};

// Dados para o gráfico mensal (pizza)
type MonthlyReportData = {
  spendingByCategory: Array<{
    category: string;
    amount: number;
    percent: number;
  }>;
};
```

### Endpoints de API

Esta seção define os endpoints que o frontend consumirá. **Assume-se que o backend será atualizado para incluir os endpoints marcados como 'NOVO'**.

- **Categorias**
  - `GET /api/categories`: Lista todas as categorias.
  - `POST /api/categories`: Cria uma nova categoria.
  - `DELETE /api/categories/:id`: Remove uma categoria.

- **Despesas**
  - `POST /api/expenses`: Registra uma nova despesa.
  - **[ATUALIZADO]** `GET /api/expenses`: Lista despesas, com suporte a query params: `from` (data), `to` (data) e `categoryId` (string).
  - **[NOVO]** `GET /api/expenses/export`: Faz o download de um arquivo CSV com as despesas.
  - **[NOVO]** `POST /api/expenses/import`: Faz o upload de um arquivo CSV para importar despesas.

- **Dashboard**
  - `GET /api/dashboard/annual`: Retorna dados para o gráfico de barras anual.
  - `GET /api/dashboard/monthly`: Retorna dados para o gráfico de pizza do mês atual.

## Abordagem de Testes

### Testes Unidade

- **Componentes:** Testar a renderização de componentes de UI com props mocadas.
- **Funções de API (`lib/api.ts`):** Mocar a função `fetch` para testar se as requisições (método, URL, corpo) são montadas corretamente.
- **Lógica de Negócio:** Testar funções de formatação de data e valor.

## Sequenciamento de Desenvolvimento

1.  **Setup do Frontend:** Inicializar a aplicação Next.js em `apps/frontend` e instalar as dependências (`tailwindcss`, `shadcn/ui`, `react-query`, `chart.js`).
2.  **Layout e Tema:** Criar o layout principal da aplicação e implementar o seletor de tema claro/escuro.
3.  **Módulo de Categorias:** Desenvolver a UI para criar e listar categorias, integrando com os endpoints do backend.
4.  **Módulo de Despesas:** Implementar a tabela de despesas com filtros e o formulário de cadastro.
5.  **Dashboard:** Desenvolver os componentes de gráficos (barra e pizza) e integrá-los com os endpoints do dashboard.
6.  **Importação/Exportação:** Implementar a lógica de upload e download de CSV, utilizando a biblioteca `papaparse` no cliente para validação antes do envio.

## Considerações Técnicas

### Decisões Principais

- **Shadcn/UI:** Escolhido por ser uma biblioteca de componentes não-opinativa, que nos dá controle total sobre o código e estilo, além de ser altamente acessível e customizável.
- **TanStack Query (React Query):** Adotado para simplificar o data fetching, cache, e sincronização de estado com o servidor, eliminando a necessidade de um gerenciador de estado complexo como Redux.
- **Chart.js:** Selecionado por sua simplicidade, bom desempenho e flexibilidade para criar os gráficos necessários.
- **Validação de CSV no Cliente:** A validação inicial do CSV será feita no frontend com `papaparse` para fornecer feedback rápido ao usuário, antes de enviar o arquivo ao backend para o processamento final.

### Riscos Conhecidos

- **Sincronia com o Backend:** O desenvolvimento do frontend depende da atualização do backend para incluir os novos endpoints. A comunicação constante entre as equipes é crucial.
- **CORS:** A configuração de CORS no backend (`main.ts`) pode precisar de ajuste para permitir requisições do ambiente de desenvolvimento do Next.js (provavelmente `http://localhost:3001`) e do container Docker do frontend.

### Arquivos relevantes e dependentes

- `apps/backend/src/main.ts` (configuração de CORS)
- `apps/backend/src/expenses/expenses.controller.ts` (precisará de novos endpoints)
- `apps/backend/src/expenses/expenses.service.ts` (precisará da nova lógica de negócio)
- `docker-compose.yml` (precisará do novo serviço do frontend)
- `prompt_inicial.md` (origem dos requisitos)
- `tasks/prd-controle-financeiro/prd.md` (documento de requisitos do produto)

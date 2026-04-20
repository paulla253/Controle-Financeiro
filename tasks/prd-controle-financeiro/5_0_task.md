# Tarefa 5.0: Expenses Module Implementation (Frontend)

## Descrição

Implementar a interface de usuário para listar, filtrar e adicionar despesas, integrando essas funcionalidades com os endpoints de API do backend para despesas.

## Subtarefas

*   5.1.1 Criar a página `app/expenses/page.tsx` que será responsável por exibir a lista de despesas, filtros e o formulário de adição.
*   5.1.2 Desenvolver as funções de API em `lib/api.ts` para interagir com os endpoints `GET /api/expenses` (com parâmetros de filtro) e `POST /api/expenses`.
*   5.1.3 Criar hooks customizados do TanStack Query (ex: `lib/hooks/useExpenses.ts`, `lib/hooks/useCreateExpense.ts`) para gerenciar o estado do lado do servidor para a listagem e adição de despesas. O hook `useExpenses` deve aceitar e passar os parâmetros de filtro para a API.
*   5.1.4 Implementar a UI para exibir uma lista de despesas em formato de tabela, utilizando componentes do Shadcn/UI. A tabela deve mostrar colunas para data, valor, categoria e, se aplicável, ações adicionais.
*   5.1.5 Desenvolver a UI para os filtros de despesas, incluindo seletores de data ("De", "Até") e um campo de seleção para filtrar por categoria, utilizando componentes de formulário e seleção de data do Shadcn/UI. As categorias para o filtro devem ser carregadas via `useCategories` (da Tarefa 4.0).
*   5.1.6 Implementar a UI para adicionar uma nova despesa, utilizando um formulário com campos para data (data picker do Shadcn/UI), valor (input numérico) e seleção de categoria (dropdown de categorias carregadas da API).
*   5.1.7 Integrar a UI de listagem e filtragem com o hook `useExpenses`, garantindo que a lista de despesas seja atualizada dinamicamente ao aplicar os filtros.
*   5.1.8 Integrar o formulário de adição de despesa com o hook `useCreateExpense`, invalidando o cache de despesas após uma adição bem-sucedida para atualizar a lista.

## Critérios de Sucesso

*   A página `app/expenses/page.tsx` é acessível e renderiza a lista de despesas.
*   A lista de despesas carrega e exibe os dados da API do backend.
*   Os filtros de data e categoria são funcionais e aplicam-se corretamente à lista de despesas.
*   A aplicação de filtros reflete as despesas filtradas sem a necessidade de recarga manual da página.
*   É possível adicionar uma nova despesa através do formulário, e essa despesa é persistida no backend e aparece na lista após a operação.
*   Mensagens de feedback (sucesso/erro) são exibidas ao usuário para as operações de listagem, filtragem e adição de despesas.
*   A execução do build do frontend (`npm run build` ou equivalente) ocorre sem erros.

## Testes (Unidade)

*   **Testes de Funções de API (`lib/api.ts`):**
    *   Mocar a função global `fetch` para verificar se as chamadas `getExpenses` e `createExpense` estão construindo as URLs, métodos HTTP e corpos de requisição (para POST) corretamente, incluindo a passagem de query parameters para `getExpenses`.
*   **Testes de Hooks do TanStack Query:**
    *   Testar os hooks `useExpenses` e `useCreateExpense` para garantir que eles gerenciam corretamente os estados de `loading`, `error`, `data` e `isFetching`, e que as mutações invalidam o cache de queries de despesas.
*   **Testes de Componente (Página de Despesas):**
    *   Testar a renderização da tabela de despesas vazia e com dados.
    *   Simular a aplicação de filtros (data, categoria) e verificar se o hook `useExpenses` é chamado com os parâmetros corretos.
    *   Simular a interação do usuário com o formulário de criação de despesa e verificar se o hook `useCreateExpense` é chamado com os dados corretos.
    *   Verificar a exibição de mensagens de sucesso e erro.
*   **Fluxo de Teste:**
    1.  Executar o build da aplicação frontend.
    2.  Rodar os testes de unidade.

## Dependências

*   Tarefa 1.0 (Backend API Enhancements) - para os endpoints de despesas com filtragem.
*   Tarefa 2.0 (Frontend Setup) - para o ambiente de desenvolvimento e bibliotecas.
*   Tarefa 3.0 (Core Layout e Theming) - para a estrutura de layout da página.
*   Tarefa 4.0 (Categories Module Implementation) - para a obtenção das categorias a serem usadas nos filtros e na adição de despesas.

## Estimativa

A definir.

## Observações

Garantir uma boa experiência de usuário ao aplicar filtros, com indicadores de carregamento e manipulação de estados vazios.

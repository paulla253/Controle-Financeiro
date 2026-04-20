# Tarefa 4.0: Categories Module Implementation (Frontend)

## Descrição

Desenvolver a interface de usuário para criar, listar e excluir categorias de despesas, integrando essa funcionalidade com a API do backend previamente definida.

## Subtarefas

*   4.1.1 Criar a página `app/categories/page.tsx` que servirá como o ponto de entrada para o módulo de gerenciamento de categorias.
*   4.1.2 Desenvolver as funções de API em `lib/api.ts` que irão interagir com os endpoints do backend para `GET /api/categories`, `POST /api/categories`, e `DELETE /api/categories/:id`.
*   4.1.3 Criar hooks customizados utilizando TanStack Query (em `lib/hooks/useCategories.ts`, `useCreateCategory.ts`, `useDeleteCategory.ts`) para encapsular a lógica de data fetching, cache, e mutação das categorias.
*   4.1.4 Implementar a UI para exibir uma lista de categorias existentes, utilizando componentes como `Table` ou `List` do Shadcn/UI, exibindo o nome de cada categoria e ações disponíveis.
*   4.1.5 Desenvolver a UI para adicionar uma nova categoria, incluindo um formulário simples com um campo de input para o nome da categoria e um botão de submissão, utilizando componentes de formulário do Shadcn/UI.
*   4.1.6 Implementar a funcionalidade de exclusão de categoria, adicionando um botão de exclusão (e possivelmente um modal de confirmação) ao lado de cada categoria na lista.
*   4.1.7 Integrar a UI com os hooks do TanStack Query para carregar, adicionar e excluir categorias, garantindo que a interface seja reativa às mudanças no estado do servidor.

## Critérios de Sucesso

*   A página `app/categories/page.tsx` é acessível através da navegação e renderiza corretamente.
*   A lista de categorias exibe todas as categorias existentes, carregadas da API do backend.
*   É possível adicionar uma nova categoria através da UI, e essa categoria é persistida no backend e aparece na lista sem a necessidade de recarregar a página.
*   É possível excluir uma categoria existente através da UI, e essa categoria é removida do backend e da lista em tempo real.
*   Mensagens de feedback (ex: "Categoria criada com sucesso", "Erro ao excluir categoria") são exibidas ao usuário após cada operação de CRUD.
*   A execução do build do frontend (`npm run build` ou equivalente) ocorre sem erros.

## Testes (Unidade)

*   **Testes de Funções de API (`lib/api.ts`):**
    *   Mocar a função global `fetch` para verificar se as chamadas para `getCategories`, `createCategory` e `deleteCategory` estão construindo as URLs, métodos HTTP e corpos de requisição (para POST) corretamente.
*   **Testes de Hooks do TanStack Query:**
    *   Testar os hooks `useCategories`, `useCreateCategory`, `useDeleteCategory` para garantir que eles gerenciam corretamente os estados de `loading`, `error`, `data` e `isFetching`, e que as mutações invalidam as queries apropriadas para manter o cache atualizado.
*   **Testes de Componente (Página de Categorias):**
    *   Testar a renderização da lista de categorias vazia e com dados.
    *   Simular a interação do usuário com o formulário de criação de categoria e verificar se o hook de mutação é chamado.
    *   Simular o clique no botão de exclusão e verificar se o hook de mutação de exclusão é acionado.
    *   Verificar a exibição de mensagens de sucesso e erro.
*   **Fluxo de Teste:**
    1.  Executar o build da aplicação frontend.
    2.  Rodar os testes de unidade.

## Dependências

*   Tarefa 1.0 (Backend API Enhancements) - para garantir que os endpoints de categoria estão disponíveis e funcionando.
*   Tarefa 2.0 (Frontend Setup) - para o ambiente de desenvolvimento e bibliotecas.
*   Tarefa 3.0 (Core Layout e Theming) - para a estrutura de layout básica da página.

## Estimativa

A definir.

## Observações

Garantir que a validação de entrada (ex: nome da categoria não pode ser vazio) seja implementada na UI para melhorar a experiência do usuário.

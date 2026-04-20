# Tarefa 7.0: Import/Export Functionality (Frontend)

## Descrição

Desenvolver a interface de usuário e a lógica para permitir a importação e exportação de despesas através de arquivos CSV, incluindo a validação inicial no lado do cliente para uma melhor experiência do usuário.

## Subtarefas

*   7.1.1 Desenvolver as funções de API em `lib/api.ts` para interagir com os novos endpoints do backend `GET /api/expenses/export` e `POST /api/expenses/import`.
*   7.1.2 Criar hooks customizados do TanStack Query (ex: `lib/hooks/useExportExpenses.ts`, `lib/hooks/useImportExpenses.ts`) para gerenciar as operações de exportação e importação de despesas.
*   7.1.3 Implementar um botão de "Exportar Despesas" na UI (por exemplo, na página `app/expenses/page.tsx` ou em um componente de utilitário). Ao ser clicado, este botão deve acionar o download do arquivo CSV de despesas.
*   7.1.4 Implementar um componente de "Importar Despesas" na UI, que incluirá um campo de input `type="file"` para permitir ao usuário selecionar um arquivo CSV.
*   7.1.5 Integrar a biblioteca `papaparse` no frontend para realizar a validação client-side do arquivo CSV selecionado antes de enviá-lo para o backend. Isso deve incluir verificações de formato e tipo de dados.
*   7.1.6 Conectar o botão de exportação com o hook `useExportExpenses`, que fará a requisição ao backend e iniciará o download do arquivo.
*   7.1.7 Conectar o componente de importação com o hook `useImportExpenses`, passando o arquivo CSV validado para o backend e atualizando a lista de despesas após a importação bem-sucedida.

## Critérios de Sucesso

*   O botão de exportação de despesas é exibido na UI e, ao ser clicado, inicia o download de um arquivo CSV válido.
*   O arquivo CSV exportado contém todas as despesas (ou as despesas filtradas, se a funcionalidade de filtro estiver ativa na página de despesas).
*   O componente de upload de arquivo permite ao usuário selecionar um arquivo CSV.
*   A validação client-side do arquivo CSV funciona corretamente, exibindo mensagens de erro informativas para arquivos inválidos e impedindo o upload.
*   A importação de um arquivo CSV válido é processada pelo backend, e as novas despesas são adicionadas ao sistema, sendo refletidas na UI (ex: na lista de despesas).
*   Mensagens de feedback claras (sucesso, erro, progresso) são exibidas durante as operações de importação e exportação.
*   A execução do build do frontend (`npm run build` ou equivalente) ocorre sem erros.

## Testes (Unidade)

*   **Testes de Funções de API (`lib/api.ts`):**
    *   Mocar a função global `fetch` para verificar se as chamadas para `exportExpenses` e `importExpenses` estão construindo as URLs, métodos HTTP, e corpos/headers de requisição corretamente.
*   **Testes de Hooks do TanStack Query:**
    *   Testar os hooks `useExportExpenses` e `useImportExpenses` para garantir que eles gerenciam corretamente os estados de `loading`, `error`, `data`, e que a mutação de importação invalida o cache de queries de despesas.
*   **Testes de Lógica de Validação (`papaparse`):**
    *   Testar a função de validação de CSV com `papaparse` com diferentes cenários: um CSV válido, um CSV com formato incorreto, um CSV com dados incompletos ou inválidos, para verificar se os erros são detectados e reportados corretamente.
*   **Testes de Componente:**
    *   Testar a renderização do botão de exportação e do componente de upload de arquivo.
    *   Simular a seleção de um arquivo e verificar se a validação é acionada e as mensagens de feedback são exibidas.
    *   Simular o clique no botão de exportação e verificar se a função de API correspondente é chamada.
*   **Fluxo de Teste:**
    1.  Executar o build da aplicação frontend.
    2.  Rodar os testes de unidade.

## Dependências

*   Tarefa 1.0 (Backend API Enhancements) - para os endpoints de importação/exportação de despesas.
*   Tarefa 2.0 (Frontend Setup) - para o ambiente de desenvolvimento e bibliotecas (incluindo `papaparse`).
*   Tarefa 5.0 (Expenses Module Implementation) - idealmente, a funcionalidade de importação/exportação pode ser integrada na mesma página ou módulo que gerencia as despesas.

## Estimativa

A definir.

## Observações

É crucial fornecer feedback claro e detalhado ao usuário sobre o status das operações de importação e exportação, incluindo barras de progresso, mensagens de sucesso ou listagem de erros específicos do arquivo CSV.

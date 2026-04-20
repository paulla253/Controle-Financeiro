# Tarefa 6.0: Dashboard Module Implementation (Frontend)

## Descrição

Criar e integrar os componentes de gráfico necessários para exibir os relatórios financeiros anuais e mensais na página principal do Dashboard da aplicação.

## Subtarefas

*   6.1.1 Criar a página `app/page.tsx` que servirá como o Dashboard principal da aplicação, sendo a primeira página a ser exibida.
*   6.1.2 Desenvolver as funções de API em `lib/api.ts` para interagir com os endpoints do backend `GET /api/dashboard/annual` e `GET /api/dashboard/monthly`.
*   6.1.3 Criar hooks customizados do TanStack Query (ex: `lib/hooks/useAnnualReport.ts`, `lib/hooks/useMonthlyReport.ts`) para gerenciar o estado do lado do servidor para a obtenção dos dados dos relatórios anuais e mensais.
*   6.1.4 Criar componentes de gráfico reutilizáveis na pasta `components/charts`. Isso incluirá um `BarChart` para o relatório anual e um `PieChart` para o relatório mensal, utilizando a biblioteca Chart.js e `react-chartjs-2`.
*   6.1.5 Integrar os hooks do TanStack Query com os componentes de gráfico na página do Dashboard (`app/page.tsx`) para carregar e exibir dinamicamente os dados dos relatórios.

## Critérios de Sucesso

*   A página do Dashboard (`/`) é acessível e carrega sem erros.
*   O gráfico de barras anual é renderizado corretamente, exibindo os dados provenientes do `GET /api/dashboard/annual`.
*   O gráfico de pizza mensal é renderizado corretamente, exibindo os dados provenientes do `GET /api/dashboard/monthly`.
*   Ambos os gráficos são interativos (ex: tooltips ao passar o mouse) e seguem o estilo visual da aplicação (Tailwind CSS, Shadcn/UI, temas claro/escuro).
*   Indicadores de carregamento são exibidos enquanto os dados do dashboard estão sendo carregados.
*   Mensagens de erro são exibidas de forma amigável caso haja falha no carregamento dos dados dos relatórios.
*   A execução do build do frontend (`npm run build` ou equivalente) ocorre sem erros.

## Testes (Unidade)

*   **Testes de Funções de API (`lib/api.ts`):**
    *   Mocar a função global `fetch` para verificar se as chamadas para `getAnnualReport` e `getMonthlyReport` estão construindo as URLs e métodos HTTP corretamente.
*   **Testes de Hooks do TanStack Query:**
    *   Testar os hooks `useAnnualReport` e `useMonthlyReport` para garantir que eles gerenciam corretamente os estados de `loading`, `error`, `data` e `isFetching`.
*   **Testes de Componente (Gráficos):**
    *   Testar a renderização dos componentes `BarChart` e `PieChart` com dados mocados, verificando se os gráficos são exibidos e formatados corretamente.
    *   Testar as interações básicas dos gráficos (ex: passar o mouse, clicar).
*   **Fluxo de Teste:**
    1.  Executar o build da aplicação frontend.
    2.  Rodar os testes de unidade.

## Dependências

*   Tarefa 1.0 (Backend API Enhancements) - para os endpoints de relatório do dashboard.
*   Tarefa 2.0 (Frontend Setup) - para o ambiente de desenvolvimento, bibliotecas (Chart.js, `react-chartjs-2`).
*   Tarefa 3.0 (Core Layout e Theming) - para a estrutura de layout da página do dashboard.

## Estimativa

A definir.

## Observações

Garantir que os dados dos gráficos sejam apresentados de forma clara e compreensível, com legendas e rótulos apropriados. Considerar o tratamento de casos onde não há dados para exibir nos relatórios.

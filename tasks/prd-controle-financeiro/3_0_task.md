# Tarefa 3.0: Core Layout e Theming

## Descrição

Desenvolver o layout principal da aplicação, incluindo o cabeçalho (`Header`), a barra lateral de navegação (`Sidebar`) e a funcionalidade de alternância de tema (modo claro/escuro), garantindo uma experiência de usuário consistente e personalizável.

## Subtarefas

*   3.1.1 Criar o componente `Layout` na pasta `components/layout` que encapsulará os componentes `Header` e `Sidebar`, e renderizará o conteúdo principal da página.
*   3.1.2 Implementar o componente `Header` (em `components/layout`) contendo o título da aplicação e um placeholder para o futuro botão de alternância de tema.
*   3.1.3 Implementar o componente `Sidebar` (em `components/layout`) com links de navegação para as principais seções da aplicação (Dashboard, Despesas, Categorias), utilizando um componente de navegação do Shadcn/UI (se aplicável).
*   3.1.4 Criar o `contexts/theme-provider.tsx` para gerenciar o estado do tema (claro/escuro) e persistir a preferência do usuário (e.g., usando `localStorage`).
*   3.1.5 Integrar o `ThemeProvider` no arquivo `_app.tsx` (ou no `layout.tsx` do App Router) para que todos os componentes da aplicação possam acessar e reagir às mudanças de tema.
*   3.1.6 Adicionar um botão de alternância de tema no `Header` (ou `Sidebar`), utilizando um componente Shadcn/UI, que interaja com o `ThemeProvider` para mudar o tema.

## Critérios de Sucesso

*   A aplicação renderiza um layout base que inclui o `Header` e o `Sidebar` em todas as páginas.
*   Os links de navegação na `Sidebar` estão funcionais e direcionam para as rotas corretas (mesmo que as páginas de destino ainda estejam vazias).
*   O botão de alternância de tema altera visualmente o tema da aplicação (claro/escuro).
*   A preferência de tema do usuário é salva e carregada automaticamente, mantendo o tema selecionado entre as sessões.
*   A execução do build do frontend (`npm run build` ou equivalente) ocorre sem erros.

## Testes (Unidade)

*   **Testes de Componente:**
    *   Testar o componente `Layout` para garantir que ele renderiza corretamente o `Header` e o `Sidebar`.
    *   Testar o `Header` para verificar a presença do título e do botão de alternância de tema.
    *   Testar o `Sidebar` para garantir que os links de navegação estão presentes e corretos.
    *   Testar o `ThemeProvider` para verificar se ele gerencia o estado do tema e persiste a preferência do usuário no `localStorage`.
    *   Testar a interação do botão de alternância de tema com o `ThemeProvider` para garantir que o tema é alterado.
*   **Fluxo de Teste:**
    1.  Executar o build da aplicação frontend.
    2.  Rodar os testes de unidade.

## Dependências

*   Tarefa 2.0 (Frontend Setup).

## Estimativa

A definir.

## Observações

Garantir que o design dos componentes de layout e tema seja responsivo e acessível. Utilizar os componentes do Shadcn/UI sempre que possível para manter a consistência visual.

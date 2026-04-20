# Tarefa 2.0: Frontend Setup

## Descrição

Inicializar a aplicação Next.js, configurar estilização com Tailwind CSS, e integrar Shadcn/UI, TanStack Query, e Chart.js. Esta tarefa estabelece a base tecnológica para o desenvolvimento do frontend.

## Subtarefas

*   2.1.1 Criar a pasta `apps/frontend` no diretório raiz do projeto e inicializar um novo projeto Next.js dentro dela, utilizando TypeScript.
*   2.1.2 Instalar e configurar Tailwind CSS no projeto Next.js, seguindo as melhores práticas e a documentação oficial para Next.js.
*   2.1.3 Instalar a biblioteca de componentes Shadcn/UI e adicionar os componentes iniciais essenciais (como `Button`, `Input`, `Card`) ao projeto, garantindo que estejam configurados e prontos para uso.
*   2.1.4 Instalar e configurar TanStack Query (React Query) no nível da aplicação Next.js, provendo o `QueryClientProvider` no layout raiz.
*   2.1.5 Instalar a biblioteca Chart.js e a biblioteca de integração para React, `react-chartjs-2`, preparando o ambiente para a criação de gráficos.

## Critérios de Sucesso

*   O projeto Next.js está criado em `apps/frontend` e pode ser executado localmente sem erros (`npm run dev`).
*   A estilização com Tailwind CSS está funcionando corretamente, sendo possível aplicar classes CSS do Tailwind aos elementos.
*   Pelo menos um componente Shadcn/UI (ex: `Button`) foi adicionado e é renderizado corretamente na aplicação.
*   O `QueryClientProvider` do TanStack Query está configurado no `_app.tsx` (ou equivalente no App Router) e o cliente de query está acessível via hooks.
*   Chart.js e `react-chartjs-2` estão instalados e não há erros de dependência ou importação relacionados.
*   A execução do build do frontend (`npm run build` ou equivalente) ocorre sem erros.

## Testes (Unidade)

*   **Testes de Configuração:**
    *   Verificar se o processo de build do Next.js funciona.
    *   Testar se as classes do Tailwind CSS são aplicadas e renderizadas corretamente em um componente de teste simples.
    *   Criar um teste de renderização para um componente Shadcn/UI importado para garantir sua funcionalidade básica.
    *   Verificar a presença do `QueryClientProvider` na árvore de componentes (utilizando ferramentas de teste como React Testing Library).
    *   Garantir que as bibliotecas Chart.js e `react-chartjs-2` podem ser importadas e instanciadas em um arquivo de teste.
*   **Fluxo de Teste:**
    1.  Executar o build da aplicação frontend.
    2.  Rodar os testes de unidade.

## Dependências

*   Nenhuma.

## Estimativa

A definir.

## Observações

Esta tarefa é fundamental e deve ser concluída antes de iniciar o desenvolvimento de qualquer funcionalidade específica do frontend.

# Tarefa 5.0: Infra Frontend (TanStack Query, chart.js, MSW)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Estabelecer fundação do frontend Next.js antes das telas: instalação de deps, configuração do `QueryClientProvider`, cliente HTTP com tratamento padronizado de erro, registro mínimo do chart.js, helpers de formatação pt-BR, layout/header com nav e infraestrutura de testes (Jest + RTL + MSW). Sem isso nenhuma tela funciona ou pode ser testada.

<requirements>
- `npm run build` e `npm run dev` operacionais sem erros.
- `app/layout.tsx` envolve a aplicação com `QueryClientProvider`, fontes Inter + Material Symbols, `Header` fixo com nav (Dashboard / Expenses / Categories) e provider de Toast.
- `api-client.ts` lê `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:3000/api/v1`), trata erro padronizado do backend e expõe helpers tipados.
- `chartjs-setup.ts` registra apenas `BarController`, `DoughnutController`, escalas e elementos necessários (bundle mínimo).
- `format.ts` expõe `formatCurrencyBRL`, `formatDateBR`, `parseDateBR`.
- Jest + RTL + MSW configurados; `npm test` executa um smoke test que verifica os helpers de formatação.
</requirements>

## Subtarefas

- [ ] 5.1 Instalar deps: `@tanstack/react-query`, `chart.js`, `react-chartjs-2`. Devs: `jest`, `@types/jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `msw`, `whatwg-fetch`.
- [ ] 5.2 Adicionar scripts `test` e `test:watch` em `package.json`.
- [ ] 5.3 Criar `jest.config.ts` (preset Next) e `jest.setup.ts` (importa `@testing-library/jest-dom`, configura MSW server).
- [ ] 5.4 Criar `app/lib/api-client.ts` (wrapper `fetch`, propaga `details`/`message` do backend, trata erros de rede).
- [ ] 5.5 Criar `app/lib/format.ts` (`formatCurrencyBRL`, `formatDateBR`, `parseDateBR`) com specs.
- [ ] 5.6 Criar `app/lib/chartjs-setup.ts` registrando controllers/escalas/elementos mínimos.
- [ ] 5.7 Criar `app/providers.tsx` com `QueryClientProvider` + provider de toast (client component).
- [ ] 5.8 Criar `app/components/Header.tsx` (nav fixa com links).
- [ ] 5.9 Criar `app/components/Toast.tsx` (componente acessível, dispatcher exportado).
- [ ] 5.10 Modificar `app/layout.tsx` envolvendo children com providers e header; injetar fontes Inter + Material Symbols.
- [ ] 5.11 Criar `app/__tests__/mocks/server.ts` e `handlers.ts` (MSW base) com wire-up no `jest.setup.ts`.
- [ ] 5.12 Adicionar `.env.example` com `NEXT_PUBLIC_API_BASE_URL`.
- [ ] 5.13 Validação de build e execução completa dos testes.

## Detalhes de Implementação

Ver `techspec.md` → "Visão Geral dos Componentes (Frontend)", "Pontos de Integração (chart.js)", "Riscos Conhecidos (Bundle size de chart.js)" e "Considerações Técnicas (TanStack Query)".

## Critérios de Sucesso

- `cd apps/frontend && npm run build` finaliza sem erros (Next 16 / React 19).
- `cd apps/frontend && npm run dev` inicia e serve `/` com header visível (mesmo que ainda placeholder).
- `cd apps/frontend && npm test` executa **todos** os testes presentes com sucesso.
- `cd apps/frontend && npm run lint` sem erros novos.
- Ao chamar `api-client` para um endpoint inexistente, o erro do backend é exposto com `message` e `details`.

## Testes da Tarefa

- [ ] Unidade: `app/lib/format.test.ts` — `formatCurrencyBRL(1234.56)` → `R$ 1.234,56`, `formatDateBR('2024-01-31')` → `31/01/2024`, `parseDateBR('31/12/2024')` → `'2024-12-31'`.
- [ ] Integração: `app/__tests__/api-client.test.ts` — sucesso e erro padronizado via MSW.
- [ ] Integração: `app/__tests__/Header.test.tsx` — links presentes e acessíveis.
- [ ] Validação final: `cd apps/frontend && npm run build && npm run lint && npm test` finaliza com sucesso.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `apps/frontend/package.json`
- `apps/frontend/jest.config.ts`
- `apps/frontend/jest.setup.ts`
- `apps/frontend/app/layout.tsx`
- `apps/frontend/app/providers.tsx`
- `apps/frontend/app/components/Header.tsx`
- `apps/frontend/app/components/Toast.tsx`
- `apps/frontend/app/lib/api-client.ts`
- `apps/frontend/app/lib/format.ts`
- `apps/frontend/app/lib/chartjs-setup.ts`
- `apps/frontend/app/__tests__/mocks/handlers.ts`
- `apps/frontend/app/__tests__/mocks/server.ts`
- `apps/frontend/.env.example`
